'use strict';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Canvas, IText, Rect, Circle, Triangle, Polygon, FabricImage } from 'fabric';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { getProductBySlug } from '@/lib/catalog';
import { 
  ArrowLeft, Type, Image as ImageIcon, Shapes, Sparkles, Check, 
  RefreshCw, RotateCw, ZoomIn, ZoomOut, Download, AlertCircle, ShoppingCart, 
  Trash2, Layers, Paintbrush, Sliders, Layout, QrCode
} from 'lucide-react';

export default function CanvasEditorClient() {
  const { slug } = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const router = useRouter();

  const productData = getProductBySlug(slug);
  const { product, category } = productData || { product: { name: '', slug: '', price: 0 }, category: { name: '', image: '' } };
  const isApparel = category.name === 'Apparel' || slug.includes('tshirt') || slug.includes('shirt') || slug.includes('polo');

  const [shirtColor, setShirtColor] = useState<'grey' | 'black' | 'blue'>('grey');

  // Configuration passed from details page
  const [qty, setQty] = useState<number>(Number(searchParams?.get('qty') || 100));
  const [corners, setCorners] = useState<string>(searchParams?.get('corners') || 'Square');
  const [deliverySpeed, setDeliverySpeed] = useState<string>(searchParams?.get('speed') || 'Standard');

  // Editor states
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [selectedTool, setSelectedTool] = useState<string>('product');
  const [activeObject, setActiveObject] = useState<any | null>(null);

  // Canvas JSON states for Front and Back sides
  const [frontJson, setFrontJson] = useState<string>('');
  const [backJson, setBackJson] = useState<string>('');

  // Color picker state for text / backgrounds
  const [fillColor, setFillColor] = useState<string>('#1A1A1A');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // QR Code generator inputs
  const [qrText, setQrText] = useState('https://infistyle.in');
  const [qrType, setQrType] = useState<'URL' | 'Text' | 'vCard'>('URL');

  // Preview Modal & Checkout Drawer states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [frontPreviewUrl, setFrontPreviewUrl] = useState('');
  const [backPreviewUrl, setBackPreviewUrl] = useState('');
  const [dragRotation, setDragRotation] = useState<{ x: number; y: number }>({ x: -15, y: 15 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedFinish, setSelectedFinish] = useState<string>('Standard Matte');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fabric Canvas references
  const canvasRef = useRef<Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvasWidth = isApparel ? 260 : 550;
    const canvasHeight = isApparel ? 130 : 350;
    const canvasBg = isApparel ? 'transparent' : '#ffffff';

    const canvas = new Canvas(canvasElRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: canvasBg,
      selection: true,
    });

    canvasRef.current = canvas;

    // Event listeners to update selection states in react
    const handleSelection = () => {
      const activeObj = canvas.getActiveObject();
      setActiveObject(activeObj || null);
      if (activeObj) {
        setFillColor(activeObj.get('fill') as string || '#1A1A1A');
      }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setActiveObject(null));

    // Load templates if any preselected
    const tplJson = sessionStorage.getItem('infistyle_selected_template');
    if (tplJson) {
      try {
        canvas.loadFromJSON(JSON.parse(tplJson)).then(() => {
          canvas.renderAll();
          setBackJson('{"objects":[]}');
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      setBackJson('{"objects":[]}');
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
    };
  }, [slug, isApparel]);

  if (!productData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="brand-card p-8 bg-white max-w-sm text-center">
          <h2 className="text-xl font-black text-dark-charcoal mb-2">Product Not Configured</h2>
          <p className="text-xs text-gray-500 mb-6 font-semibold">Missing product configuration parameter slug.</p>
          <Link href="/catalog" className="btn-primary text-xs">Browse Products</Link>
        </div>
      </div>
    );
  }



  // Toggle Front and Back Faces
  const handleToggleSide = (side: 'front' | 'back') => {
    if (!canvasRef.current || side === activeSide) return;

    const currentJson = JSON.stringify(canvasRef.current.toJSON());

    if (activeSide === 'front') {
      setFrontJson(currentJson);
      canvasRef.current.clear();
      if (backJson) {
        canvasRef.current.loadFromJSON(JSON.parse(backJson)).then(() => {
          canvasRef.current?.renderAll();
        });
      }
    } else {
      setBackJson(currentJson);
      canvasRef.current.clear();
      if (frontJson) {
        canvasRef.current.loadFromJSON(JSON.parse(frontJson)).then(() => {
          canvasRef.current?.renderAll();
        });
      }
    }

    setActiveSide(side);
  };

  // Add Text Layer
  const handleAddText = () => {
    if (!canvasRef.current) return;
    const text = new IText('Double click to edit', {
      left: 100,
      top: 150,
      fontFamily: 'Outfit',
      fontSize: 20,
      fill: fillColor,
    });
    canvasRef.current.add(text);
    canvasRef.current.setActiveObject(text);
    canvasRef.current.renderAll();
  };

  // Add Shapes / Graphics
  const handleAddShape = (shapeType: 'rect' | 'circle' | 'triangle' | 'star') => {
    if (!canvasRef.current) return;
    let shape: any;

    if (shapeType === 'rect') {
      shape = new Rect({
        left: 150,
        top: 120,
        width: 100,
        height: 80,
        fill: '#F5B800',
      });
    } else if (shapeType === 'circle') {
      shape = new Circle({
        left: 150,
        top: 120,
        radius: 50,
        fill: '#1A1A1A',
      });
    } else if (shapeType === 'triangle') {
      shape = new Triangle({
        left: 150,
        top: 120,
        width: 100,
        height: 100,
        fill: '#888888',
      });
    } else {
      // Star polygon path
      const points = [
        { x: 50, y: 0 },
        { x: 60, y: 35 },
        { x: 95, y: 35 },
        { x: 68, y: 57 },
        { x: 78, y: 91 },
        { x: 50, y: 70 },
        { x: 22, y: 91 },
        { x: 32, y: 57 },
        { x: 5, y: 35 },
        { x: 40, y: 35 }
      ];
      shape = new Polygon(points, {
        left: 150,
        top: 120,
        fill: '#F5B800',
      });
    }

    canvasRef.current.add(shape);
    canvasRef.current.setActiveObject(shape);
    canvasRef.current.renderAll();
  };

  // Upload Asset (Image)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvasRef.current || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (f) => {
      const data = f.target?.result as string;
      FabricImage.fromURL(data).then((img) => {
        img.scaleToWidth(150);
        img.set({
          left: 100,
          top: 100,
        });
        canvasRef.current?.add(img);
        canvasRef.current?.setActiveObject(img);
        canvasRef.current?.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  // Generate QR Code layer
  const handleGenerateQR = async () => {
    if (!canvasRef.current) return;
    try {
      let dataString = qrText;
      if (qrType === 'vCard') {
        dataString = `BEGIN:VCARD\nVERSION:3.0\nFN:Infistyle Client\nEMAIL:hello@infistyle.in\nURL:${qrText}\nEND:VCARD`;
      }
      const dataUrl = await QRCode.toDataURL(dataString, { margin: 1 });
      FabricImage.fromURL(dataUrl).then((img) => {
        img.scaleToWidth(100);
        img.set({
          left: 200,
          top: 120,
        });
        canvasRef.current?.add(img);
        canvasRef.current?.setActiveObject(img);
        canvasRef.current?.renderAll();
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Background color change
  const handleBgChange = (color: string) => {
    if (!canvasRef.current) return;
    setBgColor(color);
    canvasRef.current.backgroundColor = color;
    canvasRef.current.renderAll();
  };

  // Object Operations
  const handleFillChange = (color: string) => {
    if (!canvasRef.current || !activeObject) return;
    setFillColor(color);
    activeObject.set('fill', color);
    canvasRef.current.renderAll();
  };

  const handleFitObject = () => {
    if (!canvasRef.current || !activeObject) return;
    activeObject.set({
      left: 0,
      top: 0,
    });
    activeObject.scaleToWidth(canvasRef.current.getWidth());
    canvasRef.current.renderAll();
  };

  const handleDeleteObject = () => {
    if (!canvasRef.current || !activeObject) return;
    canvasRef.current.remove(activeObject);
    canvasRef.current.discardActiveObject();
    canvasRef.current.renderAll();
    setActiveObject(null);
  };

  // Mock AI operations
  const [aiLoading, setAiLoading] = useState(false);
  const handleAIAction = (actionName: string) => {
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setToastMessage(`${actionName} applied successfully by Infistyle AI Engine.`);
      setTimeout(() => setToastMessage(''), 3000);
    }, 1500);
  };

  // 3D Rotator Mouse Drag logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    
    setDragRotation({
      x: dragRotation.x - deltaY * 0.5,
      y: dragRotation.y + deltaX * 0.5
    });

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render high-res snapshots of front and back designs for the 3D rotating preview
  const handleOpenPreview = async () => {
    if (!canvasRef.current) return;
    setPreviewLoading(true);

    const originalSide = activeSide;
    const currentJson = JSON.stringify(canvasRef.current.toJSON());

    let fJson = activeSide === 'front' ? currentJson : frontJson;
    let bJson = activeSide === 'back' ? currentJson : backJson;

    try {
      // 1. Render and export Front side
      if (fJson) {
        await canvasRef.current.loadFromJSON(JSON.parse(fJson));
      } else {
        canvasRef.current.clear();
        canvasRef.current.backgroundColor = '#ffffff';
      }
      canvasRef.current.renderAll();
      const fDataUrl = canvasRef.current.toDataURL({ format: 'png', quality: 1.0, multiplier: 1.5 });
      setFrontPreviewUrl(fDataUrl);

      // 2. Render and export Back side
      if (bJson && bJson !== '{"objects":[]}') {
        await canvasRef.current.loadFromJSON(JSON.parse(bJson));
        canvasRef.current.renderAll();
        const bDataUrl = canvasRef.current.toDataURL({ format: 'png', quality: 1.0, multiplier: 1.5 });
        setBackPreviewUrl(bDataUrl);
      } else {
        setBackPreviewUrl('');
      }

      // 3. Restore active canvas state
      await canvasRef.current.loadFromJSON(JSON.parse(currentJson));
      canvasRef.current.renderAll();
    } catch (err) {
      console.error('Error generating 3D previews:', err);
    }

    setPreviewLoading(false);
    setPreviewOpen(true);
  };

  // PDF proof generator (async/await compatible with Fabric v6)
  const handleDownloadPDF = async () => {
    if (!canvasRef.current) return;

    const currentJson = JSON.stringify(canvasRef.current.toJSON());
    let fJson = activeSide === 'front' ? currentJson : frontJson;
    let bJson = activeSide === 'back' ? currentJson : backJson;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [91, 55] // standard card dimensions
    });

    // Render Front page snapshot
    if (fJson) {
      await canvasRef.current.loadFromJSON(JSON.parse(fJson));
    }
    canvasRef.current.renderAll();
    const fImg = canvasRef.current.toDataURL({ format: 'png', quality: 1.0, multiplier: 1 });
    pdf.addImage(fImg, 'PNG', 0, 0, 91, 55);

    // Render Back page snapshot
    pdf.addPage([91, 55], 'landscape');
    if (bJson && bJson !== '{"objects":[]}') {
      await canvasRef.current.loadFromJSON(JSON.parse(bJson));
      canvasRef.current.renderAll();
    } else {
      canvasRef.current.clear();
      canvasRef.current.backgroundColor = '#ffffff';
      canvasRef.current.renderAll();
    }
    const bImg = canvasRef.current.toDataURL({ format: 'png', quality: 1.0, multiplier: 1 });
    pdf.addImage(bImg, 'PNG', 0, 0, 91, 55);
    pdf.save(`${product.slug}_print_proof.pdf`);

    // Restore original active canvas view
    await canvasRef.current.loadFromJSON(JSON.parse(currentJson));
    canvasRef.current.renderAll();
  };

  // Add Item to local storage shopping cart
  const handleAddToCart = () => {
    if (!isAuthorized) {
      alert("Please check authorization credentials box before checking out.");
      return;
    }

    const currentJson = JSON.stringify(canvasRef.current?.toJSON());
    const finalFront = activeSide === 'front' ? currentJson : frontJson;
    const finalBack = activeSide === 'back' ? currentJson : backJson;

    const cartItem = {
      id: Math.random().toString(36).substring(7),
      productName: product.name,
      productSlug: product.slug,
      qty,
      corners,
      finish: selectedFinish,
      speed: deliverySpeed,
      unitPrice: (product.price + (selectedFinish.includes('Premium') ? 100 : 0)) / 100, // mock price adjustments
      frontJson: finalFront,
      backJson: finalBack,
      thumbnail: category.image
    };

    const existing = localStorage.getItem('infistyle_cart');
    const cart = existing ? JSON.parse(existing) : [];
    cart.push(cartItem);
    localStorage.setItem('infistyle_cart', JSON.stringify(cart));

    setCheckoutOpen(false);
    setToastMessage('Item added to cart!');
    setTimeout(() => {
      setToastMessage('');
      router.push('/cart');
    }, 1500);
  };

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-white select-none">

      
      {/* 1. Header Toolbar */}
      <div className="h-14 bg-white border-b-2 border-primary flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <Link href={`/product/${slug}`} className="p-1 border-2 border-primary rounded-full hover:bg-yellow-50">
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <span className="font-extrabold text-sm text-dark-charcoal tracking-tight">
            {product.name} — Editor
          </span>
        </div>

        {toastMessage && (
          <div className="bg-primary text-dark-charcoal font-bold text-xs py-1.5 px-4 rounded-full border border-dark-charcoal animate-bounce">
            {toastMessage}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenPreview}
            disabled={previewLoading}
            className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {previewLoading && (
              <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></span>
            )}
            Preview 3D
          </button>
          <button
            onClick={() => setCheckoutOpen(true)}
            className="btn-primary py-1.5 px-6 text-xs uppercase"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* 2. Left Menu Icons panel */}
        <div className="w-16 bg-white border-r border-yellow-100 flex flex-col items-center py-4 gap-4 z-10">
          {[
            { id: 'product', label: 'Product', icon: Layout },
            { id: 'text', label: 'Text', icon: Type },
            { id: 'uploads', label: 'Uploads', icon: ImageIcon },
            { id: 'graphics', label: 'Graphics', icon: Shapes },
            { id: 'bg', label: isApparel ? 'Color' : 'BgColor', icon: Paintbrush },
            { id: 'qr', label: 'QR-Code', icon: QrCode }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTool(t.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center w-12 h-12 transition-all ${
                  selectedTool === t.id
                    ? 'bg-primary text-dark-charcoal'
                    : 'text-gray-400 hover:bg-yellow-50 hover:text-dark-charcoal'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[8px] font-black uppercase mt-1">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Left Tool Configurations Drawer */}
        <div className="w-64 bg-white border-r-2 border-primary overflow-y-auto p-4 z-10 space-y-6">
          
          {/* Tool: Product options */}
          {selectedTool === 'product' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-dark-charcoal uppercase tracking-wider">Product Info</h3>
              <div className="text-[10px] space-y-1 bg-yellow-50/20 border border-primary/20 p-3 rounded-lg font-bold text-gray-500">
                <p>Category: {category.name}</p>
                <p>Quantity: {qty} units</p>
                <p>Corners: {corners}</p>
                <p>Speed: {deliverySpeed}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wide text-gray-500">Modify Quantity</label>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full input-brand text-xs py-1.5 font-bold"
                >
                  <option value={100}>100 units</option>
                  <option value={200}>200 units</option>
                  <option value={500}>500 units</option>
                  <option value={1000}>1000 units</option>
                </select>
              </div>
            </div>
          )}

          {/* Tool: Text */}
          {selectedTool === 'text' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-dark-charcoal uppercase tracking-wider">Text Layers</h3>
              <button onClick={handleAddText} className="w-full btn-primary text-xs py-2">
                Add Text Box
              </button>
            </div>
          )}

          {/* Tool: Uploads */}
          {selectedTool === 'uploads' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-dark-charcoal uppercase tracking-wider">Upload Images</h3>
              <label className="w-full border-2 border-dashed border-primary hover:bg-yellow-50/10 p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer text-center group">
                <ImageIcon className="h-6 w-6 text-primary group-hover:scale-105 transition-transform" />
                <span className="text-[10px] font-bold text-gray-600 mt-2 block">Choose image file</span>
                <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
              </label>
            </div>
          )}

          {/* Tool: Graphics */}
          {selectedTool === 'graphics' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-dark-charcoal uppercase tracking-wider">Add Shape</h3>
              <div className="grid grid-cols-2 gap-2">
                {['rect', 'circle', 'triangle', 'star'].map((shape) => (
                  <button
                    key={shape}
                    onClick={() => handleAddShape(shape as any)}
                    className="p-3 border border-yellow-200 hover:border-primary rounded-xl flex items-center justify-center bg-zinc-50 capitalize text-[10px] font-black text-dark-charcoal"
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tool: Bg Color / Shirt Color */}
          {selectedTool === 'bg' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-dark-charcoal uppercase tracking-wider">
                {isApparel ? 'Shirt Color' : 'Card Background'}
              </h3>
              {isApparel ? (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'grey', label: 'Grey', value: '#8A8A8A' },
                    { name: 'black', label: 'Black', value: '#1A1A1A' },
                    { name: 'blue', label: 'Navy Blue', value: '#003366' },
                  ].map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setShirtColor(color.name as any)}
                      className={`flex flex-col items-center justify-center p-2.5 border-2 rounded-xl transition-all ${
                        shirtColor === color.name ? 'border-primary bg-yellow-50/20 font-black' : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-[9px] mt-1 text-dark-charcoal capitalize font-extrabold">{color.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {['#ffffff', '#1a1a1a', '#F5B800', '#0055ff', '#ea4335', '#34a853', '#fffbf0', '#faf3e0', '#f4f4f5', '#e2e8f0'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleBgChange(color)}
                      className="w-8 h-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tool: QR-Codes */}
          {selectedTool === 'qr' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-dark-charcoal uppercase tracking-wider">QR Code Creator</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500">Payload Type</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['URL', 'vCard'].map(type => (
                    <button
                      key={type}
                      onClick={() => setQrType(type as any)}
                      className={`text-[9px] py-1 rounded font-bold transition-all ${
                        qrType === type ? 'bg-primary text-dark-charcoal' : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500">QR Content</label>
                <textarea
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  className="w-full input-brand text-xs py-1.5 h-16 font-bold"
                  placeholder="https://..."
                />
              </div>
              <button onClick={handleGenerateQR} className="w-full btn-primary text-xs py-2">
                Insert QR Code
              </button>
            </div>
          )}

        </div>

        {/* 4. Canvas Workbench Area */}
        <div className="flex-1 overflow-auto flex flex-col items-center justify-center relative p-8">
          
          {/* Top Selection / Edit Action Toolbar */}
          <div className="absolute top-4 left-4 right-4 bg-white border border-primary/20 p-2.5 rounded-2xl flex items-center justify-between shadow-sm z-10 text-xs font-bold text-gray-600">
            {activeObject ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase">Color</span>
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => handleFillChange(e.target.value)}
                    className="w-6 h-6 border-0 p-0 rounded cursor-pointer bg-transparent"
                  />
                </div>

                <button onClick={handleFitObject} className="flex items-center gap-1 hover:text-primary transition-colors text-[11px]">
                  <Layers className="h-4 w-4" /> Fit Screen
                </button>

                <div className="h-4 w-px bg-zinc-200"></div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase">AI Filters</span>
                  <button
                    onClick={() => handleAIAction('Enhance Image')}
                    disabled={aiLoading}
                    className="hover:text-primary transition-colors text-[11px] disabled:opacity-50"
                  >
                    Edit with AI
                  </button>
                  <button
                    onClick={() => handleAIAction('Remove BG')}
                    disabled={aiLoading}
                    className="hover:text-primary transition-colors text-[11px] disabled:opacity-50"
                  >
                    Remove BG
                  </button>
                </div>

                <div className="h-4 w-px bg-zinc-200"></div>

                <button onClick={handleDeleteObject} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-[11px]">
                  <Trash2 className="h-4 w-4" /> Delete Layer
                </button>
              </div>
            ) : (
              <div className="text-gray-400 font-semibold text-xs text-center w-full">
                Select an element on the canvas to configure styling parameters.
              </div>
            )}
          </div>

          {/* Dynamic Workbench Mockup container (Shirt model background or white Business Card bounds) */}
          {isApparel ? (
            <div className="relative w-[500px] h-[500px] bg-zinc-50 border-2 border-primary rounded-3xl overflow-hidden flex items-center justify-center shadow-lg">
              {/* Background Model Mockup Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  shirtColor === 'black'
                    ? (activeSide === 'front' ? '/ai_model_polo_black_front.png' : '/ai_model_polo_black_back.png')
                    : shirtColor === 'blue'
                    ? (activeSide === 'front' ? '/ai_model_polo_tshirt.png' : '/ai_model_polo_blue_back.png')
                    : (activeSide === 'front' ? '/ai_model_polo_grey_front.png' : '/ai_model_polo_grey_back.png')
                }
                alt="Shirt Mockup"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
              />

              {/* Print Area Guide Border */}
              <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[264px] h-[134px] border border-dashed border-cyan-400 bg-transparent pointer-events-none z-10">
                <span className="absolute -top-4 left-0 text-[8px] font-bold text-cyan-400 tracking-wider bg-dark-charcoal/80 px-1.5 py-0.5 rounded">
                  Safety Area (10.16cm x 25.4cm)
                </span>
              </div>

              {/* Fabric Canvas positioned absolutely over the chest print area */}
              <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[130px] z-20">
                <canvas ref={canvasElRef} />
              </div>
            </div>
          ) : (
            <div className="relative p-8 bg-white shadow-xl border-2 border-primary rounded-2xl animate-fade-in">
              {/* Safety Area guide overlay (4px inner margin) */}
              <div className="absolute top-[36px] left-[36px] w-[542px] h-[342px] border-2 border-dashed border-yellow-500/50 pointer-events-none z-10">
                <span className="absolute -top-5 left-1 text-[8px] font-black uppercase text-yellow-500/80 tracking-wider">
                  Safety Margin Boundary
                </span>
              </div>

              {/* Bleed Guide overlay */}
              <div className="absolute top-[32px] left-[32px] w-[550px] h-[350px] border-2 border-blue-500/50 pointer-events-none z-10">
                <span className="absolute bottom-1 right-2 text-[8px] font-black uppercase text-blue-500/80 tracking-wider">
                  Bleed Limit Boundary
                </span>
              </div>

              <canvas ref={canvasElRef} />
            </div>
          )}

          {/* Zoom controls / info footer */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white px-4 py-2 border border-primary/20 rounded-full shadow-sm text-xs font-bold text-gray-500">
            <button className="hover:text-primary"><ZoomOut className="h-4 w-4" /></button>
            <span className="text-dark-charcoal">100% Zoom</span>
            <button className="hover:text-primary"><ZoomIn className="h-4 w-4" /></button>
          </div>
        </div>

        {/* 5. Right Sidebar (Front / Back toggle thumbnails) */}
        <div className="w-24 bg-white border-l border-yellow-100 p-4 flex flex-col items-center gap-6 z-10">
          <div className="space-y-4 w-full">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center block">Faces</span>
            
            {/* Front Thumbnail */}
            <button
              onClick={() => handleToggleSide('front')}
              className={`w-full aspect-[4/3] rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center p-1 bg-white ${
                activeSide === 'front' ? 'border-primary shadow-md' : 'border-gray-200 hover:border-primary'
              }`}
            >
              <div className="h-2 w-full bg-zinc-200 mb-1 rounded-sm"></div>
              <span className="text-[8px] font-black uppercase text-dark-charcoal">Front</span>
            </button>

            {/* Back Thumbnail */}
            <button
              onClick={() => handleToggleSide('back')}
              className={`w-full aspect-[4/3] rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center p-1 bg-white ${
                activeSide === 'back' ? 'border-primary shadow-md' : 'border-gray-200 hover:border-primary'
              }`}
            >
              <div className="h-2 w-full bg-zinc-200 mb-1 rounded-sm"></div>
              <span className="text-[8px] font-black uppercase text-dark-charcoal">Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. 360 3D Rotator Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-dark-charcoal/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-dark-charcoal/90 p-8 rounded-3xl border-2 border-primary text-white flex flex-col items-center">
            
            {/* Header controls inside modal */}
            <div className="w-full flex justify-between items-center mb-10">
              <button
                onClick={handleDownloadPDF}
                className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" /> Download PDF Proof
              </button>
              
              <span className="text-xs font-bold text-gray-400">Drag space around card to rotate 360°</span>
              
              <button onClick={() => setPreviewOpen(false)} className="text-white hover:text-primary font-bold text-sm">
                ✕ Close
              </button>
            </div>

            {/* 3D Container viewport */}
            <div 
              className="w-full h-80 flex items-center justify-center perspective-[1200px]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* CSS 3D Card flips based on rotateX / rotateY states */}
              <div 
                className={`w-[450px] h-[280px] relative select-none cursor-grab active:cursor-grabbing preserve-3d ${
                  isDragging ? 'transition-none' : 'transition-transform duration-500 ease-out'
                }`}
                style={{
                  transform: `rotateY(${dragRotation.y}deg) rotateX(${dragRotation.x}deg)`
                }}
              >
                {/* Front face of card */}
                <div className="absolute inset-0 bg-white text-dark-charcoal rounded-xl border border-yellow-500/30 flex flex-col items-center justify-center backface-hidden shadow-2xl overflow-hidden">
                  <div className="absolute top-4 z-10 text-center font-extrabold text-[10px] uppercase tracking-widest text-primary border border-primary/50 bg-white/90 px-2.5 py-0.5 rounded shadow-sm">
                    FRONT DESIGN PREVIEW
                  </div>
                  {frontPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={frontPreviewUrl} alt="front" className="w-full h-full object-contain bg-white" />
                  ) : (
                    <div className="text-xs text-gray-400 font-bold">Rendering front design...</div>
                  )}
                </div>

                {/* Back face of card (rotated 180 deg Y) */}
                <div className="absolute inset-0 bg-white text-dark-charcoal rounded-xl border border-yellow-500/30 flex flex-col items-center justify-center backface-hidden shadow-2xl rotate-y-180 overflow-hidden">
                  <div className="absolute top-4 z-10 text-center font-extrabold text-[10px] uppercase tracking-widest text-primary border border-primary/50 bg-white/90 px-2.5 py-0.5 rounded shadow-sm">
                    BACK DESIGN PREVIEW
                  </div>
                  {backPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={backPreviewUrl} alt="back" className="w-full h-full object-contain bg-white" />
                  ) : (
                    <div className="text-center font-bold text-gray-400 text-xs">
                      <p>Blank Back Side</p>
                      <span className="text-[10px] text-gray-300 font-semibold mt-1 block">No custom design added to back</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Manual orientation helpers */}
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setDragRotation({ x: 0, y: 0 })}
                className="px-4 py-1.5 bg-zinc-800 text-xs rounded-full hover:bg-zinc-700 font-bold"
              >
                Show Front
              </button>
              <button 
                onClick={() => setDragRotation({ x: 0, y: 180 })}
                className="px-4 py-1.5 bg-zinc-800 text-xs rounded-full hover:bg-zinc-700 font-bold"
              >
                Show Back
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. Review & Checkout Side Drawer */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-dark-charcoal/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white border-l-4 border-primary p-6 h-full overflow-y-auto flex flex-col justify-between">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-yellow-100">
                <h2 className="text-lg font-black text-dark-charcoal">Review Your Design</h2>
                <button onClick={() => setCheckoutOpen(false)} className="text-gray-400 hover:text-dark-charcoal font-bold text-lg">✕</button>
              </div>

              {/* Quality Checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary">Quality Checklist</h3>
                <div className="text-xs text-gray-500 space-y-2 bg-yellow-50/10 p-4 border border-primary/20 rounded-xl font-bold">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-primary" defaultChecked />
                    <span>Double checked all spelling and grammar.</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-primary" defaultChecked />
                    <span>Important design layers are within the safety area borders.</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-primary" defaultChecked />
                    <span>Images and graphics resolution looks sharp.</span>
                  </label>
                </div>
              </div>

              {/* Finishing stock selection */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary">Paper Stock & Finish</h3>
                <select
                  value={selectedFinish}
                  onChange={(e) => setSelectedFinish(e.target.value)}
                  className="w-full input-brand text-xs py-2 font-bold"
                >
                  <option value="Standard Glossy">Standard Glossy Paper (Free)</option>
                  <option value="Standard Matte">Standard Matte Paper (Free)</option>
                  <option value="Premium Glossy Laminated">Premium Glossy Laminated (+₹100.00)</option>
                  <option value="Premium Matte Laminated">Premium Matte Laminated (+₹120.00)</option>
                  <option value="Premium Plus Glossy">Premium Plus Extra Glossy (+₹180.00)</option>
                </select>
              </div>

              {/* Legal confirmation */}
              <div className="p-4 border-2 border-red-200 bg-red-50/10 rounded-xl space-y-3">
                <h4 className="text-xs font-extrabold text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> Copyright Authorization
                </h4>
                <label className="flex items-start gap-2.5 text-xs text-gray-500 font-bold leading-relaxed cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAuthorized}
                    onChange={(e) => setIsAuthorized(e.target.checked)}
                    className="mt-1 accent-primary flex-shrink-0" 
                  />
                  <span>I declare that I have full authorization and rights to print the logos, texts, and assets submitted in this design.</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-yellow-100 flex gap-4">
              <button 
                onClick={() => setCheckoutOpen(false)}
                className="flex-1 btn-secondary text-xs py-3"
              >
                Go Back
              </button>
              <button 
                onClick={handleAddToCart}
                className="flex-1 btn-primary text-xs py-3 uppercase flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Extra styles for card preview Y-flipping backface concealment */}
      <style jsx global>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .perspective-\[1200px\] {
          perspective: 1200px;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
