'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PRODUCT_CATALOG, Category, SubProduct } from '@/lib/catalog';
import { createClient } from '@/lib/supabase/client';
import { Search, SlidersHorizontal, Eye, Tag, AlertCircle } from 'lucide-react';

export default function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const initialSearch = searchParams?.get('search') || '';
  const initialCategory = searchParams?.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<number>(5000);

  // Sync state with url params if they change
  useEffect(() => {
    setSearchQuery(searchParams?.get('search') || '');
    setSelectedCategory(searchParams?.get('category') || 'All');
  }, [searchParams]);

  // Load products from Supabase (merge with localStorage custom products)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let supabaseProds: any[] = [];
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data) {
          supabaseProds = data;
        }
      } catch (err) {
        console.error('Error fetching from Supabase:', err);
      }

      // Merge localStorage custom products
      const finalProds = [...supabaseProds];
      try {
        const localProdsJson = localStorage.getItem('infistyle_custom_products');
        if (localProdsJson) {
          const localProds = JSON.parse(localProdsJson);
          localProds.forEach((lp: any) => {
            const idx = finalProds.findIndex(p => p.slug === lp.slug);
            if (idx > -1) {
              // Overwrite with locally updated version
              finalProds[idx] = lp;
            } else {
              // Prepend newly added local product
              finalProds.unshift(lp);
            }
          });
        }
      } catch (err) {
        console.error('Error reading custom products from localStorage:', err);
      }

      setDbProducts(finalProds);
      setLoading(false);
    };

    fetchProducts();
  }, [supabase]);

  // Merge static catalog items and dynamic items into a flat list for searching/filtering
  const getCatalogItems = (): { name: string; slug: string; price: number; features: string[]; category: string; image: string }[] => {
    const list: any[] = [];

    // 1. Add all dynamic/custom products (loaded from Supabase & localStorage)
    dbProducts.forEach(p => {
      list.push({
        name: p.name,
        slug: p.slug,
        price: Number(p.base_price),
        features: p.features || [],
        category: p.category,
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
      });
    });

    // 2. Add static PRODUCT_CATALOG items that are not overridden by slug
    PRODUCT_CATALOG.forEach(cat => {
      cat.items.forEach(item => {
        if (!list.some(existing => existing.slug === item.slug)) {
          list.push({
            name: item.name,
            slug: item.slug,
            price: item.price,
            features: item.features,
            category: cat.name,
            image: cat.image
          });
        }
      });
    });

    return list;
  };

  const allItems = getCatalogItems();

  // Filter items
  const filteredItems = allItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesPrice = item.price <= priceRange;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (categoryName === 'All') {
      params.delete('category');
    } else {
      params.set('category', categoryName);
    }
    router.push(`/catalog?${params.toString()}`);
  };

  // Unique categories list
  const categoryOptions = ['All', ...Array.from(new Set(PRODUCT_CATALOG.map(c => c.name)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-yellow-50 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-dark-charcoal tracking-tight">
            Print <span className="text-primary">Catalog</span>
          </h1>
          <p className="text-sm text-gray-500 font-semibold mt-1">
            Browse through our extensive selection of customizable products
          </p>
        </div>

        {/* Dynamic Search Box */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search within results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-dark-charcoal font-semibold"
          />
          <Search className="h-5 w-5 text-primary absolute left-3.5 top-2.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="brand-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-dark-charcoal">Filters</h2>
            </div>

            {/* Categories Filter */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-dark-charcoal uppercase tracking-wider mb-2">Category</h3>
              <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-2">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`text-left text-sm py-1.5 px-3 rounded-lg font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-primary text-dark-charcoal'
                        : 'text-gray-600 hover:bg-yellow-50 hover:text-dark-charcoal'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="border-t border-yellow-100 pt-6 mt-6">
              <h3 className="text-sm font-extrabold text-dark-charcoal uppercase tracking-wider mb-3">Max Price</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="15"
                  max="5000"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>₹15</span>
                  <span className="text-primary font-black">₹{priceRange}</span>
                  <span>₹5,000</span>
                </div>
              </div>
            </div>

            {/* database connection indicator */}
            <div className="border-t border-yellow-100 pt-4 mt-6 flex items-center gap-2 text-xs text-gray-400 font-semibold">
              <AlertCircle className="h-4 w-4 text-green-500" />
              <span>{dbProducts.length > 0 ? 'Loaded from Supabase DB' : 'Using Local Static Catalog'}</span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 brand-card bg-yellow-50/20">
              <p className="text-lg text-gray-500 font-bold mb-4">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setPriceRange(5000);
                }}
                className="btn-primary"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.slug} className="brand-card overflow-hidden flex flex-col h-[400px]">
                  
                  {/* Product Image */}
                  <div className="relative h-48 w-full bg-yellow-50 overflow-hidden border-b border-primary group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-white border border-primary px-2.5 py-1 rounded-full text-xs font-black text-dark-charcoal shadow-sm">
                      ₹{item.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-primary bg-yellow-50 border border-primary/30 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      <h3 className="font-extrabold text-base text-dark-charcoal mt-2 mb-1.5 line-clamp-1">
                        {item.name}
                      </h3>
                      
                      {/* Features bullets preview */}
                      <ul className="text-xs text-gray-500 space-y-1 mt-2 mb-4">
                        {item.features.slice(0, 2).map((feat, idx) => (
                          <li key={idx} className="line-clamp-1 flex items-center gap-1 font-medium">
                            <span className="text-primary font-bold">•</span> {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link href={`/product/${item.slug}`} className="w-full btn-primary text-xs py-2">
                      <Eye className="h-4 w-4 mr-1.5" />
                      Configure & Design
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
