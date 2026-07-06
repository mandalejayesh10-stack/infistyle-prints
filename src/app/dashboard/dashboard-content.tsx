'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/aws/api';
import { cognitoClient } from '@/lib/aws/client';
import { 
  User, Briefcase, Heart, ShoppingBag, Eye, Settings, 
  MapPin, LogOut, CheckCircle, Clock, Truck, ShieldAlert, Sparkles, RefreshCw, LayoutDashboard
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  slug: string;
  date: string;
  thumbnail: string;
}

interface Order {
  id: string;
  date: string;
  productName: string;
  qty: number;
  total: number;
  status: 'received' | 'printing' | 'shipped' | 'delivered';
  paymentMethod: string;
  thumbnail: string;
}

const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'My Corporate Card Concept', slug: 'standard-visiting-cards', date: 'June 20, 2026', thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=150&q=80' },
  { id: 'p2', name: 'Premium Suede Letterhead', slug: 'letterheads', date: 'June 18, 2026', thumbnail: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=150&q=80' }
];

const MOCK_ORDERS: Order[] = [
  { id: 'ord_108', date: 'June 21, 2026', productName: 'Standard Visiting Cards', qty: 200, total: 620.00, status: 'printing', paymentMethod: 'cod', thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=150&q=80' },
  { id: 'ord_102', date: 'June 15, 2026', productName: 'Polo T-Shirts', qty: 5, total: 2645.00, status: 'delivered', paymentMethod: 'razorpay', thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80' }
];

const MOCK_FAVOURITES = [
  { name: 'Rounded Corner Cards', slug: 'rounded-corner-visiting-cards', price: 300, image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=150&q=80' },
  { name: 'Photo Mugs', slug: 'photo-mugs', price: 180, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=150&q=80' }
];

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();


  const currentTab = searchParams?.get('tab') || 'overview';
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Supabase fetched lists
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      const activeUser = cognitoClient.getSessionUserSync();
      if (!activeUser) {
        setProjects(MOCK_PROJECTS);
        setOrders(MOCK_ORDERS);
        setLoading(false);
        return;
      }

      setUser({ id: activeUser.username, email: activeUser.email, name: activeUser.name });
      setProfile({ name: activeUser.name, email: activeUser.email });

      try {

        // 1. Fetch user designs from Hono REST API
        const designsRes = await api.getDesigns();
        if (designsRes && designsRes.designs) {
          setProjects(designsRes.designs.map((d: any) => ({
            id: d.designId,
            name: d.name || 'Untitled Design',
            slug: d.productSlug || 'standard-visiting-cards',
            date: new Date(d.createdAt).toLocaleDateString(),
            thumbnail: d.previewUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=150&q=80'
          })));
        }

        // 2. Fetch user orders from Hono REST API & Merge Local Storage fallback
        let apiOrders: Order[] = [];
        let extractedAddresses: any[] = [];

        try {
          const ordersRes = await api.getOrders();
          if (ordersRes && ordersRes.orders) {
            apiOrders = ordersRes.orders.map((o: any) => ({
              id: o.orderId,
              date: new Date(o.createdAt).toLocaleDateString(),
              productName: o.items?.[0]?.productName || 'Custom Print Bundle',
              qty: o.items?.[0]?.qty || 100,
              total: Number(o.totalAmount),
              status: o.orderStatus.toLowerCase() as any,
              paymentMethod: o.paymentMethod.toLowerCase(),
              thumbnail: o.items?.[0]?.thumbnail || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=150&q=80',
              address: o.shippingAddress
            }));
            extractedAddresses = ordersRes.orders.map((o: any) => o.shippingAddress).filter(Boolean);
          }
        } catch (err) {
          console.warn('Failed to load orders from live database, loading local fallback:', err);
        }

        // Merge with local fallback orders
        let localOrders: Order[] = [];
        try {
          const localOrdersJson = localStorage.getItem('infistyle_orders');
          if (localOrdersJson) {
            const parsedLocal = JSON.parse(localOrdersJson);
            localOrders = parsedLocal.map((o: any) => ({
              id: o.orderId,
              date: new Date(o.createdAt || Date.now()).toLocaleDateString(),
              productName: o.items?.[0]?.productName || 'Custom Print Bundle',
              qty: o.items?.[0]?.qty || 100,
              total: Number(o.total || 0),
              status: (o.orderStatus || 'pending').toLowerCase() as any,
              paymentMethod: (o.paymentMethod || 'cod').toLowerCase(),
              thumbnail: o.items?.[0]?.thumbnail || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=150&q=80',
              address: o.shippingAddress
            }));
            
            const localAddrs = parsedLocal.map((o: any) => o.shippingAddress).filter(Boolean);
            extractedAddresses = [...extractedAddresses, ...localAddrs];
          }
        } catch (localErr) {
          console.error('Failed to parse local fallback orders:', localErr);
        }

        const combinedOrders = [...apiOrders, ...localOrders];
        setOrders(combinedOrders);

        // Map combined addresses
        if (extractedAddresses.length > 0) {
          const uniqueAddrsMap = new Map();
          extractedAddresses.forEach((a: any) => {
            if (a && a.line1) {
              uniqueAddrsMap.set(`${a.line1}_${a.pincode}`, a);
            }
          });
          const uniqueAddrs = Array.from(uniqueAddrsMap.values());

          setAddresses(uniqueAddrs.map((a: any, index: number) => ({
            id: `addr_${index}`,
            name: a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Saved Destination',
            line1: a.line1,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            formatted: a.formatted || `${a.line1}, ${a.city}, ${a.state} - ${a.pincode}`
          })));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleTabChange = (tabName: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', tabName);
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleLogout = async () => {
    cognitoClient.signOut();
    window.location.href = '/';
  };

  // Reorder flow
  const handleReorder = (order: Order) => {
    const cartItem = {
      id: Math.random().toString(36).substring(7),
      productName: order.productName,
      productSlug: order.productName.toLowerCase().replace(/ /g, '-'),
      qty: order.qty,
      corners: 'Square',
      finish: 'Standard Matte',
      speed: 'Standard',
      unitPrice: order.total / order.qty,
      thumbnail: order.thumbnail
    };

    const existing = localStorage.getItem('infistyle_cart');
    const cart = existing ? JSON.parse(existing) : [];
    cart.push(cartItem);
    localStorage.setItem('infistyle_cart', JSON.stringify(cart));
    router.push('/cart');
  };

  const displayProjects = projects;
  const displayOrders = orders;

  // Status badges formatter
  const getStatusBadge = (status: Order['status']) => {
    if (status === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-50 text-green-600 border border-green-200">
          <CheckCircle className="h-3 w-3" /> Delivered
        </span>
      );
    } else if (status === 'shipped') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-200">
          <Truck className="h-3 w-3" /> Shipped
        </span>
      );
    } else if (status === 'printing') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-yellow-50 text-yellow-600 border border-yellow-200">
          <RefreshCw className="h-3 w-3 animate-spin" /> Printing
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-zinc-50 text-zinc-500 border border-zinc-200">
          <Clock className="h-3 w-3" /> Received
        </span>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      
      {/* Dashboard Heading Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-yellow-50 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-dark-charcoal tracking-tight">
            Customer <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Manage your custom projects, track pending orders, and configure your address preferences.
          </p>
        </div>

        {profile?.is_admin && (
          <Link href="/admin" className="btn-primary text-xs py-2 px-6">
            Go to Admin Dashboard
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="brand-card p-5 space-y-2.5">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'projects', label: 'My Projects', icon: Briefcase },
              { id: 'orders', label: 'Order History', icon: ShoppingBag },
              { id: 'favourites', label: 'Favourites', icon: Heart },
              { id: 'account', label: 'My Account', icon: User }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all ${
                    currentTab === tab.id
                      ? 'bg-primary text-dark-charcoal'
                      : 'hover:bg-yellow-50 text-gray-600 hover:text-dark-charcoal'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="border-t border-yellow-100 pt-3 mt-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Panel Content area */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Tab: Overview */}
              {currentTab === 'overview' && (
                <div className="space-y-8">
                  {/* Welcome Greeting */}
                  <div className="text-left">
                    <h2 className="text-3xl font-black text-dark-charcoal tracking-tight">
                      Hello, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Customer'}.
                    </h2>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      Here's what's going on in your account.
                    </p>
                  </div>

                  {/* Snapshot Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="brand-card p-6 flex flex-col justify-between h-36">
                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-left">Account Snapshot</h4>
                        <p className="text-3xl font-black text-dark-charcoal mt-2 text-left">{projects.length} Print Projects</p>
                      </div>
                      <button 
                        onClick={() => handleTabChange('projects')} 
                        className="text-xs font-bold text-primary text-left hover:underline"
                      >
                        View saved projects
                      </button>
                    </div>

                    <div className="brand-card p-6 flex flex-col justify-between h-36">
                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-left">Brand Kits</h4>
                        <p className="text-xl font-black text-dark-charcoal mt-3 text-left">Create your Brand Kit</p>
                      </div>
                      <a 
                        href="#brand-kit" 
                        className="text-xs font-bold text-primary text-left hover:underline"
                      >
                        Get customized recommendations
                      </a>
                    </div>
                  </div>

                  {/* Orders Summary */}
                  <div className="brand-card p-6 text-left">
                    <h3 className="text-sm font-black text-dark-charcoal uppercase tracking-wider mb-4">Orders</h3>
                    {orders.length === 0 ? (
                      <div className="space-y-4">
                        <p className="text-xs text-gray-500 font-semibold">
                          You don't have any orders yet. When you've placed your first order, you'll see it here.
                        </p>
                        <Link href="/catalog" className="inline-block btn-primary text-xs py-2 px-6 font-bold uppercase tracking-wider">
                          Continue Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-yellow-50">
                        {orders.slice(0, 1).map((ord) => (
                          <div key={ord.id} className="pt-2 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex gap-4 items-center">
                              <div className="h-12 w-12 bg-yellow-50 rounded-lg overflow-hidden border border-primary/20 flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={ord.thumbnail} alt={ord.productName} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-xs text-dark-charcoal">{ord.productName}</h4>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Order ID: {ord.id.toUpperCase()} • Qty: {ord.qty}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                              <span className="font-black text-xs text-primary">₹{ord.total.toFixed(2)}</span>
                              {getStatusBadge(ord.status)}
                            </div>
                          </div>
                        ))}
                        <div className="pt-4 text-left">
                          <button onClick={() => handleTabChange('orders')} className="text-xs font-bold text-primary hover:underline">
                            View all order history
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Latest Projects */}
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-dark-charcoal uppercase tracking-wider">Latest Projects</h3>
                      <button onClick={() => handleTabChange('projects')} className="text-xs font-bold text-primary hover:underline">
                        View all
                      </button>
                    </div>
                    {displayProjects.length === 0 ? (
                      <p className="text-xs text-gray-500 font-semibold italic">No projects saved yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {displayProjects.slice(0, 4).map((proj) => (
                          <div key={proj.id} className="brand-card p-3 space-y-3 flex flex-col justify-between">
                            <div className="aspect-square bg-yellow-50 rounded-lg overflow-hidden border border-primary/20 flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={proj.thumbnail} alt={proj.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-[10px] sm:text-xs text-dark-charcoal truncate">{proj.name}</h4>
                              <p className="text-[9px] text-gray-400 font-semibold">Saved: {proj.date}</p>
                            </div>
                            <Link href={`/editor/${proj.slug}`} className="block text-center btn-primary text-[9px] sm:text-[10px] py-1.5 w-full font-bold">
                              Edit
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Personalise recommendations section */}
                  <div id="brand-kit" className="brand-card p-6 scroll-mt-6 text-left">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      {/* Left: Input details */}
                      <div className="lg:col-span-6 space-y-4">
                        <h3 className="text-sm font-black text-dark-charcoal uppercase tracking-wider">Personalise your recommendations</h3>
                        <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                          Create a Brand Kit to keep track of your logo, colours, fonts and more. Get recommendations based on your brand and style across Infistyle.
                        </p>
                        
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-[10px] font-black text-dark-charcoal uppercase tracking-widest mb-1.5">Business Name</label>
                            <input 
                              type="text" 
                              placeholder="Business name" 
                              className="w-full px-3 py-2 border-2 border-primary rounded focus:outline-none text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-dark-charcoal uppercase tracking-widest mb-1.5">Logo</label>
                            <div className="border-2 border-dashed border-primary/30 rounded p-4 text-center cursor-pointer hover:bg-yellow-50/20 transition-all flex flex-col items-center justify-center gap-1.5">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles className="h-4.5 w-4.5" />
                              </div>
                              <span className="text-[10px] font-black text-dark-charcoal uppercase tracking-wider">Upload or choose logo</span>
                            </div>
                          </div>

                          <button className="btn-primary text-xs py-2 px-6 font-bold uppercase tracking-wider">
                            Create Brand Kit
                          </button>
                        </div>
                      </div>

                      {/* Right: Mockups display */}
                      <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                        <div className="aspect-square bg-slate-50 border border-neutral-100 rounded-2xl overflow-hidden p-3 flex flex-col justify-center items-center text-center relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80" 
                            alt="Branded Mug" 
                            className="w-4/5 h-4/5 object-contain"
                          />
                          <div className="absolute inset-0 bg-dark-charcoal/5 backdrop-blur-[0.5px] flex items-center justify-center p-4">
                            <span className="text-[8px] sm:text-[9px] font-black tracking-widest bg-white/95 text-dark-charcoal py-1.5 px-3 border border-primary/30 rounded uppercase shadow-sm">
                              Your Logo Here
                            </span>
                          </div>
                        </div>

                        <div className="aspect-square bg-slate-50 border border-neutral-100 rounded-2xl overflow-hidden p-3 flex flex-col justify-center items-center text-center relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80" 
                            alt="Branded Business Card" 
                            className="w-4/5 h-4/5 object-contain"
                          />
                          <div className="absolute inset-0 bg-dark-charcoal/5 backdrop-blur-[0.5px] flex items-center justify-center p-4">
                            <span className="text-[8px] sm:text-[9px] font-black tracking-widest bg-white/95 text-dark-charcoal py-1.5 px-3 border border-primary/30 rounded uppercase shadow-sm">
                              Your Logo Here
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommended for you */}
                  <div className="space-y-4 text-left">
                    <h3 className="text-sm font-black text-dark-charcoal uppercase tracking-wider">Recommended for you</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { name: 'Custom Bookmarks', price: 'From ₹32.00 each', qty: '5 units', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=250&q=80', slug: 'bookmarks' },
                        { name: 'Dutees Pocket Polo T-Shirts', price: '₹825.00 - ₹990.00 each', qty: '1 unit', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=250&q=80', slug: 'mens-polo' },
                        { name: 'Keychain with Light', price: 'From ₹250.00 each', qty: '1 unit', image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=250&q=80', slug: 'keychains' },
                        { name: 'Green with Silver Ball Pens', price: '₹40.00 - ₹55.00 each', qty: 'Minimum quantity 5', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=250&q=80', slug: 'pens' }
                      ].map((prod, index) => (
                        <div key={index} className="brand-card p-4 space-y-4 flex flex-col justify-between relative group">
                          <button className="absolute top-3.5 right-3.5 h-7 w-7 rounded-full bg-white/90 border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors shadow-sm">
                            <Heart className="h-4 w-4" />
                          </button>
                          
                          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover rounded-lg" />
                          </div>

                          <div className="space-y-1 text-left">
                            <h4 className="font-extrabold text-xs text-dark-charcoal line-clamp-2 leading-tight min-h-[32px]">{prod.name}</h4>
                            <p className="text-[10px] text-primary font-black">{prod.price}</p>
                            <p className="text-[9px] text-gray-400 font-semibold">{prod.qty}</p>
                          </div>

                          <Link href={`/product/${prod.slug}`} className="w-full text-center btn-primary text-[10px] py-2 font-bold uppercase tracking-wider">
                            Edit Design
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab: Projects */}
              {currentTab === 'projects' && (
                <div className="space-y-4">
                  <h2 className="text-base font-black text-dark-charcoal uppercase tracking-wider mb-2">My Saved Projects</h2>
                  {displayProjects.length === 0 ? (
                    <div className="brand-card p-8 text-center space-y-3">
                      <p className="text-sm text-gray-500 font-semibold">You don't have any saved projects yet.</p>
                      <Link href="/catalog" className="inline-block btn-primary text-xs py-2 px-6 font-bold uppercase tracking-wider">
                        Start Creating
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {displayProjects.map((proj) => (
                        <div key={proj.id} className="brand-card p-4 flex gap-4 items-center">
                          <div className="h-16 w-16 bg-yellow-50 rounded-lg overflow-hidden border border-primary/20 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={proj.thumbnail} alt={proj.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-extrabold text-sm text-dark-charcoal truncate">{proj.name}</h3>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Saved: {proj.date}</p>
                            <div className="mt-3 flex gap-2">
                              <Link href={`/editor/${proj.slug}`} className="btn-primary text-[10px] py-1 px-3">
                                Edit Design
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Orders */}
              {currentTab === 'orders' && (
                <div className="space-y-4">
                  <h2 className="text-base font-black text-dark-charcoal uppercase tracking-wider mb-2">My Order History</h2>
                  {displayOrders.length === 0 ? (
                    <div className="brand-card p-8 text-center space-y-3">
                      <p className="text-sm text-gray-500 font-semibold">You don't have any orders yet.</p>
                      <Link href="/catalog" className="inline-block btn-primary text-xs py-2 px-6 font-bold uppercase tracking-wider">
                        Shop Now
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayOrders.map((ord) => (
                        <div key={ord.id} className="brand-card p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-yellow-50 pb-3">
                            <div>
                              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">ORDER ID</span>
                              <span className="font-black text-xs text-dark-charcoal">{ord.id.toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">ORDER DATE</span>
                              <span className="font-bold text-xs text-gray-600">{ord.date}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">PAYMENT METHOD</span>
                              <span className="font-bold text-xs text-gray-600 uppercase">{ord.paymentMethod}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">TOTAL AMOUNT</span>
                              <span className="font-black text-xs text-primary">₹{ord.total.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Order Item Details */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex gap-4 items-center">
                              <div className="h-14 w-14 bg-yellow-50 rounded-lg overflow-hidden border border-primary/20 flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={ord.thumbnail} alt={ord.productName} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h3 className="font-extrabold text-xs text-dark-charcoal leading-tight">{ord.productName}</h3>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Quantity: {ord.qty} units</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-0 border-yellow-50 pt-3 sm:pt-0">
                              {getStatusBadge(ord.status)}
                              <button
                                onClick={() => handleReorder(ord)}
                                className="btn-primary text-[10px] py-1 px-4"
                              >
                                Reorder
                              </button>
                            </div>
                          </div>

                          {/* Progress Stepper Stepped Layout */}
                          <div className="pt-2">
                            <div className="flex justify-between relative">
                              {/* Stepper background line */}
                              <div className="absolute top-2.5 left-0 right-0 h-1 bg-zinc-100 -z-10"></div>
                              <div 
                                className="absolute top-2.5 left-0 h-1 bg-primary -z-10 transition-all duration-300"
                                style={{
                                  width: ord.status === 'received' ? '0%' : ord.status === 'printing' ? '33%' : ord.status === 'shipped' ? '66%' : '100%'
                                }}
                              ></div>

                              {['received', 'printing', 'shipped', 'delivered'].map((step, idx) => {
                                const active = ord.status === step;
                                const done = ['received', 'printing', 'shipped', 'delivered'].indexOf(ord.status) >= idx;
                                return (
                                  <div key={step} className="flex flex-col items-center">
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                                      active ? 'bg-primary border-primary text-dark-charcoal animate-pulse' : done ? 'bg-primary border-primary text-dark-charcoal' : 'bg-white border-zinc-200 text-zinc-400'
                                    }`}>
                                      {idx + 1}
                                    </div>
                                    <span className={`text-[8px] font-black uppercase mt-1 tracking-wider ${done ? 'text-dark-charcoal' : 'text-zinc-400'}`}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Favourites */}
              {currentTab === 'favourites' && (
                <div className="space-y-4">
                  <h2 className="text-base font-black text-dark-charcoal uppercase tracking-wider mb-2">My Saved Favourites</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_FAVOURITES.map((fav) => (
                      <div key={fav.slug} className="brand-card p-4 flex gap-4 items-center">
                        <div className="h-16 w-16 bg-yellow-50 rounded-lg overflow-hidden border border-primary/20 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={fav.image} alt={fav.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-extrabold text-sm text-dark-charcoal truncate">{fav.name}</h3>
                          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Starting from: ₹{fav.price}</p>
                          <div className="mt-3 flex gap-2">
                            <Link href={`/product/${fav.slug}`} className="btn-primary text-[10px] py-1 px-4">
                              Configure
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Account */}
              {currentTab === 'account' && (
                <div className="space-y-6">
                  <div className="brand-card p-6">
                    <h2 className="text-base font-black text-dark-charcoal uppercase tracking-wider mb-4">Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-gray-600">
                      <div>
                        <span className="text-[9px] font-black text-gray-400 block uppercase">Full Name</span>
                        <span className="text-dark-charcoal text-sm font-black">{profile?.name || user?.name || user?.email?.split('@')[0] || 'Customer'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 block uppercase">Email Address</span>
                        <span className="text-dark-charcoal text-sm">{user?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="brand-card p-6">
                    <h2 className="text-base font-black text-dark-charcoal uppercase tracking-wider mb-4">Saved Shipping Destinations</h2>
                    <div className="space-y-4">
                      {addresses.length === 0 ? (
                        <p className="text-xs text-gray-400 font-semibold">No saved addresses found. Place an order to save delivery details.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addresses.map((addr) => (
                            <div key={addr.id} className="p-4 border-2 border-primary rounded-xl text-xs font-bold text-gray-600 relative">
                              <MapPin className="absolute top-4 right-4 h-5 w-5 text-primary" />
                              <p className="font-black text-dark-charcoal mb-1">{addr.name}</p>
                              <p className="line-clamp-2">{addr.formatted}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

    </div>
  );
}
