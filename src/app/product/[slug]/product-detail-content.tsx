'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/aws/api';
import { getProductBySlug } from '@/lib/catalog';
import { Star, Truck, Check, ChevronDown, ChevronUp, Layers, HelpCircle, FileDown, Upload } from 'lucide-react';

export default function ProductDetailContent() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();


  const productData = getProductBySlug(slug);
  const [dbProduct, setDbProduct] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  const [selectedQty, setSelectedQty] = useState<number>(100);
  const [selectedCorners, setSelectedCorners] = useState<string>('Square');
  const [deliverySpeed, setDeliverySpeed] = useState<'Standard' | 'SameDay'>('Standard');
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [pincodeValid, setPincodeValid] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    const fetchDbProduct = async () => {
      try {
        const res = await api.getCatalog();
        if (res && res.categories) {
          let found: any = null;
          for (const cat of res.categories) {
            const item = cat.items.find((i: any) => i.slug === slug);
            if (item) {
              found = {
                name: item.name,
                slug: item.slug,
                base_price: item.price,
                features: item.features,
                category: cat.name,
                images: [cat.image],
              };
              break;
            }
          }
          if (found) {
            setDbProduct(found);
            setLoadingDb(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching dynamic product details from Hono API:', err);
      }

      // Check localStorage fallback
      try {
        const localProdsJson = localStorage.getItem('infistyle_custom_products');
        if (localProdsJson) {
          const localProds = JSON.parse(localProdsJson);
          const found = localProds.find((p: any) => p.slug === slug);
          if (found) {
            setDbProduct(found);
          }
        }
      } catch (err) {
        console.error('Error loading custom product from localStorage:', err);
      }

      setLoadingDb(false);
    };

    fetchDbProduct();
  }, [slug]);

  if (loadingDb) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!productData && !dbProduct) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-dark-charcoal mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-8 font-semibold">The product slug you are trying to configure does not exist.</p>
        <Link href="/catalog" className="btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const category = productData?.category || {
    name: dbProduct?.category || 'Custom Prints',
    image: dbProduct?.images?.[0] || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  };

  const product: {
    name: string;
    price: number;
    features: string[];
    images: string[];
    slug: string;
  } = dbProduct 
    ? {
        name: dbProduct.name,
        price: Number(dbProduct.base_price),
        features: dbProduct.features || [],
        images: dbProduct.images || [],
        slug: dbProduct.slug
      }
    : {
        name: productData!.product.name,
        price: productData!.product.price,
        features: productData!.product.features,
        images: productData!.product.images || [],
        slug: productData!.product.slug
      };

  const galleryImages: string[] = product.images && product.images.length > 0
    ? product.images
    : [
        category.image,
        'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
      ];

  const currentDisplayImage = activeImage || galleryImages[0];

  // Real-time Pricing Calculations
  const calculatePrice = () => {
    let unitMultiplier = 1;
    if (selectedQty === 200) unitMultiplier = 1.8;
    else if (selectedQty === 500) unitMultiplier = 4.0;
    else if (selectedQty === 1000) unitMultiplier = 7.5;
    else if (selectedQty === 2000) unitMultiplier = 14.0;
    else if (selectedQty === 5000) unitMultiplier = 32.0;

    let base = product.price * unitMultiplier;
    
    // Add-on charges
    if (selectedCorners === 'Rounded') base += (50 * (selectedQty / 100));
    if (deliverySpeed === 'SameDay') base += 150;

    return base;
  };

  const totalPrice = calculatePrice();
  const pricePerUnit = totalPrice / selectedQty;

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode)) {
      setPincodeValid(true);
      setPincodeChecked(true);
      
      const today = new Date();
      const deliveryDays = deliverySpeed === 'SameDay' ? 1 : 3;
      const targetDate = new Date(today.setDate(today.getDate() + deliveryDays));
      const formattedDate = targetDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      setDeliveryEstimate(formattedDate);
    } else {
      setPincodeValid(false);
      setPincodeChecked(true);
    }
  };

  const handleBrowseDesigns = () => {
    router.push(
      `/product/${slug}/templates?qty=${selectedQty}&corners=${selectedCorners}&speed=${deliverySpeed}`
    );
  };

  const handleUploadDesign = () => {
    router.push(
      `/editor/${slug}?mode=upload&qty=${selectedQty}&corners=${selectedCorners}&speed=${deliverySpeed}`
    );
  };

  const toggleAccordion = (name: string) => {
    setActiveAccordion(activeAccordion === name ? null : name);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 font-bold mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>&gt;</span>
        <Link href={`/catalog?category=${category.name}`} className="hover:text-primary transition-colors">{category.name}</Link>
        <span>&gt;</span>
        <span className="text-dark-charcoal">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="brand-card bg-yellow-50/10 overflow-hidden aspect-[4/3] relative flex items-center justify-center border-4 border-primary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentDisplayImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-3">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`brand-card p-1 aspect-square bg-white border-2 hover:scale-105 transition-transform ${
                  currentDisplayImage === img ? 'border-primary shadow-sm' : 'border-gray-200'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="thumbnail" className="w-full h-full object-cover rounded-lg" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Configurator Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h1 className="text-3xl font-black text-dark-charcoal tracking-tight">
              {product.name}
            </h1>
            
            {/* Ratings Mock */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex text-primary">
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
                <Star className="h-4.5 w-4.5 fill-current" />
              </div>
              <span className="text-xs text-gray-500 font-bold">4.9 (1,441 reviews)</span>
            </div>
          </div>

          {/* Product Bullet Points */}
          <ul className="text-xs text-gray-500 font-semibold space-y-2 border-b-2 border-yellow-50 pb-5">
            {product.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>COD and online payment options available</span>
            </li>
          </ul>

          {/* Price Breakdown */}
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-black uppercase tracking-widest">Pricing</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-dark-charcoal">₹{totalPrice.toFixed(2)}</span>
              <span className="text-xs text-gray-500 font-bold">
                (₹{pricePerUnit.toFixed(2)} / unit)
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold">Includes custom design layers setup. GST (18%) calculated at checkout.</p>
          </div>

          {/* Pincode eligibility verification */}
          <div className="brand-card p-4 bg-yellow-50/10">
            <h3 className="text-xs font-black text-dark-charcoal uppercase tracking-wider mb-2 flex items-center gap-1">
              <Truck className="h-4 w-4 text-primary" /> Delivery Estimate Check
            </h3>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                className="flex-grow input-brand text-xs py-2"
              />
              <button type="submit" className="btn-primary text-xs py-2 px-4 rounded-lg">
                Verify
              </button>
            </form>
            {pincodeChecked && (
              <p className={`text-xs mt-2 font-bold ${pincodeValid ? 'text-green-600' : 'text-red-500'}`}>
                {pincodeValid 
                  ? `Deliverable! Est. arrival by: ${deliveryEstimate}` 
                  : 'Invalid pincode. Please provide a valid 6-digit code.'}
              </p>
            )}
          </div>

          {/* Configuration Form */}
          <div className="space-y-4">
            
            {/* Delivery Speed Selector */}
            <div>
              <span className="text-xs text-gray-500 font-black uppercase tracking-wider block mb-2">Delivery Speed</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliverySpeed('Standard')}
                  className={`flex flex-col items-start p-3 border-2 rounded-xl text-left transition-all ${
                    deliverySpeed === 'Standard'
                      ? 'border-primary bg-yellow-50/20'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  <span className="text-xs font-black text-dark-charcoal">Standard Delivery</span>
                  <span className="text-[10px] text-gray-500 font-bold mt-1">FREE (3-5 Business Days)</span>
                </button>
                <button
                  onClick={() => setDeliverySpeed('SameDay')}
                  className={`flex flex-col items-start p-3 border-2 rounded-xl text-left transition-all ${
                    deliverySpeed === 'SameDay'
                      ? 'border-primary bg-yellow-50/20'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  <span className="text-xs font-black text-dark-charcoal">Same Day / Next Day</span>
                  <span className="text-[10px] text-gray-500 font-bold mt-1">+₹150.00 (Express Shipping)</span>
                </button>
              </div>
            </div>

            {/* Corner Style Selector */}
            <div>
              <span className="text-xs text-gray-500 font-black uppercase tracking-wider block mb-2">Corners Style</span>
              <select
                value={selectedCorners}
                onChange={(e) => setSelectedCorners(e.target.value)}
                className="w-full input-brand text-xs py-2 font-bold"
              >
                <option value="Square">Standard Square Corners (Free)</option>
                <option value="Rounded">Quarter-Inch Rounded Corners (+₹50.00 per 100 cards)</option>
              </select>
            </div>

            {/* Quantity Selector */}
            <div>
              <span className="text-xs text-gray-500 font-black uppercase tracking-wider block mb-2">Quantity</span>
              <select
                value={selectedQty}
                onChange={(e) => setSelectedQty(Number(e.target.value))}
                className="w-full input-brand text-xs py-2 font-bold"
              >
                <option value={100}>100 units</option>
                <option value={200}>200 units (10% bulk discount)</option>
                <option value={500}>500 units (20% bulk discount)</option>
                <option value={1000}>1000 units (25% bulk discount)</option>
              </select>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={handleBrowseDesigns}
              className="w-full btn-primary py-3.5 text-sm uppercase tracking-wider"
            >
              Browse Design Templates
            </button>
            <button
              onClick={handleUploadDesign}
              className="w-full btn-secondary py-3.5 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Upload className="h-4.5 w-4.5" />
              Upload Your Own Design
            </button>
          </div>

          {/* Expandable Info Accordions */}
          <div className="border-t border-yellow-100 pt-6 mt-6 space-y-2.5">
            {/* Accordion 1 */}
            <div className="border-2 border-primary rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('specs')}
                className="w-full bg-yellow-50/20 px-4 py-3 flex justify-between items-center text-xs font-black text-dark-charcoal uppercase tracking-wider"
              >
                <span>Specs & Templates</span>
                {activeAccordion === 'specs' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === 'specs' && (
                <div className="p-4 text-xs text-gray-500 space-y-2 leading-relaxed bg-white border-t border-primary/20 font-medium">
                  <p><strong>Print Size:</strong> 91mm x 55mm (Standard cut)</p>
                  <p><strong>Bleed Area:</strong> 95mm x 59mm (2mm margins outer)</p>
                  <p><strong>Safety Margins:</strong> 87mm x 51mm (Ensure all text rests inside this box)</p>
                  <p><strong>Resolution:</strong> Minimum 300 DPI vectors or images</p>
                </div>
              )}
            </div>

            {/* Accordion 2 */}
            <div className="border-2 border-primary rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('options')}
                className="w-full bg-yellow-50/20 px-4 py-3 flex justify-between items-center text-xs font-black text-dark-charcoal uppercase tracking-wider"
              >
                <span>Product Finishing Options</span>
                {activeAccordion === 'options' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === 'options' && (
                <div className="p-4 text-xs text-gray-500 space-y-2 leading-relaxed bg-white border-t border-primary/20 font-medium">
                  <p><strong>Lamination:</strong> Choose from standard glossy or matte finishes at the review step.</p>
                  <p><strong>Cardstock:</strong> Printed on ultra-thick 350 GSM archival board paper.</p>
                  <p><strong>Packaging:</strong> Dispatched in protective rigid paper containers to ensure zero corner folds.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
