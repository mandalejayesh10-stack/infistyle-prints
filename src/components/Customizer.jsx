import React, { useState, useEffect, useRef } from 'react';

// Bespoke templates for different categories
const PRODUCT_TEMPLATES = {
  'visiting-cards': [
    {
      id: 'vc-blank',
      name: 'Start from Scratch',
      bg: '#ffffff',
      elements: []
    },
    {
      id: 'vc-navy',
      name: 'Corporate Navy Slate',
      bg: '#0f172a',
      elements: [
        { id: 'logo-1', type: 'graphic', content: 'globe', x: 40, y: 40, width: 40, height: 40, rotation: 0, color: '#ffcc00', isLocked: false },
        { id: 'comp-name', type: 'text', content: 'NEXUS INDUSTRIES', x: 95, y: 45, width: 220, height: 30, fontSize: 16, fontFamily: 'Outfit', fontWeight: 'bold', color: '#ffffff', rotation: 0, isLocked: false },
        { id: 'name', type: 'text', content: 'Mansi Shetty', x: 40, y: 120, width: 200, height: 35, fontSize: 24, fontFamily: 'Outfit', fontWeight: 'bold', color: '#ffcc00', rotation: 0, isLocked: false },
        { id: 'title', type: 'text', content: 'Head of Marketing', x: 40, y: 155, width: 200, height: 20, fontSize: 11, fontFamily: 'Outfit', fontWeight: '600', color: '#94a3b8', rotation: 0, isLocked: false },
        { id: 'divider', type: 'shape', content: 'rect-solid', x: 40, y: 190, width: 440, height: 2, rotation: 0, color: 'rgba(255,255,255,0.15)', isLocked: true },
        { id: 'phone', type: 'text', content: '📞 +91 98765 01234', x: 40, y: 210, width: 140, height: 18, fontSize: 10, fontFamily: 'Outfit', color: '#ffffff', rotation: 0, isLocked: false },
        { id: 'email', type: 'text', content: '✉️ mansi.s@nexus.com', x: 200, y: 210, width: 150, height: 18, fontSize: 10, fontFamily: 'Outfit', color: '#ffffff', rotation: 0, isLocked: false },
        { id: 'addr', type: 'text', content: '📍 BKC G-Block, Mumbai - 400051', x: 40, y: 235, width: 300, height: 18, fontSize: 10, fontFamily: 'Outfit', color: '#ffffff', rotation: 0, isLocked: false }
      ]
    },
    {
      id: 'vc-gold',
      name: 'Luxury Royal Gold',
      bg: '#111111',
      elements: [
        { id: 'gold-border', type: 'shape', content: 'rect-border', x: 15, y: 15, width: 490, height: 270, rotation: 0, color: '#d4af37', isLocked: true },
        { id: 'logo-2', type: 'graphic', content: 'shield', x: 240, y: 55, width: 40, height: 40, rotation: 0, color: '#d4af37', isLocked: false },
        { id: 'comp-name', type: 'text', content: 'THE SUPREME CLUB', x: 160, y: 110, width: 200, height: 25, fontSize: 13, fontFamily: 'Cinzel', fontWeight: 'bold', color: '#d4af37', rotation: 0, isLocked: false, align: 'center' },
        { id: 'name', type: 'text', content: 'JAYESH SHARMA', x: 110, y: 155, width: 300, height: 35, fontSize: 20, fontFamily: 'Playfair Display', fontWeight: 'bold', color: '#ffffff', rotation: 0, isLocked: false, align: 'center' },
        { id: 'title', type: 'text', content: 'FOUNDING PARTNER', x: 160, y: 190, width: 200, height: 18, fontSize: 9, fontFamily: 'Outfit', color: '#d4af37', rotation: 0, isLocked: false, align: 'center' },
        { id: 'contact', type: 'text', content: '+91 99999 88888  |  VIP@SUPREME.COM', x: 60, y: 230, width: 400, height: 18, fontSize: 9, fontFamily: 'Outfit', color: '#ffffff', rotation: 0, isLocked: false, align: 'center' }
      ]
    },
    {
      id: 'vc-creative',
      name: 'Creative Studio Split',
      bg: '#fcfaf2',
      elements: [
        { id: 'decor-blob', type: 'graphic', content: 'tech', x: 30, y: 40, width: 180, height: 180, rotation: 12, color: 'rgba(255, 204, 0, 0.2)', isLocked: false },
        { id: 'name', type: 'text', content: 'Arjun Sen', x: 50, y: 80, width: 200, height: 35, fontSize: 24, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#111111', rotation: 0, isLocked: false },
        { id: 'title', type: 'text', content: 'Lead Graphic Designer', x: 50, y: 115, width: 200, height: 20, fontSize: 12, fontFamily: 'Space Grotesk', color: '#666666', rotation: 0, isLocked: false },
        { id: 'line', type: 'shape', content: 'rect-solid', x: 50, y: 145, width: 80, height: 3, rotation: 0, color: '#ffcc00', isLocked: false },
        { id: 'comp-name', type: 'text', content: 'STUDIO APEX', x: 310, y: 80, width: 170, height: 25, fontSize: 15, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#111111', rotation: 0, isLocked: false },
        { id: 'phone', type: 'text', content: '📱 9876543210', x: 310, y: 130, width: 160, height: 18, fontSize: 10, fontFamily: 'Space Grotesk', color: '#444444', rotation: 0, isLocked: false },
        { id: 'email', type: 'text', content: '✉️ arjun@apex.in', x: 310, y: 155, width: 160, height: 18, fontSize: 10, fontFamily: 'Space Grotesk', color: '#444444', rotation: 0, isLocked: false },
        { id: 'web', type: 'text', content: '🕸️ www.studioapex.in', x: 310, y: 180, width: 160, height: 18, fontSize: 10, fontFamily: 'Space Grotesk', color: '#444444', rotation: 0, isLocked: false }
      ]
    }
  ],
  'stationery': [
    {
      id: 'st-blank',
      name: 'Blank Letterhead',
      bg: '#ffffff',
      elements: []
    },
    {
      id: 'st-corporate',
      name: 'Classic Corporate Letterhead',
      bg: '#ffffff',
      elements: [
        { id: 'top-bar', type: 'shape', content: 'rect-solid', x: 0, y: 0, width: 350, height: 10, rotation: 0, color: '#0f172a', isLocked: true },
        { id: 'logo-1', type: 'graphic', content: 'globe', x: 25, y: 25, width: 24, height: 24, rotation: 0, color: '#0f172a', isLocked: false },
        { id: 'comp-name', type: 'text', content: 'NEXUS INDUSTRIES', x: 55, y: 28, width: 180, height: 20, fontSize: 11, fontFamily: 'Outfit', fontWeight: 'bold', color: '#0f172a', rotation: 0, isLocked: false },
        { id: 'tagline', type: 'text', content: 'Premium Printing Solutions', x: 55, y: 44, width: 180, height: 12, fontSize: 7, fontFamily: 'Outfit', color: '#64748b', rotation: 0, isLocked: false },
        { id: 'contact-details', type: 'text', content: '📞 +91 98765 01234 | ✉️ contact@nexus.com | 📍 Mumbai, India', x: 25, y: 450, width: 300, height: 15, fontSize: 7, fontFamily: 'Outfit', color: '#64748b', rotation: 0, isLocked: false, align: 'center' },
        { id: 'bottom-bar', type: 'shape', content: 'rect-solid', x: 0, y: 470, width: 350, height: 10, rotation: 0, color: '#0f172a', isLocked: true }
      ]
    }
  ],
  'polo-shirts': [
    {
      id: 'ts-blank',
      name: 'Blank Tee Design',
      bg: '#ffffff',
      elements: []
    },
    {
      id: 'ts-badge',
      name: 'Athletic Division Chest Badge',
      bg: '#ffffff',
      elements: [
        { id: 'logo-badge', type: 'graphic', content: 'shield', x: 180, y: 80, width: 40, height: 40, rotation: 0, color: '#ffcc00', isLocked: false },
        { id: 'badge-text', type: 'text', content: 'ATHLETIC DEPT.', x: 100, y: 130, width: 200, height: 20, fontSize: 12, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#ffffff', rotation: 0, isLocked: false, align: 'center' },
        { id: 'badge-year', type: 'text', content: 'EST. 2026', x: 150, y: 150, width: 100, height: 15, fontSize: 9, fontFamily: 'Space Grotesk', color: '#94a3b8', rotation: 0, isLocked: false, align: 'center' }
      ]
    }
  ],
  'drinkware': [
    {
      id: 'mug-blank',
      name: 'Blank Mug Canvas',
      bg: '#ffffff',
      elements: []
    },
    {
      id: 'mug-corporate',
      name: 'Classic Corporate Mug',
      bg: '#f8fafc',
      elements: [
        { id: 'logo-mug', type: 'graphic', content: 'globe', x: 175, y: 100, width: 50, height: 50, rotation: 0, color: '#0284c7', isLocked: false },
        { id: 'comp-name-mug', type: 'text', content: 'NEXUS CORP', x: 100, y: 165, width: 200, height: 25, fontSize: 15, fontFamily: 'Outfit', fontWeight: 'bold', color: '#0f172a', rotation: 0, isLocked: false, align: 'center' },
        { id: 'slogan-mug', type: 'text', content: 'Sip with Success', x: 100, y: 195, width: 200, height: 18, fontSize: 9, fontFamily: 'Outfit', color: '#64748b', rotation: 0, isLocked: false, align: 'center' }
      ]
    }
  ]
};

// Preset SVG Graphics Icons
const PRESET_GRAPHICS = {
  globe: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  shield: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  leaf: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.2 1 6.5A11 11 0 0 1 11 20z" />
      <path d="M9 22v-4" />
    </svg>
  ),
  heart: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  bolt: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  medical: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  tech: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
};

const Customizer = ({ product, onAddToCart, onBuyNow, onGoBack }) => {
  // Config defaults based on product type
  const isCard = product.id.toLowerCase().includes('card');
  const isTshirt = product.id.toLowerCase().includes('polo') || product.id.toLowerCase().includes('tshirt') || product.id.toLowerCase().includes('shirt');
  const isDrinkware = product.id.toLowerCase().includes('mug') || product.id.toLowerCase().includes('bottle') || product.id.toLowerCase().includes('sipper') || product.category === 'drinkware';
  const isStationery = product.category === 'stationery';
  const isSticker = product.category === 'labels-packaging';
  const isPen = product.category === 'pens';

  // Multi-step customizer state
  // 'config' (Step 1) | 'templates' (Step 2) | 'editor' (Step 3) | 'orientation' (Step 4)
  const [customizerStep, setCustomizerStep] = useState('config');

  // Specs Config state (Step 1)
  const [corners, setCorners] = useState('standard');
  const [paperFinish, setPaperFinish] = useState('matte');
  const [deliverySpeed, setDeliverySpeed] = useState('standard');
  const [quantity, setQuantity] = useState(isCard ? 100 : isSticker ? 24 : isPen ? 10 : 1);
  const [shirtSize, setShirtSize] = useState('L');
  const [frontPrint, setFrontPrint] = useState(true);
  const [backPrint, setBackPrint] = useState(false);
  const [drinkwareColor, setDrinkwareColor] = useState('white');
  const [inkColor, setInkColor] = useState('black');

  // Editor State (Step 3)
  const [view, setView] = useState('front'); // 'front' | 'back'
  const [activeTab, setActiveTab] = useState('text'); // 'options' | 'text' | 'uploads' | 'graphics' | 'background' | 'template' | 'qrcodes'
  const [activeElementId, setActiveElementId] = useState(null);
  const [canvasElements, setCanvasElements] = useState([]);
  const [backElements, setBackElements] = useState([]);
  const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');
  const [backBgColor, setBackBgColor] = useState('#ffffff');
  const [editorZoom, setEditorZoom] = useState(100);
  const [qrText, setQrText] = useState('https://infistyle.in');

  // Interactive Upload Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isQrScanMockOpen, setIsQrScanMockOpen] = useState(false);
  const [recentlyUploaded, setRecentlyUploaded] = useState([
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&fit=crop', // school/education mockup representing "Universal University"
    'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=200&fit=crop'  // screen terminal code block mockup
  ]);

  // AI Prompt Modal states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiStatusMessage, setAiStatusMessage] = useState(null);

  const fileInputRef = useRef(null);

  // Templates Sidebar Filter state (Step 2)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedColorFilter, setSelectedColorFilter] = useState('all');

  // Undo/Redo history
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Dynamic Google Font Loader
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Outfit:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Fetch templates for current product
  const getProductCategory = () => {
    if (isCard) return 'visiting-cards';
    if (isStationery) return 'stationery';
    if (isTshirt) return 'polo-shirts';
    if (isDrinkware) return 'drinkware';
    return 'visiting-cards'; // default fallback
  };

  const getAvailableTemplates = () => {
    const cat = getProductCategory();
    return PRODUCT_TEMPLATES[cat] || PRODUCT_TEMPLATES['visiting-cards'];
  };

  // Base canvas dims based on category
  const getCanvasDimensions = () => {
    if (isStationery) return { width: 350, height: 490 }; // Portrait Letterhead
    if (isSticker) return { width: 360, height: 360 }; // Square Sticker
    if (isDrinkware) return { width: 380, height: 300 }; // Mug wrap bounds
    if (isPen) return { width: 480, height: 60 }; // Very narrow pen strip
    return { width: 520, height: 300 }; // Standard Card size
  };

  const canvasDims = getCanvasDimensions();

  // Price calculations
  const getBaseUnitPrice = () => {
    if (isCard) {
      if (quantity >= 1000) return 1.20;
      if (quantity >= 500) return 1.40;
      if (quantity >= 250) return 1.60;
      return 2.00;
    } else if (isTshirt) {
      let base = product.price || 320;
      if (quantity >= 50) return base * 0.8;
      if (quantity >= 10) return base * 0.9;
      return base;
    } else if (isDrinkware) {
      return product.price || 350;
    } else if (isPen) {
      return product.price || 150;
    }
    return product.price || 200;
  };

  const getAddonCost = () => {
    let addon = 0;
    if (isCard) {
      if (corners === 'rounded') addon += 0.50;
      if (paperFinish === 'glossy') addon += 0.30;
      if (paperFinish === 'velvet') addon += 0.80;
    } else if (isTshirt) {
      if (shirtSize === 'XXL') addon += 50;
      if (frontPrint) addon += 100;
      if (backPrint) addon += 100;
    }
    return addon;
  };

  const unitPrice = getBaseUnitPrice() + getAddonCost();
  const totalPrice = Math.round(unitPrice * quantity);

  // Generate cart configuration details
  const getCustomConfig = () => {
    const compText = canvasElements.find(el => el.id === 'comp-name' || el.id?.includes('comp'))?.content || 'InfiStyle Print';
    const nameText = canvasElements.find(el => el.id === 'name' || el.id?.includes('name'))?.content || '';
    
    return {
      companyName: compText,
      fullName: nameText,
      fontFamily: canvasElements.find(el => el.type === 'text')?.fontFamily || 'Outfit',
      themeColor: canvasBgColor,
      corners,
      paperFinish,
      shirtSize,
      frontPrint,
      backPrint,
      quantity,
      unitPrice,
      totalPrice,
      customCanvasLayout: JSON.stringify({
        bg: canvasBgColor,
        backBg: backBgColor,
        front: canvasElements,
        back: backElements
      })
    };
  };

  const handleAddToCart = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      config: getCustomConfig(),
      quantity,
      price: totalPrice
    });
  };

  const handleBuyNow = () => {
    onBuyNow({
      id: product.id,
      name: product.name,
      image: product.image,
      config: getCustomConfig(),
      quantity,
      price: totalPrice
    });
  };

  // Undo / Redo Mechanics
  const recordHistory = (newElements) => {
    const items = JSON.stringify(newElements);
    const updatedStack = historyStack.slice(0, historyIndex + 1);
    setHistoryStack([...updatedStack, items]);
    setHistoryIndex(updatedStack.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const layers = JSON.parse(historyStack[prevIdx]);
      if (view === 'front') {
        setCanvasElements(layers);
      } else {
        setBackElements(layers);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const layers = JSON.parse(historyStack[nextIdx]);
      if (view === 'front') {
        setCanvasElements(layers);
      } else {
        setBackElements(layers);
      }
    }
  };

  const updateLayers = (updateFn) => {
    const currentList = view === 'front' ? canvasElements : backElements;
    const nextList = updateFn(currentList);
    if (view === 'front') {
      setCanvasElements(nextList);
    } else {
      setBackElements(nextList);
    }
    recordHistory(nextList);
  };

  // Select a template
  const handleSelectTemplate = (template) => {
    setCanvasBgColor(template.bg || '#ffffff');
    setCanvasElements(JSON.parse(JSON.stringify(template.elements)));
    
    const backSide = [
      { id: 'back-logo', type: 'graphic', content: 'globe', x: 235, y: 100, width: 50, height: 50, rotation: 0, color: '#ffcc00', isLocked: false },
      { id: 'back-text', type: 'text', content: template.name === 'Start from Scratch' ? 'DESIGN LAB' : template.elements.find(el => el.id === 'comp-name')?.content || 'Nexus', x: 160, y: 165, width: 200, height: 25, fontSize: 16, fontFamily: 'Outfit', fontWeight: 'bold', color: '#ffcc00', rotation: 0, isLocked: false, align: 'center' }
    ];
    setBackElements(backSide);
    setBackBgColor(template.bg || '#ffffff');

    setHistoryStack([JSON.stringify(template.elements)]);
    setHistoryIndex(0);
    
    setCustomizerStep('editor');
  };

  // Dragging Mechanics
  const handleElementMouseDown = (e, element) => {
    if (element.isLocked) return;
    e.stopPropagation();
    setActiveElementId(element.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initX = element.x;
    const initY = element.y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) * (100 / editorZoom);
      const deltaY = (moveEvent.clientY - startY) * (100 / editorZoom);
      
      updateLayers(prev => prev.map(el => {
        if (el.id === element.id) {
          return {
            ...el,
            x: Math.round(initX + deltaX),
            y: Math.round(initY + deltaY)
          };
        }
        return el;
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Scaling Handles
  const handleResizeMouseDown = (e, element) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const initWidth = element.width || 120;
    const initHeight = element.height || 30;
    const initFontSize = element.fontSize || 14;

    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) * (100 / editorZoom);
      const deltaY = (moveEvent.clientY - startY) * (100 / editorZoom);

      updateLayers(prev => prev.map(el => {
        if (el.id === element.id) {
          const w = Math.max(30, Math.round(initWidth + deltaX));
          const h = Math.max(15, Math.round(initHeight + deltaY));
          
          let fSize = el.fontSize;
          if (el.type === 'text') {
            const ratio = w / initWidth;
            fSize = Math.max(8, Math.min(64, Math.round(initFontSize * ratio)));
          }

          return {
            ...el,
            width: w,
            height: h,
            fontSize: fSize
          };
        }
        return el;
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Rotation Handles
  const handleRotateMouseDown = (e, element) => {
    e.stopPropagation();
    const elementNode = document.getElementById(`canvas-layer-${element.id}`);
    if (!elementNode) return;

    const rect = elementNode.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMouseMove = (moveEvent) => {
      const rad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let deg = rad * (180 / Math.PI) - 90;
      if (deg < 0) deg += 360;

      updateLayers(prev => prev.map(el => {
        if (el.id === element.id) {
          return {
            ...el,
            rotation: Math.round(deg)
          };
        }
        return el;
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Layer Actions
  const handleDeleteElement = (id) => {
    updateLayers(prev => prev.filter(el => el.id !== id));
    if (activeElementId === id) setActiveElementId(null);
  };

  const handleDuplicateElement = (element) => {
    const newEl = {
      ...JSON.parse(JSON.stringify(element)),
      id: 'el-' + Math.random().toString(36).substr(2, 9),
      x: element.x + 20,
      y: element.y + 20,
      isLocked: false
    };
    updateLayers(prev => [...prev, newEl]);
    setActiveElementId(newEl.id);
  };

  const handleToggleLock = (id) => {
    updateLayers(prev => prev.map(el => {
      if (el.id === id) {
        return { ...el, isLocked: !el.isLocked };
      }
      return el;
    }));
  };

  // Canvas insertions
  const handleAddText = () => {
    const newText = {
      id: 'el-text-' + Date.now(),
      type: 'text',
      content: 'New Text Field',
      x: Math.round(canvasDims.width / 2 - 75),
      y: Math.round(canvasDims.height / 2 - 15),
      width: 150,
      height: 30,
      fontSize: 14,
      fontFamily: 'Outfit',
      color: '#111111',
      rotation: 0,
      isLocked: false
    };
    updateLayers(prev => [...prev, newText]);
    setActiveElementId(newText.id);
  };

  const handleAddShape = (shapeType) => {
    const newShape = {
      id: 'el-shape-' + Date.now(),
      type: 'shape',
      content: shapeType,
      x: Math.round(canvasDims.width / 2 - 40),
      y: Math.round(canvasDims.height / 2 - 40),
      width: 80,
      height: 80,
      rotation: 0,
      color: '#ffcc00',
      isLocked: false
    };
    updateLayers(prev => [...prev, newShape]);
    setActiveElementId(newShape.id);
  };

  const handleAddGraphic = (graphicType) => {
    const newGraphic = {
      id: 'el-graphic-' + Date.now(),
      type: 'graphic',
      content: graphicType,
      x: Math.round(canvasDims.width / 2 - 25),
      y: Math.round(canvasDims.height / 2 - 25),
      width: 50,
      height: 50,
      rotation: 0,
      color: '#0f172a',
      isLocked: false
    };
    updateLayers(prev => [...prev, newGraphic]);
    setActiveElementId(newGraphic.id);
  };

  const handleAddQrCode = () => {
    const newQr = {
      id: 'el-qr-' + Date.now(),
      type: 'qrcode',
      content: qrText,
      x: Math.round(canvasDims.width - 90),
      y: Math.round(canvasDims.height - 90),
      width: 70,
      height: 70,
      rotation: 0,
      isLocked: false
    };
    updateLayers(prev => [...prev, newQr]);
    setActiveElementId(newQr.id);
  };

  const handleImageUploadSimulate = (src) => {
    const newImg = {
      id: 'el-img-' + Date.now(),
      type: 'image',
      content: src,
      x: Math.round(canvasDims.width / 2 - 60),
      y: Math.round(canvasDims.height / 2 - 60),
      width: 120,
      height: 120,
      rotation: 0,
      isLocked: false
    };
    updateLayers(prev => [...prev, newImg]);
    setActiveElementId(newImg.id);
  };

  // Native Browser File Upload Handlers
  const handleNativeFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processNativeFile(e.target.files[0]);
    }
  };

  const processNativeFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      
      // Save to recently uploaded array state
      setRecentlyUploaded(prev => [base64Url, ...prev]);
      
      // Place directly onto canvas
      handleImageUploadSimulate(base64Url);
      
      // Close uploads overlay
      setIsUploadModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  // AI Card Design Generator Logic
  const handleAiCardGeneration = (theme) => {
    setAiStatusMessage(`🔄 AI is composing a premium '${theme}' card layout...`);
    
    setTimeout(() => {
      let bg = '#ffffff';
      let elements = [];

      if (theme.includes('Tech') || theme.includes('Startup')) {
        bg = '#0f172a'; // slate dark
        elements = [
          { id: 'ai-logo', type: 'graphic', content: 'tech', x: 235, y: 50, width: 50, height: 50, rotation: 0, color: '#ffcc00', isLocked: false },
          { id: 'ai-comp', type: 'text', content: 'APEX DIGITAL INC.', x: 110, y: 115, width: 300, height: 25, fontSize: 16, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#ffffff', rotation: 0, isLocked: false, align: 'center' },
          { id: 'ai-tag', type: 'text', content: 'Building the Future of Code', x: 110, y: 140, width: 300, height: 18, fontSize: 9, fontFamily: 'Space Grotesk', color: '#94a3b8', rotation: 0, isLocked: false, align: 'center' },
          { id: 'ai-name', type: 'text', content: 'Siddharth Roy', x: 110, y: 180, width: 300, height: 35, fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#ffcc00', rotation: 0, isLocked: false, align: 'center' },
          { id: 'ai-title', type: 'text', content: 'Lead Cloud Architect', x: 110, y: 215, width: 300, height: 18, fontSize: 10, fontFamily: 'Space Grotesk', color: '#94a3b8', rotation: 0, isLocked: false, align: 'center' },
          { id: 'ai-contact', type: 'text', content: '📱 +91 99887 76655  |  ✉️ sid@apex.digital', x: 60, y: 255, width: 400, height: 18, fontSize: 9, fontFamily: 'Space Grotesk', color: '#ffffff', rotation: 0, isLocked: false, align: 'center' }
        ];
      } else if (theme.includes('Lawyer') || theme.includes('Law')) {
        bg = '#111111'; // pure black
        elements = [
          { id: 'ai-border', type: 'shape', content: 'rect-border', x: 15, y: 15, width: 490, height: 270, rotation: 0, color: '#d4af37', isLocked: true },
          { id: 'ai-logo', type: 'graphic', content: 'shield', x: 240, y: 45, width: 40, height: 40, rotation: 0, color: '#d4af37', isLocked: false },
          { id: 'ai-comp', type: 'text', content: 'ROY & ASSOCIATES LLP', x: 110, y: 100, width: 300, height: 25, fontSize: 14, fontFamily: 'Cinzel', fontWeight: 'bold', color: '#d4af37', rotation: 0, isLocked: false, align: 'center' },
          { id: 'ai-name', type: 'text', content: 'Advocate Raghav Roy', x: 110, y: 145, width: 300, height: 35, fontSize: 20, fontFamily: 'Playfair Display', fontWeight: 'bold', color: '#ffffff', rotation: 0, isLocked: false, align: 'center' },
          { id: 'ai-title', type: 'text', content: 'SENIOR SUPREME COURT COUNSEL', x: 110, y: 180, width: 300, height: 18, fontSize: 8, fontFamily: 'Outfit', color: '#d4af37', rotation: 0, isLocked: false, align: 'center' },
          { id: 'ai-divider', type: 'shape', content: 'rect-solid', x: 210, y: 210, width: 100, height: 1, rotation: 0, color: 'rgba(255, 255, 255, 0.2)', isLocked: true },
          { id: 'ai-contact', type: 'text', content: '📞 +91 11 2345 6789  |  ✉️ contact@roylaw.in', x: 60, y: 230, width: 400, height: 18, fontSize: 9, fontFamily: 'Outfit', color: '#ffffff', rotation: 0, isLocked: false, align: 'center' },
          { id: 'ai-addr', type: 'text', content: '📍 Supreme Court Chambers, New Delhi', x: 60, y: 250, width: 400, height: 18, fontSize: 8, fontFamily: 'Outfit', color: '#999999', rotation: 0, isLocked: false, align: 'center' }
        ];
      } else if (theme.includes('Cafe') || theme.includes('Coffee')) {
        bg = '#fcfaf2'; // cream white
        elements = [
          { id: 'ai-logo', type: 'graphic', content: 'leaf', x: 40, y: 40, width: 35, height: 35, rotation: 0, color: '#059669', isLocked: false },
          { id: 'ai-comp', type: 'text', content: 'THE GREEN BEAN CAFE', x: 85, y: 48, width: 250, height: 25, fontSize: 15, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#111111', rotation: 0, isLocked: false },
          { id: 'ai-name', type: 'text', content: 'Rohan Deshmukh', x: 40, y: 115, width: 250, height: 35, fontSize: 24, fontFamily: 'Playfair Display', fontWeight: 'bold', color: '#059669', rotation: 0, isLocked: false },
          { id: 'ai-title', type: 'text', content: 'Founder & Brewmaster', x: 40, y: 150, width: 250, height: 20, fontSize: 11, fontFamily: 'Outfit', color: '#666666', rotation: 0, isLocked: false },
          { id: 'ai-divider', type: 'shape', content: 'rect-solid', x: 40, y: 185, width: 440, height: 2, rotation: 0, color: '#059669', isLocked: false },
          { id: 'ai-phone', type: 'text', content: '📞 +91 98333 22110', x: 40, y: 205, width: 150, height: 18, fontSize: 10, fontFamily: 'Outfit', color: '#333333', rotation: 0, isLocked: false },
          { id: 'ai-email', type: 'text', content: '✉️ hello@greenbean.cafe', x: 200, y: 205, width: 170, height: 18, fontSize: 10, fontFamily: 'Outfit', color: '#333333', rotation: 0, isLocked: false },
          { id: 'ai-addr', type: 'text', content: '📍 Pali Hill, Bandra West, Mumbai', x: 40, y: 230, width: 300, height: 18, fontSize: 10, fontFamily: 'Outfit', color: '#666666', rotation: 0, isLocked: false }
        ];
      } else {
        // Creative Studio
        bg = '#ffffff';
        elements = [
          { id: 'ai-logo', type: 'graphic', content: 'bolt', x: 40, y: 40, width: 30, height: 30, rotation: 0, color: '#ea580c', isLocked: false },
          { id: 'ai-comp', type: 'text', content: 'CREATIVE SPARK', x: 80, y: 45, width: 200, height: 25, fontSize: 15, fontFamily: 'Outfit', fontWeight: 'bold', color: '#111111', rotation: 0, isLocked: false },
          { id: 'ai-name', type: 'text', content: 'Neha Nair', x: 40, y: 120, width: 220, height: 35, fontSize: 24, fontFamily: 'Outfit', fontWeight: 'bold', color: '#111111', rotation: 0, isLocked: false },
          { id: 'ai-title', type: 'text', content: 'Creative Director', x: 40, y: 155, width: 220, height: 20, fontSize: 11, fontFamily: 'Outfit', color: '#ea580c', rotation: 0, isLocked: false },
          { id: 'ai-divider', type: 'shape', content: 'rect-solid', x: 40, y: 190, width: 440, height: 2, rotation: 0, color: '#e2e8f0', isLocked: true },
          { id: 'ai-phone', type: 'text', content: '📱 +91 99988 87766', x: 40, y: 210, width: 140, height: 18, fontSize: 10, fontFamily: 'Outfit', color: '#444444', rotation: 0, isLocked: false },
          { id: 'ai-email', type: 'text', content: '✉️ neha@spark.studio', x: 200, y: 210, width: 160, height: 18, fontSize: 10, fontFamily: 'Outfit', color: '#444444', rotation: 0, isLocked: false }
        ];
      }

      setCanvasBgColor(bg);
      setCanvasElements(elements);
      setActiveElementId(elements[0]?.id || null);
      
      setHistoryStack([JSON.stringify(elements)]);
      setHistoryIndex(0);

      setAiStatusMessage(null);
      setIsAiModalOpen(false);
      setAiCustomPrompt('');
    }, 1200);
  };

  const activeElement = (view === 'front' ? canvasElements : backElements).find(el => el.id === activeElementId);

  // Filters for templates grid (Step 2)
  const filteredTemplates = getAvailableTemplates().filter(t => {
    const matchQuery = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.elements.some(e => e.type === 'text' && e.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchColor = true;
    if (selectedColorFilter !== 'all') {
      const bgHex = t.bg || '#ffffff';
      if (selectedColorFilter === 'dark' && bgHex === '#ffffff') matchColor = false;
      if (selectedColorFilter === 'light' && bgHex !== '#ffffff' && bgHex !== '#fcfaf2') matchColor = false;
    }

    return matchQuery && matchColor;
  });

  return (
    <div style={styles.container}>
      {/* Native hidden file input for device uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleNativeFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* ------------------ STEP 1: SPEC CONFIGURATION ------------------ */}
      {customizerStep === 'config' && (
        <div style={styles.configScreen} className="animate-fade-in">
          <button onClick={onGoBack} style={styles.backButton}>
            ← Back to products
          </button>
          
          <div style={styles.configLayout}>
            {/* Left Col: High-Res Mockup Gallery */}
            <div style={styles.configGalleryCol}>
              <div style={styles.mainMockupFrame}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  style={styles.mainMockupImage} 
                />
                <span style={styles.badgePremium}>PREMIUM PRINT</span>
              </div>
              <div style={styles.thumbnailRow}>
                <div style={{...styles.thumbnail, borderColor: 'var(--color-border)'}}>
                  <img src={product.image} alt="front view" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                </div>
                <div style={styles.thumbnail}>
                  <div style={{fontSize:'11px', color:'#777', textAlign:'center', marginTop:'14px'}}>Back</div>
                </div>
                <div style={styles.thumbnail}>
                  <div style={{fontSize:'11px', color:'#777', textAlign:'center', marginTop:'14px'}}>3D Card</div>
                </div>
              </div>
            </div>

            {/* Right Col: Configure Attributes */}
            <div style={styles.configFormCol}>
              <h1 style={styles.titleText}>{product.name}</h1>
              <div style={styles.ratingRow}>
                <span style={{color: '#ffcc00'}}>★★★★★</span>
                <span style={{fontSize: '13px', color: '#666', marginLeft: '6px'}}>(1,438 reviews)</span>
              </div>
              
              <p style={styles.productDesc}>
                Personalized {product.name} with a cohesive professional look. Choose standard formats or customize corner finishes, premium cardstocks, and bulk orders directly.
              </p>

              <div style={styles.specsDivider}></div>

              {/* Specific Options - Corners */}
              {isCard && (
                <div style={styles.formSection}>
                  <label style={styles.sectionLabel}>Corners</label>
                  <div style={styles.optionCardsGrid}>
                    <div 
                      onClick={() => setCorners('standard')}
                      style={{...styles.optionSelectCard, borderColor: corners === 'standard' ? 'var(--color-border)' : '#e2e8f0', backgroundColor: corners === 'standard' ? '#fffdf5' : '#ffffff'}}
                    >
                      <div style={styles.cornerStandardIcon}></div>
                      <div style={styles.cardInfo}>
                        <div style={styles.cardNameTitle}>Standard</div>
                        <div style={styles.cardPriceLabel}>Included</div>
                      </div>
                    </div>
                    <div 
                      onClick={() => setCorners('rounded')}
                      style={{...styles.optionSelectCard, borderColor: corners === 'rounded' ? 'var(--color-border)' : '#e2e8f0', backgroundColor: corners === 'rounded' ? '#fffdf5' : '#ffffff'}}
                    >
                      <div style={styles.cornerRoundedIcon}></div>
                      <div style={styles.cardInfo}>
                        <div style={styles.cardNameTitle}>Rounded</div>
                        <div style={styles.cardPriceLabel}>+₹0.50 / unit</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Specific Options - Sizes (Clothing) */}
              {isTshirt && (
                <div style={styles.formSection}>
                  <label style={styles.sectionLabel}>Size Selection</label>
                  <div style={styles.btnGridRow}>
                    {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                      <button 
                        key={sz}
                        onClick={() => setShirtSize(sz)}
                        style={{
                          ...styles.specBadgeBtn, 
                          backgroundColor: shirtSize === sz ? '#ffcc00' : '#ffffff',
                          borderColor: shirtSize === sz ? '#ffcc00' : '#cbd5e1',
                          color: '#111111',
                          fontWeight: shirtSize === sz ? '700' : '400'
                        }}
                      >
                        {sz} {sz === 'XXL' && '(+₹50)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Options - Materials */}
              {isCard && (
                <div style={styles.formSection}>
                  <label style={styles.sectionLabel}>Paper Finish</label>
                  <select 
                    value={paperFinish}
                    onChange={(e) => setPaperFinish(e.target.value)}
                    style={styles.selectSpecs}
                  >
                    <option value="matte">Matte (Smooth & Anti-Glare)</option>
                    <option value="glossy">Glossy (Highly Reflective +₹0.30)</option>
                    <option value="velvet">Velvet Touch (Soft-Feel +₹0.80)</option>
                  </select>
                </div>
              )}

              {/* Specific Options - Ink Colors (Stamps) */}
              {product.category === 'stamps-ink' && (
                <div style={styles.formSection}>
                  <label style={styles.sectionLabel}>Ink color</label>
                  <div style={styles.btnGridRow}>
                    {['black', 'blue', 'red'].map(col => (
                      <button 
                        key={col}
                        onClick={() => setInkColor(col)}
                        style={{
                          ...styles.specBadgeBtn,
                          backgroundColor: inkColor === col ? '#ffcc00' : '#ffffff',
                          borderColor: inkColor === col ? '#ffcc00' : '#cbd5e1'
                        }}
                      >
                        {col.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Options - Quantity Selection */}
              <div style={styles.formSection}>
                <label style={styles.sectionLabel}>Select Quantity</label>
                {isCard ? (
                  <select 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    style={styles.selectSpecs}
                  >
                    <option value="100">100 units (₹{(2.00 + getAddonCost()).toFixed(2)} / card)</option>
                    <option value="250">250 units (₹{(1.60 + getAddonCost()).toFixed(2)} / card) - Save 20%</option>
                    <option value="500">500 units (₹{(1.40 + getAddonCost()).toFixed(2)} / card) - Save 30%</option>
                    <option value="1000">1000 units (₹{(1.20 + getAddonCost()).toFixed(2)} / card) - Save 40%</option>
                  </select>
                ) : isSticker ? (
                  <select 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    style={styles.selectSpecs}
                  >
                    <option value="24">24 units</option>
                    <option value="50">50 units</option>
                    <option value="100">100 units</option>
                  </select>
                ) : isPen ? (
                  <select 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    style={styles.selectSpecs}
                  >
                    <option value="10">10 units</option>
                    <option value="50">50 units</option>
                    <option value="100">100 units</option>
                  </select>
                ) : (
                  <div style={styles.qtyRowInput}>
                    <input 
                      type="number" 
                      min="1" 
                      max="200" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      style={styles.numberInputSpec}
                    />
                    <span style={{fontSize: '12px', color: '#666'}}>pieces</span>
                  </div>
                )}
              </div>

              {/* Main Customization CTA Triggers */}
              <div style={styles.ctaCardButtonGroup}>
                <button 
                  onClick={() => setCustomizerStep('templates')}
                  style={styles.browseDesignsBtn}
                >
                  Browse designs 🎨
                </button>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  style={styles.uploadDesignBtn}
                >
                  Upload design / Start Blank 📤
                </button>
              </div>

              {/* Total calculations display */}
              <div style={styles.priceStrip}>
                <span style={{fontSize: '13px', color: '#555'}}>Estimated Total:</span>
                <span style={{fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)'}}>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Explore popular templates gallery grid (Step 1 Bottom) */}
          <div style={styles.exploreTemplatesBlock}>
            <h3 style={styles.exploreHeading}>Explore most popular templates</h3>
            <div style={styles.popularTemplatesGrid}>
              {getAvailableTemplates().slice(1, 4).map(temp => (
                <div 
                  key={temp.id} 
                  onClick={() => handleSelectTemplate(temp)}
                  style={styles.popularTemplateCard}
                >
                  <div style={{...styles.miniTemplatePreview, backgroundColor: temp.bg || '#ffffff'}}>
                    {temp.elements.map(el => (
                      <div 
                        key={el.id}
                        style={{
                          position: 'absolute',
                          left: `${(el.x / 520) * 100}%`,
                          top: `${(el.y / 300) * 100}%`,
                          width: `${(el.width / 520) * 100}%`,
                          height: `${(el.height / 300) * 100}%`,
                          fontSize: '3px',
                          color: el.color || '#333',
                          fontWeight: el.fontWeight || 'normal',
                          lineHeight: '1'
                        }}
                      >
                        {el.type === 'text' ? el.content.substring(0, 10) : '◼'}
                      </div>
                    ))}
                  </div>
                  <div style={styles.popularTemplateMeta}>
                    <span style={{fontWeight: '600', fontSize: '13px'}}>{temp.name}</span>
                    <span style={{fontSize: '11px', color: '#ffcc00'}}>★ 4.8</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------ STEP 2: TEMPLATE GALLERY BROWSER ------------------ */}
      {customizerStep === 'templates' && (
        <div style={styles.templatesScreen} className="animate-fade-in">
          <div style={styles.templatesHeader}>
            <div>
              <button 
                onClick={() => setCustomizerStep('config')}
                style={styles.backLinkSmall}
              >
                ← Back to product options
              </button>
              <h2 style={{fontSize: '28px', fontWeight: '800', marginTop: '8px'}}>{product.name} Designs & Templates</h2>
            </div>
            <div style={styles.searchBarBox}>
              <input 
                type="text" 
                placeholder="Search templates (e.g. corporate, modern)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchTemplatesInput}
              />
            </div>
          </div>

          <div style={styles.templatesLayout}>
            {/* Left Sidebar Filter panel */}
            <div style={styles.templatesSidebar}>
              <h4 style={styles.sidebarSectionTitle}>Filter By</h4>
              
              <div style={styles.filterSection}>
                <label style={styles.filterLabel}>Design Colour</label>
                <select 
                  value={selectedColorFilter}
                  onChange={(e) => setSelectedColorFilter(e.target.value)}
                  style={styles.selectFilter}
                >
                  <option value="all">All Colours</option>
                  <option value="dark">Dark Backgrounds</option>
                  <option value="light">Light Backgrounds</option>
                </select>
              </div>

              <div style={styles.filterSection}>
                <label style={styles.filterLabel}>Industry / Theme</label>
                <select 
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  style={styles.selectFilter}
                >
                  <option value="all">All Industries</option>
                  <option value="corporate">Corporate</option>
                  <option value="creative">Creative / Arts</option>
                  <option value="medical">Medical / Health</option>
                  <option value="luxury">Luxury / VIP</option>
                </select>
              </div>

              <div style={styles.helpPromoBox}>
                <div style={{fontWeight: '700', fontSize: '14px', marginBottom: '6px'}}>Need design help?</div>
                <div style={{fontSize: '11px', color: '#555', marginBottom: '12px'}}>Work with an InfiStyle designer to create a layout from scratch.</div>
                <button style={styles.promoContactBtn}>Contact Designer</button>
              </div>
            </div>

            {/* Right grid gallery list */}
            <div style={styles.templatesGalleryGridCol}>
              <div style={styles.templatesGrid}>
                {/* Upload design card */}
                <div 
                  onClick={() => setIsUploadModalOpen(true)}
                  style={{...styles.templateGalleryCard, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', border: '2px dashed var(--color-border)'}}
                >
                  <span style={{fontSize: '36px'}}>📤</span>
                  <span style={{fontWeight: '700', fontSize: '14px', marginTop: '12px'}}>Upload your design</span>
                  <span style={{fontSize: '11px', color: '#666', marginTop: '4px'}}>Start with a blank canvas</span>
                </div>

                {filteredTemplates.map(temp => (
                  <div 
                    key={temp.id}
                    onClick={() => handleSelectTemplate(temp)}
                    style={styles.templateGalleryCard}
                  >
                    <div style={{...styles.templateGalleryPreviewFrame, backgroundColor: temp.bg || '#ffffff'}}>
                      {temp.elements.map(el => (
                        <div 
                          key={el.id}
                          style={{
                            position: 'absolute',
                            left: `${(el.x / 520) * 100}%`,
                            top: `${(el.y / 300) * 100}%`,
                            width: `${(el.width / 520) * 100}%`,
                            height: `${(el.height / 300) * 100}%`,
                            fontSize: '4px',
                            color: el.color || '#333',
                            fontWeight: el.fontWeight || 'normal',
                            fontFamily: el.fontFamily || 'sans-serif',
                            lineHeight: '1',
                            overflow: 'hidden'
                          }}
                        >
                          {el.type === 'text' ? el.content.substring(0, 15) : el.type === 'graphic' ? '★' : '■'}
                        </div>
                      ))}
                    </div>
                    <div style={styles.templateGalleryCardInfo}>
                      <span style={{fontWeight: '700', fontSize: '13px'}}>{temp.name}</span>
                      <div style={styles.colorPaletteIndicators}>
                        <div style={{...styles.paletteDot, backgroundColor: temp.bg || '#ffffff'}}></div>
                        <div style={{...styles.paletteDot, backgroundColor: temp.elements[0]?.color || '#ffcc00'}}></div>
                        <div style={{...styles.paletteDot, backgroundColor: temp.elements[1]?.color || '#0f172a'}}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ STEP 3: STUDIO EDITOR WORKSPACE ------------------ */}
      {customizerStep === 'editor' && (
        <div style={styles.editorScreen} className="animate-fade-in">
          {/* Top Vistaprint-Style Branded White Header Bar */}
          <div style={styles.editorTopBar}>
            <div style={styles.editorHeaderLeft}>
              <svg viewBox="0 0 24 24" fill="#15a1e2" style={{width: '22px', height: '22px'}}>
                <polygon points="12 2 2 22 22 22" />
              </svg>
              <span style={styles.vistaprintLogoText}>
                vistaprint<span style={{color: '#15a1e2'}}>.</span>
              </span>
              <span style={styles.toolbarDivider}></span>
              <span style={styles.activeFileName}>{product.name}</span>
              <span style={styles.savedStatusText}>
                🗲 Saved to My Projects
              </span>
              <div style={styles.undoRedoGroup}>
                <button onClick={handleUndo} disabled={historyIndex <= 0} style={styles.historyBtn} title="Undo">↶</button>
                <button onClick={handleRedo} disabled={historyIndex >= historyStack.length - 1} style={styles.historyBtn} title="Redo">↷</button>
              </div>
            </div>
            <div style={styles.editorHeaderRight}>
              <div style={styles.priceBanner}>₹{totalPrice}</div>
              <button 
                onClick={() => setCustomizerStep('orientation')}
                style={styles.previewApproveBtn}
              >
                Next (Preview Mockup) →
              </button>
            </div>
          </div>

          <div style={styles.editorWorkspaceLayout}>
            {/* Left Toolbar panel */}
            <div style={styles.editorSidebarTabs}>
              <div 
                onClick={() => setActiveTab('options')}
                style={{...styles.sidebarTabBtn, backgroundColor: activeTab === 'options' ? '#ffffff' : 'transparent', borderLeft: activeTab === 'options' ? '3px solid var(--color-border)' : '3px solid transparent'}}
              >
                <span style={styles.tabIcon}>⚙️</span>
                <span style={styles.tabLabel}>Options</span>
              </div>
              <div 
                onClick={() => setActiveTab('text')}
                style={{...styles.sidebarTabBtn, backgroundColor: activeTab === 'text' ? '#ffffff' : 'transparent', borderLeft: activeTab === 'text' ? '3px solid var(--color-border)' : '3px solid transparent'}}
              >
                <span style={styles.tabIcon}>T</span>
                <span style={styles.tabLabel}>Text</span>
              </div>
              <div 
                onClick={() => setActiveTab('uploads')}
                style={{...styles.sidebarTabBtn, backgroundColor: activeTab === 'uploads' ? '#ffffff' : 'transparent', borderLeft: activeTab === 'uploads' ? '3px solid var(--color-border)' : '3px solid transparent'}}
              >
                <span style={styles.tabIcon}>📤</span>
                <span style={styles.tabLabel}>Uploads</span>
              </div>
              <div 
                onClick={() => setActiveTab('graphics')}
                style={{...styles.sidebarTabBtn, backgroundColor: activeTab === 'graphics' ? '#ffffff' : 'transparent', borderLeft: activeTab === 'graphics' ? '3px solid var(--color-border)' : '3px solid transparent'}}
              >
                <span style={styles.tabIcon}>▲</span>
                <span style={styles.tabLabel}>Graphics</span>
              </div>
              <div 
                onClick={() => setActiveTab('background')}
                style={{...styles.sidebarTabBtn, backgroundColor: activeTab === 'background' ? '#ffffff' : 'transparent', borderLeft: activeTab === 'background' ? '3px solid var(--color-border)' : '3px solid transparent'}}
              >
                <span style={styles.tabIcon}>🎨</span>
                <span style={styles.tabLabel}>Background</span>
              </div>
              <div 
                onClick={() => setActiveTab('qrcodes')}
                style={{...styles.sidebarTabBtn, backgroundColor: activeTab === 'qrcodes' ? '#ffffff' : 'transparent', borderLeft: activeTab === 'qrcodes' ? '3px solid var(--color-border)' : '3px solid transparent'}}
              >
                <span style={styles.tabIcon}>🏁</span>
                <span style={styles.tabLabel}>QR Codes</span>
              </div>
            </div>

            {/* Sidebar Sub-panel options content */}
            <div style={styles.editorPanelContent}>
              {/* Product configuration options tab */}
              {activeTab === 'options' && (
                <div className="animate-fade-in">
                  <h4 style={styles.panelTitle}>Product Settings</h4>
                  <div style={styles.panelGroup}>
                    <label style={styles.panelLabel}>Print Quantity</label>
                    <select 
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      style={styles.selectPanelField}
                    >
                      <option value="100">100 Cards</option>
                      <option value="250">250 Cards</option>
                      <option value="500">500 Cards</option>
                      <option value="1000">1000 Cards</option>
                    </select>
                  </div>
                  {isCard && (
                    <>
                      <div style={styles.panelGroup}>
                        <label style={styles.panelLabel}>Corners</label>
                        <select 
                          value={corners}
                          onChange={(e) => setCorners(e.target.value)}
                          style={styles.selectPanelField}
                        >
                          <option value="standard">Standard Corners</option>
                          <option value="rounded">Rounded Corners (+₹0.50)</option>
                        </select>
                      </div>
                      <div style={styles.panelGroup}>
                        <label style={styles.panelLabel}>Coating Finish</label>
                        <select 
                          value={paperFinish}
                          onChange={(e) => setPaperFinish(e.target.value)}
                          style={styles.selectPanelField}
                        >
                          <option value="matte">Matte</option>
                          <option value="glossy">Glossy</option>
                          <option value="velvet">Velvet Touch</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Text Management tab */}
              {activeTab === 'text' && (
                <div className="animate-fade-in">
                  <h4 style={styles.panelTitle}>Edit Typography</h4>
                  <button onClick={handleAddText} style={styles.addTextBtn}>
                    + New Text Field
                  </button>

                  <div style={styles.panelDivider}></div>

                  {activeElement && activeElement.type === 'text' ? (
                    <div style={styles.layerEditBlock}>
                      <label style={styles.panelLabel}>Text Content</label>
                      <textarea 
                        value={activeElement.content}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateLayers(prev => prev.map(el => el.id === activeElementId ? { ...el, content: val } : el));
                        }}
                        style={styles.textareaField}
                      />

                      <label style={styles.panelLabel}>Font Family</label>
                      <select 
                        value={activeElement.fontFamily}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateLayers(prev => prev.map(el => el.id === activeElementId ? { ...el, fontFamily: val } : el));
                        }}
                        style={styles.selectPanelField}
                      >
                        <option value="Outfit">Outfit</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Cinzel">Cinzel</option>
                        <option value="Space Grotesk">Space Grotesk</option>
                        <option value="Inter">Inter</option>
                      </select>

                      <label style={styles.panelLabel}>Color</label>
                      <input 
                        type="color" 
                        value={activeElement.color}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateLayers(prev => prev.map(el => el.id === activeElementId ? { ...el, color: val } : el));
                        }}
                        style={styles.colorPickerField}
                      />
                    </div>
                  ) : (
                    <div style={styles.emptySelectionMsg}>
                      Click any text element on the canvas to modify its font, color, or alignment properties.
                    </div>
                  )}
                </div>
              )}

              {/* Real Uploads Tab Panel */}
              {activeTab === 'uploads' && (
                <div className="animate-fade-in">
                  <h4 style={styles.panelTitle}>Add Photos & Logos</h4>
                  
                  {/* Click to open the custom upload Modal overlay */}
                  <div 
                    onClick={() => setIsUploadModalOpen(true)}
                    style={styles.uploadBoxSimulate}
                  >
                    <span style={{fontSize: '24px', color: '#ffcc00'}}>📂</span>
                    <span style={{fontWeight: '700', fontSize:'13px', marginTop:'8px'}}>Click to Upload file</span>
                    <span style={{fontSize: '11px', color: '#666', marginTop:'4px'}}>Supports JPG, PNG, SVG</span>
                  </div>

                  <div style={styles.panelDivider}></div>
                  <label style={styles.panelLabel}>Demo Assets</label>
                  <div style={styles.presetImagesGrid}>
                    <img 
                      src="https://images.unsplash.com/photo-1557683316-973673baf926?w=200&fit=crop" 
                      onClick={() => handleImageUploadSimulate('https://images.unsplash.com/photo-1557683316-973673baf926?w=200&fit=crop')}
                      style={styles.presetImgThumb} 
                      alt="grad"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&fit=crop" 
                      onClick={() => handleImageUploadSimulate('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&fit=crop')}
                      style={styles.presetImgThumb} 
                      alt="abstract"
                    />
                  </div>
                </div>
              )}

              {/* Graphics presets tab */}
              {activeTab === 'graphics' && (
                <div className="animate-fade-in" style={{maxHeight:'80vh', overflowY:'auto'}}>
                  <h4 style={styles.panelTitle}>Add Vector Graphics</h4>
                  
                  <label style={styles.panelLabel}>Preset Shapes</label>
                  <div style={styles.presetGraphicsGrid}>
                    <button onClick={() => handleAddShape('rect-solid')} style={styles.shapeBtn} title="Rectangle">◼</button>
                    <button onClick={() => handleAddShape('circle-solid')} style={styles.shapeBtn} title="Circle">●</button>
                    <button onClick={() => handleAddShape('triangle-solid')} style={styles.shapeBtn} title="Triangle">▲</button>
                  </div>

                  <label style={styles.panelLabel}>Preset Icons</label>
                  <div style={styles.presetGraphicsGrid}>
                    {Object.keys(PRESET_GRAPHICS).map(key => (
                      <button 
                        key={key} 
                        onClick={() => handleAddGraphic(key)} 
                        style={styles.graphicPresetIconBtn}
                      >
                        {PRESET_GRAPHICS[key]('#111111')}
                      </button>
                    ))}
                  </div>

                  {activeElement && (activeElement.type === 'shape' || activeElement.type === 'graphic') && (
                    <div style={{marginTop: '16px'}}>
                      <label style={styles.panelLabel}>Graphic Color</label>
                      <input 
                        type="color" 
                        value={activeElement.color}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateLayers(prev => prev.map(el => el.id === activeElementId ? { ...el, color: val } : el));
                        }}
                        style={styles.colorPickerField}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Background Color selector tab */}
              {activeTab === 'background' && (
                <div className="animate-fade-in">
                  <h4 style={styles.panelTitle}>Canvas Background</h4>
                  <div style={styles.colorPaletteGrid}>
                    {['#ffffff', '#0f172a', '#111111', '#fcfaf2', '#ffcc00', '#ea580c', '#059669', '#dc2626'].map(col => (
                      <div 
                        key={col}
                        onClick={() => {
                          if (view === 'front') {
                            setCanvasBgColor(col);
                          } else {
                            setBackBgColor(col);
                          }
                        }}
                        style={{
                          ...styles.bgPaletteDot, 
                          backgroundColor: col,
                          borderColor: (view === 'front' ? canvasBgColor : backBgColor) === col ? 'var(--color-border)' : '#cbd5e1'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Code generator tab */}
              {activeTab === 'qrcodes' && (
                <div className="animate-fade-in">
                  <h4 style={styles.panelTitle}>Insert QR Code</h4>
                  <label style={styles.panelLabel}>Destination URL</label>
                  <input 
                    type="text" 
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    style={styles.textPanelInput}
                  />
                  <button onClick={handleAddQrCode} style={styles.addTextBtn}>
                    Generate & Place QR Code
                  </button>
                </div>
              )}
            </div>

            {/* Core Canvas Workspace panel (Light Grey background like Vistaprint) */}
            <div style={styles.canvasWorkspaceArea}>
              
              {/* Contextual Editor toolbar above canvas */}
              <div style={styles.contextualToolbar}>
                <button style={styles.toolbarBtn} onClick={() => handleAddText()}>📝 Text</button>
                <button style={styles.toolbarBtn} onClick={() => handleAddShape('rect-solid')}>⬛ Rectangle</button>
                <button style={styles.toolbarBtn} onClick={() => handleAddShape('circle-solid')}>⚫ Circle</button>
                <span style={styles.toolbarDivider}></span>
                
                {/* AI Design compose trigger button */}
                <button 
                  style={{...styles.toolbarBtn, backgroundColor: '#0f62fe', color:'#ffffff', padding:'4px 10px', borderRadius:'4px'}} 
                  onClick={() => setIsAiModalOpen(true)}
                >
                  ✨ Edit with AI
                </button>
              </div>

              {/* Canvas viewport wrapper */}
              <div 
                style={{
                  ...styles.canvasContainerScale,
                  transform: `scale(${editorZoom / 100})`,
                  width: `${canvasDims.width}px`,
                  height: `${canvasDims.height}px`
                }}
              >
                <div 
                  style={{
                    ...styles.editorCanvas,
                    width: `${canvasDims.width}px`,
                    height: `${canvasDims.height}px`,
                    backgroundColor: view === 'front' ? canvasBgColor : backBgColor
                  }}
                  onClick={() => setActiveElementId(null)}
                >
                  <div style={styles.safetyGuideLine}></div>
                  <div style={styles.bleedGuideLine}></div>
                  
                  {/* Layers */}
                  {(view === 'front' ? canvasElements : backElements).map(el => {
                    const isSelected = activeElementId === el.id;
                    
                    return (
                      <div 
                        key={el.id}
                        id={`canvas-layer-${el.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveElementId(el.id);
                        }}
                        onMouseDown={(e) => handleElementMouseDown(e, el)}
                        style={{
                          position: 'absolute',
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: el.width ? `${el.width}px` : 'auto',
                          height: el.height ? `${el.height}px` : 'auto',
                          transform: `rotate(${el.rotation || 0}deg)`,
                          transformOrigin: 'center center',
                          cursor: el.isLocked ? 'not-allowed' : 'move',
                          border: isSelected ? '1px dashed var(--color-border)' : '1px solid transparent',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: el.align === 'center' ? 'center' : 'flex-start'
                        }}
                      >
                        {isSelected && !el.isLocked && (
                          <>
                            <div onMouseDown={(e) => handleRotateMouseDown(e, el)} style={styles.rotateHandleAnchor} title="Rotate"></div>
                            <div onMouseDown={(e) => handleResizeMouseDown(e, el)} style={styles.resizeHandleAnchor} title="Resize"></div>
                            <div onClick={(e) => { e.stopPropagation(); handleDuplicateElement(el); }} style={styles.duplicateHandleAnchor} title="Duplicate">📋</div>
                            <div onClick={(e) => { e.stopPropagation(); handleToggleLock(el.id); }} style={styles.lockHandleAnchor} title="Lock">🔓</div>
                            <div onClick={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }} style={styles.deleteHandleAnchor} title="Delete">✕</div>
                          </>
                        )}

                        {el.type === 'text' && (
                          <div 
                            style={{
                              fontSize: `${el.fontSize || 14}px`,
                              fontFamily: el.fontFamily || 'Outfit',
                              color: el.color || '#000000',
                              fontWeight: el.fontWeight || 'normal',
                              width: '100%',
                              height: '100%',
                              textAlign: el.align || 'left',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {el.content}
                          </div>
                        )}

                        {el.type === 'shape' && (
                          <div 
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: el.content.includes('solid') ? el.color : 'transparent',
                              border: el.content.includes('border') ? `2px solid ${el.color}` : 'none',
                              borderRadius: el.content.includes('circle') ? '50%' : '0%',
                              clipPath: el.content.includes('triangle') ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                            }}
                          ></div>
                        )}

                        {el.type === 'graphic' && (
                          <div style={{ width: '100%', height: '100%' }}>
                            {PRESET_GRAPHICS[el.content] ? PRESET_GRAPHICS[el.content](el.color) : '★'}
                          </div>
                        )}

                        {el.type === 'image' && (
                          <img 
                            src={el.content} 
                            alt="layer" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        )}

                        {el.type === 'qrcode' && (
                          <div style={styles.qrMockupBox}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" style={{width:'80%', height:'80%'}}>
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <rect x="7" y="7" width="3" height="3" fill="#111111" />
                              <rect x="14" y="7" width="3" height="3" fill="#111111" />
                              <rect x="7" y="14" width="3" height="3" fill="#111111" />
                              <rect x="14" y="14" width="3" height="3" fill="#111111" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom bar control elements */}
              <div style={styles.bottomWorkspaceControls}>
                <div style={styles.zoomControlBlock}>
                  <button onClick={() => setEditorZoom(prev => Math.max(50, prev - 10))} style={styles.zoomBtn}>-</button>
                  <span style={{fontSize:'12px', width:'40px', textAlign:'center'}}>{editorZoom}%</span>
                  <button onClick={() => setEditorZoom(prev => Math.min(150, prev + 10))} style={styles.zoomBtn}>+</button>
                </div>

                <div style={styles.pageToggleBlock}>
                  <button 
                    onClick={() => setView('front')}
                    style={{...styles.pageBtnToggle, borderBottom: view === 'front' ? '2.5px solid var(--color-border)' : 'none', fontWeight: view==='front' ? '700' : '400'}}
                  >
                    Front View
                  </button>
                  <button 
                    onClick={() => setView('back')}
                    style={{...styles.pageBtnToggle, borderBottom: view === 'back' ? '2.5px solid var(--color-border)' : 'none', fontWeight: view==='back' ? '700' : '400'}}
                  >
                    Back View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ STEP 4: 3D HAND / ORIENTATION MOCKUP ------------------ */}
      {customizerStep === 'orientation' && (
        <div style={styles.orientationScreen} className="animate-fade-in">
          <div style={styles.orientationLayout}>
            {/* Left perspective columns */}
            <div style={styles.orientationVisualCol}>
              <h3 style={{fontSize: '18px', fontWeight: '700', marginBottom: '24px', textAlign: 'center'}}>Premium Mockup Representation</h3>
              
              {isCard && (
                <div style={styles.mockupHandFrame}>
                  <div style={styles.cardThreeDHolder}>
                    <div 
                      style={{
                        ...styles.cardThreeDBody,
                        backgroundColor: view === 'front' ? canvasBgColor : backBgColor,
                        borderRadius: corners === 'rounded' ? '18px' : '4px'
                      }}
                    >
                      {(view === 'front' ? canvasElements : backElements).map(el => (
                        <div 
                          key={el.id}
                          style={{
                            position: 'absolute',
                            left: `${(el.x / 520) * 100}%`,
                            top: `${(el.y / 300) * 100}%`,
                            width: `${(el.width / 520) * 100}%`,
                            height: `${(el.height / 300) * 100}%`,
                            fontSize: `${(el.fontSize / 300) * 220}px`,
                            color: el.color || '#333',
                            fontWeight: el.fontWeight || 'normal',
                            fontFamily: el.fontFamily || 'Outfit',
                            transform: `rotate(${el.rotation || 0}deg)`,
                            lineHeight: '1',
                            overflow: 'hidden'
                          }}
                        >
                          {el.type === 'text' ? el.content : el.type === 'graphic' ? '⬡' : '◼'}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={styles.handMockupShadow}></div>
                </div>
              )}

              {isTshirt && (
                <div style={styles.clothingMockupFrame}>
                  <svg width="340" height="340" viewBox="0 0 100 100" style={{fill: canvasBgColor, stroke: '#cbd5e1', strokeWidth:'1'}}>
                    <path d="M50,12 L65,18 L70,30 L60,32 L58,22 L58,85 L42,85 L42,22 L40,32 L30,30 L35,18 Z" />
                  </svg>
                  <div style={styles.tshirtPrintContentOverlay}>
                    {canvasElements.map(el => (
                      <div 
                        key={el.id}
                        style={{
                          fontSize: `${(el.fontSize / 3) * 0.5}px`,
                          color: el.color || '#fff',
                          fontFamily: el.fontFamily || 'Outfit',
                          fontWeight: el.fontWeight || 'normal',
                          textAlign: 'center'
                        }}
                      >
                        {el.type === 'text' ? el.content : '⬡'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isDrinkware && (
                <div style={styles.mugMockupFrame}>
                  <div style={styles.mugHandle}></div>
                  <div style={{...styles.mugBody, backgroundColor: canvasBgColor}}>
                    <div style={styles.mugContentOverlay}>
                      {canvasElements.map(el => (
                        <div 
                          key={el.id}
                          style={{
                            fontSize: `${(el.fontSize / 2) * 0.5}px`,
                            color: el.color || '#333',
                            fontFamily: el.fontFamily || 'Outfit',
                            fontWeight: el.fontWeight || 'normal'
                          }}
                        >
                          {el.type === 'text' ? el.content : '⬡'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.mockupToggleRow}>
                <button 
                  onClick={() => setView('front')}
                  style={{...styles.mockupToggleBtn, borderBottom: view==='front' ? '2px solid var(--color-border)' : 'none'}}
                >
                  Front
                </button>
                <button 
                  onClick={() => setView('back')}
                  style={{...styles.mockupToggleBtn, borderBottom: view==='back' ? '2px solid var(--color-border)' : 'none'}}
                >
                  Back
                </button>
              </div>
            </div>

            {/* Right configuration side columns */}
            <div style={styles.orientationFormCol}>
              <h2 style={{fontSize: '28px', fontWeight: '800'}}>Approve & Review</h2>
              <p style={{fontSize: '14px', color: '#555', marginTop: '8px'}}>Please check the placement of all text elements. Ensure your layout fits entirely within the safety boundaries before adding to cart.</p>

              <div style={styles.reviewSpecsTable}>
                <div style={styles.reviewSpecsRow}>
                  <span>Product Format</span>
                  <span style={{fontWeight: '700'}}>{product.name}</span>
                </div>
                <div style={styles.reviewSpecsRow}>
                  <span>Paper corners</span>
                  <span style={{fontWeight: '700'}}>{corners.toUpperCase()}</span>
                </div>
                <div style={styles.reviewSpecsRow}>
                  <span>Coated Finish</span>
                  <span style={{fontWeight: '700'}}>{paperFinish.toUpperCase()}</span>
                </div>
                <div style={styles.reviewSpecsRow}>
                  <span>Quantity ordered</span>
                  <span style={{fontWeight: '700'}}>{quantity} units</span>
                </div>
                <div style={styles.reviewSpecsRow}>
                  <span>Delivery Speed</span>
                  <span style={{fontWeight: '700'}}>{deliverySpeed === 'standard' ? 'Standard Delivery' : 'Same Day Shipping'}</span>
                </div>
              </div>

              <div style={{height: '1px', backgroundColor: '#e2e8f0', margin: '24px 0'}}></div>

              <div style={styles.actionsPanelOrientation}>
                <button 
                  onClick={() => setCustomizerStep('editor')}
                  style={styles.backToEditorBtn}
                >
                  Edit Layout ✏️
                </button>
                <button 
                  onClick={handleBuyNow}
                  style={styles.orientationBuyNowBtn}
                >
                  Buy Now ⚡
                </button>
                <button 
                  onClick={handleAddToCart}
                  style={styles.orientationCartBtn}
                >
                  Add to Cart 🛍️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ VISTAPRINT MODAL OVERLAY: UPLOADS ------------------ */}
      {isUploadModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsUploadModalOpen(false)}>
          <div style={styles.uploadModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Upload your design</h3>
              <button onClick={() => setIsUploadModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>
            
            <div style={styles.modalBody}>
              {/* Left Column: Drag & Drop zone */}
              <div style={styles.modalLeftColumn}>
                <div 
                  style={styles.modalDropzone}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      processNativeFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <div style={styles.modalDropzoneContent}>
                    <span style={{fontSize: '48px', color: '#15a1e2'}}>☁️</span>
                    <button style={styles.deviceUploadBtn}>
                      Upload from this device
                    </button>
                    <button style={styles.phoneUploadBtn} onClick={(e) => { e.stopPropagation(); setIsQrScanMockOpen(true); }}>
                      Upload from phone
                    </button>
                    <div style={{fontSize: '13px', color: '#666', marginTop: '12px'}}>
                      or drag and drop here
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Recently Uploaded Grid */}
              <div style={styles.modalRightColumn}>
                <div style={styles.specsTemplateLink}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <span style={{fontSize:'18px'}}>📖</span>
                    <span style={{fontWeight:'700', fontSize:'14px'}}>Specs and templates</span>
                  </div>
                  <span>❯</span>
                </div>

                <div style={{marginTop: '24px'}}>
                  <h4 style={styles.recentlyUploadedHeader}>Recently uploaded</h4>
                  <div style={styles.recentlyUploadedGrid}>
                    {recentlyUploaded.map((src, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          handleImageUploadSimulate(src);
                          setIsUploadModalOpen(false);
                        }}
                        style={styles.recentImgCard}
                      >
                        <img src={src} alt="recent upload" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ QR CODE MOCK MODAL: UPLOAD FROM PHONE ------------------ */}
      {isQrScanMockOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsQrScanMockOpen(false)}>
          <div style={{...styles.uploadModal, width: '400px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Upload from Phone</h3>
              <button onClick={() => setIsQrScanMockOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={{padding: '24px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" style={{width:'120px', height:'120px', marginBottom: '16px'}}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <rect x="7" y="7" width="3" height="3" fill="#111111" />
                <rect x="14" y="7" width="3" height="3" fill="#111111" />
                <rect x="7" y="14" width="3" height="3" fill="#111111" />
                <rect x="14" y="14" width="4" height="4" fill="#ffcc00" />
              </svg>
              <div style={{fontWeight: '700', fontSize: '15px', color: '#111', marginBottom: '8px'}}>Scan QR Code to Link Device</div>
              <div style={{fontSize: '13px', color: '#555'}}>Scan this QR code using your smartphone camera to upload photos directly from your camera roll into InfiStyle Studio.</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ AI GENERATOR PROMPT POPUP ------------------ */}
      {isAiModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsAiModalOpen(false)}>
          <div style={{...styles.uploadModal, width: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>✨ InfiStyle AI Design Assistant</h3>
              <button onClick={() => setIsAiModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>
            
            <div style={{padding: '24px'}}>
              <p style={{fontSize: '13px', color: '#555', marginBottom: '16px'}}>
                Compose a complete premium layout instantly. Pick one of our curated corporate themes or enter a custom prompt.
              </p>
              
              {/* Preset Themes List */}
              <div style={styles.aiPresetThemeList}>
                <div onClick={() => handleAiCardGeneration('Modern Tech Startup')} style={styles.aiPresetCard}>
                  <span>💻</span>
                  <span>Tech Startup</span>
                </div>
                <div onClick={() => handleAiCardGeneration('Executive Law Firm')} style={styles.aiPresetCard}>
                  <span>⚖️</span>
                  <span>Law Firm</span>
                </div>
                <div onClick={() => handleAiCardGeneration('Organic Cafe')} style={styles.aiPresetCard}>
                  <span>☕</span>
                  <span>Organic Cafe</span>
                </div>
                <div onClick={() => handleAiCardGeneration('Creative Studio')} style={styles.aiPresetCard}>
                  <span>🎨</span>
                  <span>Creative Agency</span>
                </div>
              </div>

              <div style={{height: '1px', backgroundColor: '#e2e8f0', margin: '20px 0'}}></div>

              <label style={styles.panelLabel}>Custom AI Prompt</label>
              <div style={{display:'flex', gap: '8px', marginTop: '6px'}}>
                <input 
                  type="text"
                  placeholder="e.g. minimalist florist logo, black card..."
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  style={styles.aiInputText}
                />
                <button 
                  onClick={() => handleAiCardGeneration(aiCustomPrompt || 'Modern Tech Startup')}
                  style={styles.aiGenerateBtn}
                >
                  Generate
                </button>
              </div>

              {aiStatusMessage && (
                <div style={styles.aiStatusBlock}>
                  {aiStatusMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 0 80px',
    fontFamily: '"Inter", sans-serif',
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px',
    fontWeight: '500'
  },
  titleText: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.2'
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0 16px'
  },
  productDesc: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#475569'
  },
  specsDivider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '20px 0'
  },
  configLayout: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap'
  },
  configGalleryCol: {
    flex: '1.2',
    minWidth: '320px'
  },
  mainMockupFrame: {
    width: '100%',
    height: '350px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1.5px solid var(--color-border)',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainMockupImage: {
    maxWidth: '85%',
    maxHeight: '85%',
    objectFit: 'contain',
    borderRadius: '4px'
  },
  badgePremium: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: '#0f172a',
    color: '#ffcc00',
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '4px',
    letterSpacing: '1px'
  },
  thumbnailRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  },
  thumbnail: {
    width: '70px',
    height: '60px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    overflow: 'hidden'
  },
  configFormCol: {
    flex: '1',
    minWidth: '320px'
  },
  formSection: {
    marginBottom: '20px'
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    display: 'block'
  },
  optionCardsGrid: {
    display: 'flex',
    gap: '12px'
  },
  optionSelectCard: {
    flex: '1',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease'
  },
  cornerStandardIcon: {
    width: '16px',
    height: '16px',
    border: '1.5px solid #0f172a',
    borderRadius: '0px'
  },
  cornerRoundedIcon: {
    width: '16px',
    height: '16px',
    border: '1.5px solid #0f172a',
    borderRadius: '4px'
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  cardNameTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a'
  },
  cardPriceLabel: {
    fontSize: '11px',
    color: '#666',
    marginTop: '2px'
  },
  selectSpecs: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1.5px solid #cbd5e1',
    outline: 'none',
    fontSize: '14px'
  },
  btnGridRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  specBadgeBtn: {
    border: '1.5px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    background: '#ffffff',
    transition: 'all 0.2s ease'
  },
  qtyRowInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  numberInputSpec: {
    width: '80px',
    padding: '10px',
    borderRadius: '6px',
    border: '1.5px solid #cbd5e1',
    outline: 'none'
  },
  ctaCardButtonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  browseDesignsBtn: {
    flex: '1.2',
    backgroundColor: '#15a1e2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '14px 10px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(21, 161, 226, 0.15)'
  },
  uploadDesignBtn: {
    flex: '1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1.5px solid var(--color-border)',
    borderRadius: '6px',
    padding: '14px 10px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  priceStrip: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  exploreTemplatesBlock: {
    marginTop: '56px'
  },
  exploreHeading: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '20px'
  },
  popularTemplatesGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  popularTemplateCard: {
    flex: '1',
    minWidth: '220px',
    backgroundColor: '#ffffff',
    border: '1.5px solid var(--color-border)',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  miniTemplatePreview: {
    width: '100%',
    height: '140px',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '1.5px solid var(--color-border)'
  },
  popularTemplateMeta: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  templatesScreen: {
    padding: '10px 0 60px'
  },
  templatesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  backLinkSmall: {
    background: 'none',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  searchBarBox: {
    width: '320px',
    minWidth: '240px'
  },
  searchTemplatesInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1.5px solid var(--color-border)',
    outline: 'none'
  },
  templatesLayout: {
    display: 'flex',
    gap: '32px'
  },
  templatesSidebar: {
    width: '260px',
    flexShrink: '0',
    backgroundColor: '#ffffff',
    border: '1.5px solid var(--color-border)',
    borderRadius: '10px',
    padding: '20px',
    height: 'fit-content'
  },
  sidebarSectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  filterSection: {
    marginBottom: '20px'
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#666',
    display: 'block',
    marginBottom: '6px'
  },
  selectFilter: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    fontSize: '13px'
  },
  helpPromoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '14px',
    marginTop: '32px',
    border: '1px solid #e2e8f0'
  },
  promoContactBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  templatesGalleryGridCol: {
    flex: '1'
  },
  templatesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px'
  },
  templateGalleryCard: {
    backgroundColor: '#ffffff',
    border: '1.5px solid var(--color-border)',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    height: '220px',
    transition: 'all 0.2s ease'
  },
  templateGalleryPreviewFrame: {
    height: '140px',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '1.5px solid var(--color-border)'
  },
  templateGalleryCardInfo: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: '1'
  },
  colorPaletteIndicators: {
    display: 'flex',
    gap: '4px'
  },
  paletteDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: '1px solid #ddd'
  },
  editorScreen: {
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1.5px solid var(--color-border)',
    boxShadow: 'var(--shadow-md)'
  },
  editorTopBar: {
    backgroundColor: '#ffffff',
    height: '56px',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#1e293b',
    borderBottom: '1px solid #cbd5e1'
  },
  editorHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  vistaprintLogoText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: '18px',
    letterSpacing: '-0.5px'
  },
  activeFileName: {
    fontWeight: '700',
    fontSize: '13px',
    color: '#334155'
  },
  savedStatusText: {
    fontSize: '10px',
    color: '#059669',
    backgroundColor: '#f0fdf4',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600'
  },
  undoRedoGroup: {
    display: 'flex',
    gap: '2px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    padding: '1px',
    marginLeft: '10px'
  },
  historyBtn: {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: '14px',
    cursor: 'pointer',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '2px'
  },
  editorHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  priceBanner: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a'
  },
  previewApproveBtn: {
    backgroundColor: '#15a1e2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  editorWorkspaceLayout: {
    display: 'flex',
    height: '600px'
  },
  editorSidebarTabs: {
    width: '80px',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 0',
    borderRight: '1px solid #cbd5e1',
    flexShrink: '0'
  },
  sidebarTabBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '12px 0',
    cursor: 'pointer',
    color: '#94a3b8',
    transition: 'all 0.2s ease'
  },
  tabIcon: {
    fontSize: '18px',
    marginBottom: '4px'
  },
  tabLabel: {
    fontSize: '10px',
    fontWeight: '500'
  },
  editorPanelContent: {
    width: '260px',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRight: '1px solid #cbd5e1',
    flexShrink: '0',
    overflowY: 'auto'
  },
  panelTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '16px'
  },
  panelGroup: {
    marginBottom: '16px'
  },
  panelLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
    display: 'block'
  },
  selectPanelField: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    fontSize: '13px'
  },
  addTextBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#15a1e2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '12px'
  },
  panelDivider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '16px 0'
  },
  layerEditBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  textareaField: {
    width: '100%',
    height: '60px',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    outline: 'none',
    resize: 'none'
  },
  colorPickerField: {
    width: '100%',
    height: '36px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  emptySelectionMsg: {
    fontSize: '12px',
    color: '#777',
    textAlign: 'center',
    padding: '20px 0',
    lineHeight: '1.4'
  },
  uploadBoxSimulate: {
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '24px 12px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease'
  },
  presetImagesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  presetImgThumb: {
    width: '100%',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    cursor: 'pointer',
    border: '1px solid #cbd5e1'
  },
  presetGraphicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '16px'
  },
  shapeBtn: {
    height: '40px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '20px',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  graphicPresetIconBtn: {
    height: '45px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  colorPaletteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  bgPaletteDot: {
    height: '32px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: '2px solid transparent'
  },
  textPanelInput: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    outline: 'none',
    marginBottom: '12px'
  },
  canvasWorkspaceArea: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6'
  },
  contextualToolbar: {
    position: 'absolute',
    top: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #cbd5e1',
    zIndex: '10'
  },
  toolbarBtn: {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#334155'
  },
  toolbarDivider: {
    width: '1px',
    height: '16px',
    backgroundColor: '#cbd5e1'
  },
  canvasContainerScale: {
    position: 'relative',
    transition: 'transform 0.1s ease',
    transformOrigin: 'center center'
  },
  editorCanvas: {
    borderRadius: '4px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
    border: '1px solid #b2c5d4',
    position: 'relative',
    overflow: 'hidden'
  },
  safetyGuideLine: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    right: '10px',
    bottom: '10px',
    border: '1px dotted rgba(21, 161, 226, 0.4)',
    pointerEvents: 'none',
    borderRadius: '2px'
  },
  bleedGuideLine: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    right: '4px',
    bottom: '4px',
    border: '1px dashed rgba(220, 38, 38, 0.35)',
    pointerEvents: 'none'
  },
  rotateHandleAnchor: {
    position: 'absolute',
    top: '-32px',
    left: '50%',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#ffcc00',
    border: '1.5px solid #0f172a',
    transform: 'translateX(-50%)',
    cursor: 'alias',
    zIndex: '5'
  },
  resizeHandleAnchor: {
    position: 'absolute',
    bottom: '-5px',
    right: '-5px',
    width: '10px',
    height: '10px',
    backgroundColor: '#ffcc00',
    border: '1.5px solid #0f172a',
    cursor: 'se-resize',
    zIndex: '5'
  },
  duplicateHandleAnchor: {
    position: 'absolute',
    top: '-12px',
    left: '-12px',
    fontSize: '12px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '2px',
    padding: '1px 3px'
  },
  lockHandleAnchor: {
    position: 'absolute',
    bottom: '-12px',
    left: '-12px',
    fontSize: '12px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '2px',
    padding: '1px 3px'
  },
  deleteHandleAnchor: {
    position: 'absolute',
    top: '-12px',
    right: '-12px',
    fontSize: '10px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qrMockupBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid #111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomWorkspaceControls: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    borderTop: '1px solid #cbd5e1',
    paddingTop: '16px'
  },
  zoomControlBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  zoomBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  pageToggleBlock: {
    display: 'flex',
    gap: '12px'
  },
  pageBtnToggle: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '6px 12px'
  },
  orientationScreen: {
    padding: '30px 0 60px'
  },
  orientationLayout: {
    display: 'flex',
    gap: '48px',
    flexWrap: 'wrap'
  },
  orientationVisualCol: {
    flex: '1.2',
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  mockupHandFrame: {
    width: '100%',
    height: '350px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  cardThreeDHolder: {
    perspective: '1200px'
  },
  cardThreeDBody: {
    width: '380px',
    height: '220px',
    borderRadius: '6px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
    transform: 'rotateX(30deg) rotateY(-35deg) rotateZ(10deg)',
    transition: 'all 0.4s ease',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  handMockupShadow: {
    position: 'absolute',
    bottom: '20px',
    width: '280px',
    height: '30px',
    background: 'radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 70%)',
    zIndex: '-1'
  },
  clothingMockupFrame: {
    position: 'relative',
    width: '340px',
    height: '340px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tshirtPrintContentOverlay: {
    position: 'absolute',
    top: '38%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '120px'
  },
  mugMockupFrame: {
    width: '320px',
    height: '320px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  mugHandle: {
    position: 'absolute',
    right: '40px',
    width: '50px',
    height: '110px',
    border: '14px solid #e2e8f0',
    borderLeft: 'none',
    borderRadius: '0 40px 40px 0',
    zIndex: '0'
  },
  mugBody: {
    width: '160px',
    height: '180px',
    borderRadius: '12px 12px 18px 18px',
    border: '1px solid #cbd5e1',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    zIndex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  mugContentOverlay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px'
  },
  mockupToggleRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  mockupToggleBtn: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '4px 12px'
  },
  orientationFormCol: {
    flex: '1',
    minWidth: '320px'
  },
  reviewSpecsTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px'
  },
  reviewSpecsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '8px'
  },
  actionsPanelOrientation: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px'
  },
  backToEditorBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1.5px solid var(--color-border)',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer'
  },
  orientationBuyNowBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#15a1e2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(21, 161, 226, 0.15)'
  },
  orientationCartBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#ffcc00',
    color: '#111111',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer'
  },

  // ------------------ VISTAPRINT MODAL STYLES ------------------
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '999',
    backdropFilter: 'blur(3px)'
  },
  uploadModal: {
    backgroundColor: '#ffffff',
    width: '800px',
    borderRadius: '12px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid #cbd5e1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#94a3b8'
  },
  modalBody: {
    display: 'flex',
    height: '420px'
  },
  modalLeftColumn: {
    flex: '1',
    padding: '24px',
    borderRight: '1px solid #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  modalDropzone: {
    border: '2.5px dashed #15a1e2',
    borderRadius: '12px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease'
  },
  modalDropzoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    padding: '20px'
  },
  deviceUploadBtn: {
    backgroundColor: '#15a1e2',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(21, 161, 226, 0.15)'
  },
  phoneUploadBtn: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1.5px solid #cbd5e1',
    padding: '10px 20px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '4px'
  },
  modalRightColumn: {
    width: '320px',
    padding: '24px',
    backgroundColor: '#f8fafc',
    overflowY: 'auto'
  },
  specsTemplateLink: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    cursor: 'pointer'
  },
  recentlyUploadedHeader: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: '12px',
    letterSpacing: '0.5px'
  },
  recentlyUploadedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  recentImgCard: {
    height: '70px',
    borderRadius: '6px',
    border: '1.5px solid #cbd5e1',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#ffffff'
  },
  emptyRecentMsg: {
    fontSize: '11px',
    color: '#94a3b8',
    gridColumn: 'span 3',
    textAlign: 'center',
    padding: '20px 0',
    lineHeight: '1.4'
  },

  // ------------------ AI PROMPT MODAL STYLES ------------------
  aiPresetThemeList: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '12px'
  },
  aiPresetCard: {
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '600'
  },
  aiInputText: {
    flex: '1',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1.5px solid #cbd5e1',
    outline: 'none',
    fontSize: '13px'
  },
  aiGenerateBtn: {
    padding: '10px 20px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer'
  },
  aiStatusBlock: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    color: '#1d4ed8',
    fontSize: '12px',
    textAlign: 'center',
    fontWeight: '600'
  }
};

export default Customizer;
