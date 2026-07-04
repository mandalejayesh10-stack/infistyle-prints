'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/aws/api';
import { cognitoClient } from '@/lib/aws/client';
import { 
  User, Briefcase, Heart, ShoppingBag, Eye, Settings, 
  MapPin, LogOut, CheckCircle, Clock, Truck, ShieldAlert, Sparkles, RefreshCw
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


  const currentTab = searchParams?.get('tab') || 'projects';
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

      const accessToken = localStorage.getItem('infistyle_access_token');
      if (!accessToken) {
        setProjects(MOCK_PROJECTS);
        setOrders(MOCK_ORDERS);
        setLoading(false);
        return;
      }

      try {
        const cognitoUser = await cognitoClient.getUser(accessToken);
        setUser({ id: cognitoUser.username, email: cognitoUser.email, name: cognitoUser.name });
        setProfile({ name: cognitoUser.name, email: cognitoUser.email });

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

        // 2. Fetch user orders from Hono REST API
        const ordersRes = await api.getOrders();
        if (ordersRes && ordersRes.orders) {
          setOrders(ordersRes.orders.map((o: any) => ({
            id: o.orderId,
            date: new Date(o.createdAt).toLocaleDateString(),
            productName: o.items?.[0]?.productName || 'Custom Print Bundle',
            qty: o.items?.[0]?.qty || 100,
            total: Number(o.totalAmount),
            status: o.orderStatus.toLowerCase() as any,
            paymentMethod: o.paymentMethod.toLowerCase(),
            thumbnail: o.items?.[0]?.thumbnail || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=150&q=80',
            address: o.shippingAddress
          })));

          // Extract addresses from orders history
          const addrs = ordersRes.orders.map((o: any) => o.shippingAddress).filter(Boolean);
          setAddresses(addrs.map((a: any, index: number) => ({
            id: `addr_${index}`,
            name: a.name,
            line1: a.line1,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            formatted: a.formatted
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

  const displayProjects = projects.length > 0 ? projects : MOCK_PROJECTS;
  const displayOrders = orders.length > 0 ? orders : MOCK_ORDERS;

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
              
              {/* Tab: Projects */}
              {currentTab === 'projects' && (
                <div className="space-y-4">
                  <h2 className="text-base font-black text-dark-charcoal uppercase tracking-wider mb-2">My Saved Projects</h2>
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
                </div>
              )}

              {/* Tab: Orders */}
              {currentTab === 'orders' && (
                <div className="space-y-4">
                  <h2 className="text-base font-black text-dark-charcoal uppercase tracking-wider mb-2">My Order History</h2>
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
                        <span className="text-dark-charcoal text-sm font-black">{profile?.name || user?.user_metadata?.full_name || 'Guest User'}</span>
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
