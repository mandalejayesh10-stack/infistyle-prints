'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProductBySlug } from '@/lib/catalog';
import { api } from '@/lib/aws/api';
import { Search, SlidersHorizontal, ArrowLeft, Paintbrush, FileUp, Sparkles } from 'lucide-react';

interface DesignTemplate {
  id: string;
  name: string;
  thumbnail: string;
  color: string;
  orientation: 'Horizontal' | 'Vertical';
  industry: string;
  theme: string;
  canvasJson: string;
}

// 10 template mockups with preloaded JSON layout coordinates
const MOCK_TEMPLATES: DesignTemplate[] = [
  {
    id: 't1',
    name: 'Minimal Corporate Yellow',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    color: 'Yellow',
    orientation: 'Horizontal',
    industry: 'Corporate',
    theme: 'Minimal',
    canvasJson: '{"objects":[{"type":"rect","left":0,"top":0,"width":600,"height":400,"fill":"#ffffff"},{"type":"rect","left":0,"top":0,"width":20,"height":400,"fill":"#F5B800"},{"type":"text","text":"INFISTYLE DESIGN","left":50,"top":120,"fontSize":24,"fontWeight":"bold","fill":"#1A1A1A"},{"type":"text","text":"Senior Consultant","left":50,"top":160,"fontSize":14,"fill":"#666666"},{"type":"text","text":"phone: +91 99999 88888\\nemail: hello@infistyle.in","left":50,"top":230,"fontSize":12,"fill":"#888888"}]}'
  },
  {
    id: 't2',
    name: 'Elegant Wedding Floral',
    thumbnail: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80',
    color: 'White',
    orientation: 'Horizontal',
    industry: 'Wedding',
    theme: 'Elegant',
    canvasJson: '{"objects":[{"type":"rect","left":0,"top":0,"width":600,"height":400,"fill":"#fffbf0"},{"type":"text","text":"The Wedding Of","left":200,"top":100,"fontSize":18,"fill":"#F5B800","fontFamily":"Outfit"},{"type":"text","text":"KABIR & ANANYA","left":150,"top":150,"fontSize":28,"fontWeight":"bold","fill":"#1a1a1a"},{"type":"text","text":"SAVE THE DATE • DEC 25","left":210,"top":230,"fontSize":12,"fill":"#666666"}]}'
  },
  {
    id: 't3',
    name: 'Modern Creative Agency',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=400&q=80',
    color: 'Black',
    orientation: 'Horizontal',
    industry: 'Creative',
    theme: 'Bold',
    canvasJson: '{"objects":[{"type":"rect","left":0,"top":0,"width":600,"height":400,"fill":"#1A1A1A"},{"type":"rect","left":0,"top":360,"width":600,"height":40,"fill":"#F5B800"},{"type":"text","text":"PIXEL STUDIO","left":60,"top":100,"fontSize":32,"fontWeight":"bold","fill":"#F5B800"},{"type":"text","text":"Creative Branding & Marketing","left":60,"top":150,"fontSize":14,"fill":"#ffffff"},{"type":"text","text":"www.pixelstudio.in","left":60,"top":280,"fontSize":12,"fill":"#F5B800"}]}'
  },
  {
    id: 't4',
    name: 'Clean Medical Clinic',
    thumbnail: 'https://images.unsplash.com/photo-1572375995501-4b0894dbe341?auto=format&fit=crop&w=400&q=80',
    color: 'Blue',
    orientation: 'Horizontal',
    industry: 'Medical',
    theme: 'Minimal',
    canvasJson: '{"objects":[{"type":"rect","left":0,"top":0,"width":600,"height":400,"fill":"#ffffff"},{"type":"text","text":"Dr. Amit Sharma, MD","left":50,"top":100,"fontSize":24,"fontWeight":"bold","fill":"#0055ff"},{"type":"text","text":"Cardiologist & General Physician","left":50,"top":140,"fontSize":12,"fill":"#666666"},{"type":"rect","left":50,"top":170,"width":300,"height":2,"fill":"#0055ff"},{"type":"text","text":"Metro Heart Center, New Delhi","left":50,"top":200,"fontSize":12,"fill":"#1a1a1a"}]}'
  },
  {
    id: 't5',
    name: 'Bold Tech Startup',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    color: 'Yellow',
    orientation: 'Vertical',
    industry: 'Tech',
    theme: 'Bold',
    canvasJson: '{"objects":[{"type":"rect","left":0,"top":0,"width":400,"height":600,"fill":"#ffffff"},{"type":"rect","left":0,"top":0,"width":400,"height":150,"fill":"#F5B800"},{"type":"text","text":"NEXUS TECH","left":40,"top":60,"fontSize":28,"fontWeight":"bold","fill":"#1A1A1A"},{"type":"text","text":"Cloud Architecture Solutions","left":40,"top":200,"fontSize":14,"fontWeight":"bold","fill":"#F5B800"},{"type":"text","text":"Rohan Mehra\\nCTO & Co-Founder","left":40,"top":260,"fontSize":16,"fill":"#1a1a1a"},{"type":"text","text":"rohan@nexustech.io","left":40,"top":380,"fontSize":12,"fill":"#888888"}]}'
  },
  {
    id: 't6',
    name: 'Vintage Craft Workshop',
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    color: 'Red',
    orientation: 'Horizontal',
    industry: 'Creative',
    theme: 'Vintage',
    canvasJson: '{"objects":[{"type":"rect","left":0,"top":0,"width":600,"height":400,"fill":"#faf3e0"},{"type":"text","text":"THE WOODSHOP","left":160,"top":120,"fontSize":28,"fontWeight":"bold","fill":"#8b4513"},{"type":"text","text":"Handcrafted Furniture Since 1998","left":170,"top":170,"fontSize":12,"fontStyle":"italic","fill":"#555555"},{"type":"rect","left":150,"top":210,"width":300,"height":1,"fill":"#8b4513"},{"type":"text","text":"Jaipur, Rajasthan","left":250,"top":230,"fontSize":12,"fill":"#8b4513"}]}'
  },
  {
    id: 't7',
    name: 'Luxury Hotel Branding',
    thumbnail: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80',
    color: 'White',
    orientation: 'Horizontal',
    industry: 'Corporate',
    theme: 'Elegant',
    canvasJson: '{"objects":[{"type":"rect","left":0,"top":0,"width":600,"height":400,"fill":"#ffffff"},{"type":"rect","left":20,"top":20,"width":560,"height":360,"fill":"transparent","stroke":"#F5B800","strokeWidth":2},{"type":"text","text":"ROYAL PALACE","left":200,"top":120,"fontSize":24,"fontWeight":"bold","fill":"#1a1a1a"},{"type":"text","text":"Boutique Stay & Luxury Suites","left":200,"top":160,"fontSize":11,"fill":"#888888"},{"type":"text","text":"Udaipur, India","left":260,"top":270,"fontSize":12,"fill":"#F5B800"}]}'
  },
  {
    id: 't8',
    name: 'Bold Creative Portfolio',
    thumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80',
    color: 'Yellow',
    orientation: 'Vertical',
    industry: 'Creative',
    theme: 'Bold',
    canvasJson: '{"objects":[{"type":"rect","left":0,"top":0,"width":400,"height":600,"fill":"#F5B800"},{"type":"text","text":"SARA DESIGN","left":40,"top":80,"fontSize":36,"fontWeight":"bold","fill":"#1a1a1a"},{"type":"text","text":"UX/UI & Web Developer","left":40,"top":130,"fontSize":14,"fill":"#ffffff"},{"type":"text","text":"Portfolio: sara.design","left":40,"top":460,"fontSize":14,"fontWeight":"bold","fill":"#1a1a1a"}]}'
  },
  {
    id: 't9',
    name: 'Classic Law Chambers',
    thumbnail: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80',
    color: 'Black',
    orientation: 'Horizontal',
    industry: 'Corporate',
    theme: 'Elegant',
    canvasJson: '{"objects":[{"type":"rect","left":0,"top":0,"width":600,"height":400,"fill":"#111111"},{"type":"text","text":"VERMA & ASSOCIATES","left":60,"top":120,"fontSize":24,"fontWeight":"bold","fill":"#F5B800"},{"type":"text","text":"Advocates & Legal Solicitors","left":60,"top":160,"fontSize":12,"fill":"#aaaaaa"},{"type":"text","text":"Supreme Court of India, New Delhi","left":60,"top":240,"fontSize":11,"fill":"#888888"}]}'
  },
  {
    id: 't10',
    name: 'Creative Tech Lab',
    thumbnail: 'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?auto=format&fit=crop&w=400&q=80',
    color: 'Blue',
    orientation: 'Vertical',
    industry: 'Tech',
    theme: 'Minimal',
    canvasJson: '{"objects":[{"type":"rect","left":0,"top":0,"width":400,"height":600,"fill":"#ffffff"},{"type":"rect","left":0,"top":550,"width":400,"height":50,"fill":"#0055ff"},{"type":"text","text":"HYPER LABS","left":40,"top":80,"fontSize":28,"fontWeight":"bold","fill":"#0055ff"},{"type":"text","text":"Machine Learning Research","left":40,"top":120,"fontSize":12,"fill":"#666666"},{"type":"text","text":"info@hyperlabs.ai","left":40,"top":300,"fontSize":12,"fill":"#1a1a1a"}]}'
  }
];

export default function TemplatesContent() {
  const { slug } = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const router = useRouter();

  const productData = getProductBySlug(slug);
  const qty = searchParams?.get('qty') || '100';
  const corners = searchParams?.get('corners') || 'Square';
  const speed = searchParams?.get('speed') || 'Standard';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedOrientation, setSelectedOrientation] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedTheme, setSelectedTheme] = useState('All');

  if (!productData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-dark-charcoal mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-8">The product slug you are configuring does not exist.</p>
        <Link href="/catalog" className="btn-primary">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const { product, category } = productData;

  const [customTemplates, setCustomTemplates] = useState<DesignTemplate[]>([]);

  useEffect(() => {
    const loadTemplates = async () => {
      let dbTemplates: DesignTemplate[] = [];
      
      // 1. Fetch public database templates from Hono API
      try {
        const res = await api.getPublicTemplates(slug);
        if (res && res.templates) {
          dbTemplates = res.templates;
        }
      } catch (err) {
        console.error('Error loading public templates from Hono:', err);
      }

      // 2. Fetch local storage templates (fallback/development)
      try {
        const localTplsJson = localStorage.getItem('infistyle_custom_templates');
        if (localTplsJson) {
          const allTpls = JSON.parse(localTplsJson);
          const filtered = allTpls.filter((t: any) => t.productSlug === slug);
          filtered.forEach((lt: any) => {
            if (!dbTemplates.some(t => t.id === lt.id)) {
              dbTemplates.push(lt);
            }
          });
        }
      } catch (err) {
        console.error('Error loading local templates:', err);
      }
      
      setCustomTemplates(dbTemplates);
    };

    loadTemplates();
  }, [slug]);

  const isVisitingCard = category.name === 'Visiting Cards';
  const allTemplates = isVisitingCard
    ? [...MOCK_TEMPLATES, ...customTemplates]
    : customTemplates;

  // Filter templates list
  const filteredTemplates = allTemplates.filter(tpl => {
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor = selectedColor === 'All' || tpl.color === selectedColor;
    const matchesOrientation = selectedOrientation === 'All' || tpl.orientation === selectedOrientation;
    const matchesIndustry = selectedIndustry === 'All' || tpl.industry === selectedIndustry;
    const matchesTheme = selectedTheme === 'All' || tpl.theme === selectedTheme;

    return matchesSearch && matchesColor && matchesOrientation && matchesIndustry && matchesTheme;
  });

  const handleSelectTemplate = (tpl: DesignTemplate) => {
    // Save template JSON state in sessionStorage to load in editor
    sessionStorage.setItem('infistyle_selected_template', tpl.canvasJson);
    router.push(
      `/editor/${slug}?qty=${qty}&corners=${corners}&speed=${speed}&templateId=${tpl.id}`
    );
  };

  const handleBlankCanvas = () => {
    sessionStorage.removeItem('infistyle_selected_template');
    router.push(
      `/editor/${slug}?qty=${qty}&corners=${corners}&speed=${speed}`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-yellow-50 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href={`/product/${slug}`}
            className="p-2 border-2 border-primary rounded-full hover:bg-yellow-50 text-dark-charcoal"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-dark-charcoal tracking-tight">
              Design <span className="text-primary">Templates Gallery</span>
            </h1>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Configuring: {product.name} (Qty: {qty} • Corners: {corners} • Speed: {speed})
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-dark-charcoal font-semibold"
          />
          <Search className="h-5 w-5 text-primary absolute left-3.5 top-2.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <div className="brand-card p-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-yellow-100">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h2 className="text-md font-extrabold text-dark-charcoal">Gallery Filters</h2>
            </div>

            {/* Colors */}
            <div>
              <span className="text-xs font-black text-dark-charcoal uppercase tracking-wider block mb-2">Color Palette</span>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'White', 'Black', 'Yellow', 'Blue', 'Red'].map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`text-xs px-2.5 py-1 rounded-md font-bold transition-colors ${
                      selectedColor === c ? 'bg-primary text-dark-charcoal' : 'bg-gray-50 hover:bg-yellow-50 text-gray-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div>
              <span className="text-xs font-black text-dark-charcoal uppercase tracking-wider block mb-2">Orientation</span>
              <div className="grid grid-cols-3 gap-1.5">
                {['All', 'Horizontal', 'Vertical'].map(o => (
                  <button
                    key={o}
                    onClick={() => setSelectedOrientation(o)}
                    className={`text-xs py-1 px-1.5 rounded-md font-bold text-center transition-colors ${
                      selectedOrientation === o ? 'bg-primary text-dark-charcoal' : 'bg-gray-50 hover:bg-yellow-50 text-gray-600'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Industry */}
            <div>
              <span className="text-xs font-black text-dark-charcoal uppercase tracking-wider block mb-2">Industry</span>
              <div className="flex flex-col gap-1.5">
                {['All', 'Corporate', 'Wedding', 'Medical', 'Creative', 'Tech'].map(ind => (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndustry(ind)}
                    className={`text-left text-xs py-1.5 px-2.5 rounded-md font-bold transition-colors ${
                      selectedIndustry === ind ? 'bg-primary text-dark-charcoal' : 'hover:bg-yellow-50 text-gray-600'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <span className="text-xs font-black text-dark-charcoal uppercase tracking-wider block mb-2">Theme Style</span>
              <div className="flex flex-col gap-1.5">
                {['All', 'Minimal', 'Elegant', 'Bold', 'Vintage'].map(th => (
                  <button
                    key={th}
                    onClick={() => setSelectedTheme(th)}
                    className={`text-left text-xs py-1.5 px-2.5 rounded-md font-bold transition-colors ${
                      selectedTheme === th ? 'bg-primary text-dark-charcoal' : 'hover:bg-yellow-50 text-gray-600'
                    }`}
                  >
                    {th}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            {/* 1. Upload Own Design Tile */}
            <div
              onClick={handleBlankCanvas}
              className="brand-card border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-solid bg-yellow-50/10 min-h-[250px] group"
            >
              <div className="h-12 w-12 rounded-full border-2 border-primary bg-white flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-extrabold text-sm text-dark-charcoal">Upload Your Own Design</h3>
              <p className="text-[10px] text-gray-500 mt-1 font-semibold leading-relaxed">
                Start from a blank canvas. Upload your ready PDF, JPG, or PNG files directly inside the editor.
              </p>
            </div>

            {/* 2. Work with Designer Tile */}
            <div
              onClick={handleBlankCanvas} // fallback to blank or editor
              className="brand-card p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-yellow-50/10 min-h-[250px] group"
            >
              <div className="h-12 w-12 rounded-full border-2 border-primary bg-white flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <Paintbrush className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-extrabold text-sm text-dark-charcoal">Work With A Designer</h3>
              <p className="text-[10px] text-gray-500 mt-1 font-semibold leading-relaxed">
                Connect with our expert design team. We will build a customized template matching your branding layout.
              </p>
            </div>

            {/* Template Thumbnails list */}
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className="brand-card overflow-hidden flex flex-col cursor-pointer min-h-[250px] group"
              >
                {/* Thumbnail Image */}
                <div className="relative h-40 bg-yellow-50/10 border-b border-primary overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="bg-white border border-primary px-2 py-0.5 rounded text-[8px] font-black text-dark-charcoal uppercase">
                      {tpl.orientation}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-dark-charcoal line-clamp-1">
                      {tpl.name}
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[9px] font-bold text-gray-400">#{tpl.industry}</span>
                      <span className="text-[9px] font-bold text-gray-400">#{tpl.theme}</span>
                    </div>
                  </div>
                  
                  <button className="w-full btn-primary text-[10px] py-1.5 mt-4">
                    <Sparkles className="h-3 w-3 mr-1" /> Use Template
                  </button>
                </div>
              </div>
            ))}

          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 brand-card bg-yellow-50/10">
              <p className="text-sm font-bold text-gray-500 mb-2">No templates match the selected filters.</p>
              <button
                onClick={() => {
                  setSelectedColor('All');
                  setSelectedOrientation('All');
                  setSelectedIndustry('All');
                  setSelectedTheme('All');
                  setSearchQuery('');
                }}
                className="btn-primary text-xs"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
