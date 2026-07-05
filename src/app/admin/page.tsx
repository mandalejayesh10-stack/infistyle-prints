'use strict';

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/aws/api';
import { cognitoClient } from '@/lib/aws/client';
import { PRODUCT_CATALOG } from '@/lib/catalog';
import { 
  BarChart3, ShoppingBag, Users, Layers, MapPin, 
  Download, RefreshCw, Save, CheckCircle, Search, LogOut,
  Plus, Edit3, Trash2, X, Image as ImageIcon, PlusCircle
} from 'lucide-react';

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  status: 'received' | 'printing' | 'shipped' | 'delivered';
  paymentMethod: string;
  paymentStatus: string;
  lat: number;
  lng: number;
  address: string;
}

interface ManageProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  base_price: number;
  features: string[];
  images: string[];
}

const MOCK_ADMIN_ORDERS: AdminOrder[] = [
  { id: 'ord_108', customerName: 'Jayesh Patel', customerEmail: 'jayesh@gmail.com', date: '2026-06-21', total: 620.00, status: 'printing', paymentMethod: 'cod', paymentStatus: 'pending', lat: 12.9756, lng: 77.6067, address: 'MG Road, Bengaluru, Karnataka 560001' },
  { id: 'ord_102', customerName: 'Ananya Sen', customerEmail: 'ananya@hotmail.com', date: '2026-06-15', total: 2645.00, status: 'delivered', paymentMethod: 'razorpay', paymentStatus: 'success', lat: 28.6304, lng: 77.2177, address: 'Connaught Place, New Delhi, Delhi 110001' }
];

export default function AdminDashboard() {
  const router = useRouter();


  const [orders, setOrders] = useState<AdminOrder[]>(MOCK_ADMIN_ORDERS);
  const [productsList, setProductsList] = useState<ManageProduct[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(MOCK_ADMIN_ORDERS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Product Manager Form States
  const [showProductForm, setShowProductForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('Visiting Cards');
  const [formPrice, setFormPrice] = useState('');
  const [formFeaturesText, setFormFeaturesText] = useState('');
  const [formImagesList, setFormImagesList] = useState<string[]>(['']);

  // Template Manager States
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [activeProductForTemplates, setActiveProductForTemplates] = useState<ManageProduct | null>(null);
  const [templatesList, setTemplatesList] = useState<any[]>([]);

  // Template Form States
  const [templateEditMode, setTemplateEditMode] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [formTemplateName, setFormTemplateName] = useState('');
  const [formTemplateColor, setFormTemplateColor] = useState('White');
  const [formTemplateOrientation, setFormTemplateOrientation] = useState<'Horizontal' | 'Vertical'>('Horizontal');
  const [formTemplateIndustry, setFormTemplateIndustry] = useState('Corporate');
  const [formTemplateTheme, setFormTemplateTheme] = useState('Minimal');
  const [formTemplateCanvasJson, setFormTemplateCanvasJson] = useState('{"objects":[]}');
  const [formTemplateThumbnail, setFormTemplateThumbnail] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      
      const accessToken = localStorage.getItem('infistyle_access_token');
      if (!accessToken) {
        router.push('/login?next=/admin');
        return;
      }

      try {
        const cognitoUser = await cognitoClient.getUser(accessToken);
        
        // Fetch stats & orders from Hono API
        const stats = await api.getAdminStats();
        if (stats && stats.orders) {
          const mappedOrders = stats.orders.map((o: any) => ({
            id: o.orderId,
            userId: o.PK.replace('USER#', ''),
            customerName: o.userName || 'Guest Customer',
            customerEmail: o.userEmail || 'N/A',
            date: new Date(o.createdAt).toISOString().split('T')[0],
            total: Number(o.totalAmount),
            status: o.orderStatus.toLowerCase() as any,
            paymentMethod: o.paymentMethod.toLowerCase(),
            paymentStatus: o.paymentStatus.toLowerCase(),
            lat: Number(o.shippingAddress?.lat || 20.5937),
            lng: Number(o.shippingAddress?.lng || 78.9629),
            address: o.shippingAddress?.formatted || 'No Address Logged'
          }));
          setOrders(mappedOrders);
          if (mappedOrders.length > 0) {
            setSelectedOrder(mappedOrders[0]);
          }
        }

        // Load catalog products from Hono API
        const res = await api.getCatalog();
        if (res && res.categories) {
          const flatList: ManageProduct[] = [];
          res.categories.forEach((cat: any) => {
            cat.items.forEach((item: any) => {
              flatList.push({
                id: item.slug,
                name: item.name,
                slug: item.slug,
                category: cat.name,
                base_price: item.price,
                features: item.features || [],
                images: [cat.image]
              });
            });
          });
          setProductsList(flatList);
        }

        // Load custom templates
        let templates = [];
        try {
          const res = await api.getAllTemplates();
          if (res && res.templates) {
            templates = res.templates;
          }
        } catch (err) {
          console.error('Failed to load templates from database:', err);
          // Fallback to local storage
          const localTplsJson = localStorage.getItem('infistyle_custom_templates');
          if (localTplsJson) {
            templates = JSON.parse(localTplsJson);
          }
        }
        setTemplatesList(templates);

      } catch (err) {
        console.error('Error fetching admin dashboard details:', err);
        router.push('/');
      }
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  // Update order status in Supabase
  const handleUpdateStatus = async (orderId: string, newStatus: AdminOrder['status']) => {
    try {
      const order = orders.find(o => o.id === orderId) as any;
      if (!order) return;

      await api.updateOrderStatus(order.userId, orderId, newStatus.toUpperCase());

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setToast('Order status updated successfully.');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error(err);
      setToast('Failed to update status.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  // Manage Image list edits in Form
  const handleAddImageUrlField = () => {
    setFormImagesList([...formImagesList, '']);
  };

  const handleImageUrlChange = (index: number, val: string) => {
    const list = [...formImagesList];
    list[index] = val;
    setFormImagesList(list);
  };

  const handleRemoveImageUrlField = (index: number) => {
    if (formImagesList.length <= 1) return;
    const list = formImagesList.filter((_, idx) => idx !== index);
    setFormImagesList(list);
  };

  // Device File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormImagesList(prev => {
          // Remove empty string fields first, then append base64 image data
          const filtered = prev.filter(item => item.trim().length > 0);
          return [...filtered, base64String];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Helper to persist custom products locally so changes are visible instantly across the application
  const saveProductToLocalCache = (prod: any) => {
    try {
      const localProdsJson = localStorage.getItem('infistyle_custom_products');
      let localProds = localProdsJson ? JSON.parse(localProdsJson) : [];
      
      const index = localProds.findIndex((p: any) => p.slug === prod.slug);
      if (index > -1) {
        localProds[index] = { ...localProds[index], ...prod };
      } else {
        localProds.unshift(prod);
      }
      localStorage.setItem('infistyle_custom_products', JSON.stringify(localProds));
    } catch (err) {
      console.error('Failed to save product to local cache:', err);
    }
  };

  // Open Form to add new product
  const handleOpenAddProduct = () => {
    setIsEditMode(false);
    setActiveProductId(null);
    setFormName('');
    setFormSlug('');
    setFormCategory('Visiting Cards');
    setFormPrice('');
    setFormFeaturesText('');
    setFormImagesList(['']);
    setShowProductForm(true);
  };

  // Open Form to edit product features & multiple photos
  const handleOpenEditProduct = (prod: ManageProduct) => {
    setIsEditMode(true);
    setActiveProductId(prod.id);
    setFormName(prod.name);
    setFormSlug(prod.slug);
    setFormCategory(prod.category);
    setFormPrice(prod.base_price.toString());
    setFormFeaturesText((prod.features || []).join('\n'));
    setFormImagesList(prod.images && prod.images.length > 0 ? prod.images : ['']);
    setShowProductForm(true);
  };

  // Save or Insert Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPrice = parseFloat(formPrice);
    if (isNaN(updatedPrice) || updatedPrice < 0) {
      alert('Please enter a valid price.');
      return;
    }

    const featuresList = formFeaturesText.split('\n').filter(f => f.trim().length > 0);
    const validImages = formImagesList.filter(img => img.trim().length > 0);

    const payload = {
      name: formName,
      slug: formSlug || formName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
      category: formCategory,
      base_price: updatedPrice,
      features: featuresList,
      images: validImages,
      options_json: { finishes: ['Standard Matte', 'Standard Glossy'], corners: ['Square'], quantities: [100, 200, 500] }
    };

    // Save to local storage cache immediately so it displays in main pages instantly
    saveProductToLocalCache({
      id: isEditMode && activeProductId ? activeProductId : payload.slug,
      ...payload
    });

    try {
      if (isEditMode && activeProductId) {
        await api.updateProductPrice(payload.slug, updatedPrice);

        setProductsList(productsList.map(p => p.id === activeProductId ? { ...p, ...payload, base_price: updatedPrice } : p));
        setToast('Product details updated successfully.');
      } else {
        setProductsList([...productsList, {
          id: payload.slug,
          ...payload,
          base_price: updatedPrice
        }]);
        setToast('New print product added to catalog.');
      }
      setShowProductForm(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error(err);
      setToast('Failed to update pricing.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  // Delete product from Supabase and cache, or reset default catalog items
  const handleDeleteProduct = async (prodId: string, slug: string) => {
    if (!confirm('Are you sure you want to delete this product? For default catalog products, this will reset them to their default state.')) {
      return;
    }

    // 1. Remove from localStorage cache
    try {
      const localProdsJson = localStorage.getItem('infistyle_custom_products');
      if (localProdsJson) {
        const localProds = JSON.parse(localProdsJson);
        const filtered = localProds.filter((p: any) => p.slug !== slug);
        localStorage.setItem('infistyle_custom_products', JSON.stringify(filtered));
      }
    } catch (err) {
      console.error('Error deleting product from local cache:', err);
    }

    // 2. Revert dynamic status locally
    setToast('Product updated in local view.');

    // 3. Update UI state: revert static catalog item or remove custom item
    const staticItem = PRODUCT_CATALOG.flatMap(c => c.items.map(item => ({ item, catName: c.name }))).find(x => x.item.slug === slug);
    if (staticItem) {
      setProductsList(productsList.map(p => p.slug === slug ? {
        id: slug,
        name: staticItem.item.name,
        slug: slug,
        category: staticItem.catName,
        base_price: staticItem.item.price,
        features: staticItem.item.features,
        images: []
      } : p));
    } else {
      setProductsList(productsList.filter(p => p.id !== prodId && p.slug !== slug));
    }

    setTimeout(() => setToast(''), 3000);
  };

  // Template Manager Handlers
  const handleOpenTemplatesManager = (prod: ManageProduct) => {
    setActiveProductForTemplates(prod);
    handleResetTemplateForm();
    setShowTemplatesModal(true);
  };

  const handleOpenEditTemplate = (tpl: any) => {
    setTemplateEditMode(true);
    setActiveTemplateId(tpl.id);
    setFormTemplateName(tpl.name);
    setFormTemplateColor(tpl.color);
    setFormTemplateOrientation(tpl.orientation);
    setFormTemplateIndustry(tpl.industry);
    setFormTemplateTheme(tpl.theme);
    setFormTemplateCanvasJson(tpl.canvasJson);
    setFormTemplateThumbnail(tpl.thumbnail || '');
  };

  const handleResetTemplateForm = () => {
    setTemplateEditMode(false);
    setActiveTemplateId(null);
    setFormTemplateName('');
    setFormTemplateColor('White');
    setFormTemplateOrientation('Horizontal');
    setFormTemplateIndustry('Corporate');
    setFormTemplateTheme('Minimal');
    setFormTemplateCanvasJson('{"objects":[]}');
    setFormTemplateThumbnail('');
  };

  const handleTemplateThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormTemplateThumbnail(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProductForTemplates) return;

    const payload = {
      id: templateEditMode && activeTemplateId ? activeTemplateId : 'tpl_' + Math.random().toString(36).substr(2, 9),
      productSlug: activeProductForTemplates.slug,
      name: formTemplateName,
      color: formTemplateColor,
      orientation: formTemplateOrientation,
      industry: formTemplateIndustry,
      theme: formTemplateTheme,
      canvasJson: formTemplateCanvasJson,
      thumbnail: formTemplateThumbnail || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
    };

    try {
      // 1. Save to DynamoDB database via Hono API
      await api.savePublicTemplate(payload);

      // 2. Fallback local storage sync
      const localTplsJson = localStorage.getItem('infistyle_custom_templates');
      let localTpls = localTplsJson ? JSON.parse(localTplsJson) : [];

      if (templateEditMode && activeTemplateId) {
        const idx = localTpls.findIndex((t: any) => t.id === activeTemplateId);
        if (idx > -1) {
          localTpls[idx] = payload;
        }
      } else {
        localTpls.push(payload);
      }

      localStorage.setItem('infistyle_custom_templates', JSON.stringify(localTpls));

      // Reload templates from database
      try {
        const allRes = await api.getAllTemplates();
        if (allRes && allRes.templates) {
          setTemplatesList(allRes.templates);
        } else {
          setTemplatesList(localTpls);
        }
      } catch (err) {
        setTemplatesList(localTpls);
      }

      setToast(templateEditMode ? 'Template updated successfully.' : 'New template added.');
      handleResetTemplateForm();
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error(err);
      setToast('Failed to save template.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleDeleteTemplate = async (tplId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      // 1. Delete from DynamoDB database
      const templateToDelete = templatesList.find(t => t.id === tplId);
      if (templateToDelete) {
        await api.deletePublicTemplate(templateToDelete.productSlug, tplId);
      }

      // 2. Delete from local storage fallback
      const localTplsJson = localStorage.getItem('infistyle_custom_templates');
      if (localTplsJson) {
        const localTpls = JSON.parse(localTplsJson);
        const filtered = localTpls.filter((t: any) => t.id !== tplId);
        localStorage.setItem('infistyle_custom_templates', JSON.stringify(filtered));
      }

      // Reload templates list from database
      try {
        const allRes = await api.getAllTemplates();
        if (allRes && allRes.templates) {
          setTemplatesList(allRes.templates);
        } else {
          setTemplatesList(prev => prev.filter(t => t.id !== tplId));
        }
      } catch (err) {
        setTemplatesList(prev => prev.filter(t => t.id !== tplId));
      }

      setToast('Template deleted.');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error(err);
      setToast('Failed to delete template.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  // Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingCount = orders.filter(o => o.status !== 'delivered').length;
  const printingCount = orders.filter(o => o.status === 'printing').length;

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = productsList.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-xs font-bold text-gray-500">Checking Administrator Privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-dark-charcoal text-white border-2 border-primary font-black py-3 px-8 rounded-full shadow-xl z-50 animate-bounce text-xs">
          {toast}
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-yellow-50 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-dark-charcoal tracking-tight">
            Admin <span className="text-primary">Console</span>
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Review live client custom print orders, add new products, manage bullet features, and upload multiple display photos.
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary text-xs py-2 px-6">
          Back to Customer Area
        </Link>
      </div>

      {/* Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="brand-card p-5 flex items-center gap-4 bg-white">
          <div className="h-12 w-12 rounded-full border-2 border-primary bg-yellow-50/10 flex items-center justify-center text-primary">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-gray-400">Total Revenue</span>
            <h3 className="text-xl font-black text-dark-charcoal">₹{totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="brand-card p-5 flex items-center gap-4 bg-white">
          <div className="h-12 w-12 rounded-full border-2 border-primary bg-yellow-50/10 flex items-center justify-center text-primary">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-gray-400">Active Orders</span>
            <h3 className="text-xl font-black text-dark-charcoal">{pendingCount} orders</h3>
          </div>
        </div>

        <div className="brand-card p-5 flex items-center gap-4 bg-white">
          <div className="h-12 w-12 rounded-full border-2 border-primary bg-yellow-50/10 flex items-center justify-center text-primary">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-gray-400">Pending Printing</span>
            <h3 className="text-xl font-black text-dark-charcoal">{printingCount} orders</h3>
          </div>
        </div>

        <div className="brand-card p-5 flex items-center gap-4 bg-white">
          <div className="h-12 w-12 rounded-full border-2 border-primary bg-yellow-50/10 flex items-center justify-center text-primary">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-gray-400">Catalog Items</span>
            <h3 className="text-xl font-black text-dark-charcoal">{productsList.length} items</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8 Cols: Orders Table & Product Manager */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Orders List */}
          <div className="brand-card p-6 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-base font-black text-dark-charcoal uppercase tracking-wider">Print Orders Queue</h2>
              <div className="w-full sm:w-60 relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border-2 border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs text-dark-charcoal font-semibold"
                />
                <Search className="h-4 w-4 text-primary absolute left-3 top-2" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-yellow-50 text-gray-400 font-extrabold uppercase tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total Due</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 font-semibold text-gray-600">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className={`hover:bg-yellow-50/10 ${selectedOrder?.id === ord.id ? 'bg-yellow-50/20' : ''}`}>
                      <td className="py-4 font-black text-dark-charcoal">{ord.id.toUpperCase().slice(0, 8)}</td>
                      <td className="py-4">
                        <p className="font-extrabold text-dark-charcoal leading-none">{ord.customerName}</p>
                        <span className="text-[10px] text-gray-400 font-bold">{ord.customerEmail}</span>
                      </td>
                      <td className="py-4 font-extrabold text-primary">₹{ord.total.toFixed(2)}</td>
                      <td className="py-4">
                        <span className="uppercase text-[10px]">{ord.paymentMethod}</span>
                        <span className={`block text-[8px] font-black uppercase ${ord.paymentStatus === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                          className="input-brand text-[10px] py-1.5 px-1.5 font-bold"
                        >
                          <option value="received">Received</option>
                          <option value="printing">Printing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="py-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 border border-primary hover:bg-primary rounded-lg text-dark-charcoal transition-colors cursor-pointer"
                        >
                          <MapPin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => alert('Downloading print file assets payload...')}
                          className="p-1.5 border border-primary hover:bg-primary rounded-lg text-dark-charcoal transition-colors cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Catalog Product & Price Manager */}
          <div className="brand-card p-6 bg-white relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-dark-charcoal uppercase tracking-wider">Catalog Catalog Manager</h2>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Configure prices, add product specifications, and upload galleries.</p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products by name/category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full input-brand text-xs py-2 font-bold"
              />
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto pr-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-yellow-50 text-gray-400 font-extrabold uppercase tracking-wider">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Base Unit Price</th>
                    <th className="pb-3">Display Images</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 font-semibold text-gray-600">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-yellow-50/10">
                      <td className="py-3 font-extrabold text-dark-charcoal">{prod.name}</td>
                      <td className="py-3">{prod.category}</td>
                      <td className="py-3 font-black text-dark-charcoal">₹{prod.base_price.toFixed(2)}</td>
                      <td className="py-3 font-bold text-gray-400">
                        {prod.images && prod.images.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-dark-charcoal font-extrabold">{prod.images.length}</span> photos
                          </div>
                        ) : (
                          <span>None</span>
                        )}
                      </td>
                      <td className="py-3 text-right flex items-center justify-end gap-3.5">
                        <button
                          onClick={() => handleOpenTemplatesManager(prod)}
                          className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Layers className="h-3.5 w-3.5" /> Templates
                        </button>
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.slug)}
                          className="text-xs text-red-500 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Delivery Pin Map widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="brand-card overflow-hidden bg-white">
            <div className="bg-yellow-50 px-4 py-3 text-[10px] font-black uppercase text-dark-charcoal border-b border-primary/20">
              Delivery Destination Pinboard
            </div>

            {selectedOrder ? (
              <div className="p-4 space-y-4">
                <div className="text-xs font-bold text-gray-600 space-y-1">
                  <p className="font-black text-dark-charcoal">Order: {selectedOrder.id.toUpperCase()}</p>
                  <p>Customer: {selectedOrder.customerName}</p>
                  <p className="line-clamp-2">Address: {selectedOrder.address}</p>
                </div>

                <div className="h-64 bg-zinc-100 flex items-center justify-center relative border border-yellow-100 rounded-xl overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full text-zinc-300 fill-zinc-50" viewBox="0 0 100 100">
                    <path d="M10,20 Q30,10 50,20 T90,20 Q95,50 85,80 T40,90 Q15,60 10,20 Z" stroke="#e2e8f0" strokeWidth="1" />
                    <circle cx="50" cy="50" r="15" stroke="#f4f4f5" strokeWidth="1" fill="none" />
                  </svg>

                  <div className="absolute z-10 flex flex-col items-center animate-bounce" style={{ top: '45%', left: '48%' }}>
                    <MapPin className="h-8 w-8 text-red-500 fill-white" />
                    <div className="bg-dark-charcoal text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-md mt-1 whitespace-nowrap">
                      {selectedOrder.customerName}
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 z-10 bg-white border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black text-gray-400">
                    Coordinates: {selectedOrder.lat.toFixed(4)}, {selectedOrder.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 font-semibold leading-relaxed">
                Select an order from the table to inspect delivery coordinates.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Dynamic Modal Drawer to Add or Edit Products (including multiple photos) */}
      {showProductForm && (
        <div className="fixed inset-0 bg-dark-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border-4 border-primary rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center pb-3 border-b border-yellow-100 mb-6">
              <h3 className="text-lg font-black text-dark-charcoal uppercase tracking-wider">
                {isEditMode ? 'Modify Product Specifications' : 'Insert New Catalog Product'}
              </h3>
              <button
                onClick={() => setShowProductForm(false)}
                className="text-gray-400 hover:text-dark-charcoal font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* Product Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-gray-500">Product Name*</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input-brand text-xs py-2 font-bold"
                  placeholder="E.g. Premium Rounded Corner Cards"
                />
              </div>

              {/* Product Slug (autogenerated or edited) */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-gray-500">Slug (URL link)*</label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="input-brand text-xs py-2 font-bold"
                  placeholder="E.g. premium-rounded-cards"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-gray-500">Category*</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="input-brand text-xs py-2 font-bold"
                  >
                    {['Visiting Cards', 'Stationery', 'Stamps', 'Signs', 'Stickers', 'Clothing', 'Pens', 'Drinkware', 'Custom Polo T-shirts', 'Umbrellas', 'Mugs'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-gray-500">Base Price (₹)*</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="input-brand text-xs py-2 font-bold"
                    placeholder="E.g. 290.00"
                  />
                </div>
              </div>

              {/* Features bullets */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase text-gray-500">Bullet point features</label>
                  <span className="text-[8px] text-gray-400 font-bold">Press Enter for new line</span>
                </div>
                <textarea
                  value={formFeaturesText}
                  onChange={(e) => setFormFeaturesText(e.target.value)}
                  className="input-brand text-xs py-2 h-20 font-bold"
                  placeholder="E.g. Printed on 350 GSM paper&#10;Water resistant matte coating"
                />
              </div>

              {/* Multiple Image URLs Manager */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">DISPLAY PHOTO GALLERY URLS*</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="admin-product-file-picker"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('admin-product-file-picker')?.click()}
                      className="text-[11px] font-extrabold uppercase text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      + ADD PHOTO
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleAddImageUrlField}
                      className="text-[11px] font-extrabold uppercase text-gray-400 hover:text-dark-charcoal cursor-pointer"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {formImagesList.map((imgUrl, idx) => {
                    const isBase64 = imgUrl.startsWith('data:');
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <div className="h-7 w-7 bg-zinc-50 border border-zinc-200 rounded flex-shrink-0 flex items-center justify-center text-zinc-400">
                          {imgUrl.trim().length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgUrl} alt="prev" className="h-full w-full object-cover rounded" />
                          ) : (
                            <ImageIcon className="h-4 w-4" />
                          )}
                        </div>
                        {isBase64 ? (
                          <input
                            type="text"
                            readOnly
                            value="[Device File: Ready to Save]"
                            className="input-brand text-[10px] py-1.5 flex-grow font-bold bg-yellow-50/10 cursor-not-allowed text-primary"
                          />
                        ) : (
                          <input
                            type="url"
                            value={imgUrl}
                            onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                            placeholder="Paste image URL (Unsplash or SVG)"
                            className="input-brand text-[10px] py-1.5 flex-grow font-bold"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrlField(idx)}
                          disabled={formImagesList.length <= 1}
                          className="p-1.5 border border-red-200 hover:border-red-500 rounded-lg text-red-500 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-yellow-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 btn-secondary text-xs py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary text-xs py-2.5 uppercase font-black"
                >
                  Save Product
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Templates Manager Modal */}
      {showTemplatesModal && activeProductForTemplates && (
        <div className="fixed inset-0 bg-dark-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white border-4 border-primary rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center pb-3 border-b border-yellow-100 mb-6">
              <div>
                <h3 className="text-lg font-black text-dark-charcoal uppercase tracking-wider">
                  Manage Templates
                </h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">
                  Product: <span className="text-primary font-bold">{activeProductForTemplates.name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTemplatesModal(false);
                  setActiveProductForTemplates(null);
                }}
                className="text-gray-400 hover:text-dark-charcoal font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Current Templates List */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs text-dark-charcoal uppercase tracking-wide border-b border-yellow-100 pb-2">
                  Existing Templates ({templatesList.filter(t => t.productSlug === activeProductForTemplates.slug).length})
                </h4>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                  {templatesList.filter(t => t.productSlug === activeProductForTemplates.slug).map((tpl) => (
                    <div key={tpl.id} className="flex gap-4 p-3 border border-yellow-100 rounded-2xl hover:bg-yellow-50/10 items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <div className="h-14 w-20 bg-zinc-100 border border-zinc-200 rounded-lg overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-xs font-bold text-gray-600">
                          <p className="font-extrabold text-dark-charcoal text-sm leading-tight line-clamp-1">{tpl.name}</p>
                          <p className="text-[10px] mt-0.5 text-gray-400">
                            Color: {tpl.color} | {tpl.orientation} | {tpl.industry} | {tpl.theme}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTemplate(tpl)}
                          className="p-1.5 border border-primary hover:bg-primary rounded-lg text-dark-charcoal cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-1.5 border border-red-200 hover:border-red-500 rounded-lg text-red-500 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {templatesList.filter(t => t.productSlug === activeProductForTemplates.slug).length === 0 && (
                    <div className="text-center py-12 text-xs text-gray-400 font-semibold border border-dashed border-gray-200 rounded-2xl">
                      No custom templates added yet. Fill out the form to add one.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Add/Edit Form */}
              <div className="border-t lg:border-t-0 lg:border-l border-yellow-100 pt-6 lg:pt-0 lg:pl-6">
                <form onSubmit={handleSaveTemplate} className="space-y-4">
                  <h4 className="font-extrabold text-xs text-dark-charcoal uppercase tracking-wide border-b border-yellow-100 pb-2">
                    {templateEditMode ? 'Modify Template' : 'Add New Template'}
                  </h4>

                  {/* Template Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-gray-500">Template Name*</label>
                    <input
                      type="text"
                      required
                      value={formTemplateName}
                      onChange={(e) => setFormTemplateName(e.target.value)}
                      className="input-brand text-xs py-2 font-bold"
                      placeholder="E.g. Vintage Bold Red Card"
                    />
                  </div>

                  {/* Color & Orientation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-gray-500">Color Palette*</label>
                      <select
                        value={formTemplateColor}
                        onChange={(e) => setFormTemplateColor(e.target.value)}
                        className="input-brand text-xs py-2 font-bold"
                      >
                        {['White', 'Black', 'Yellow', 'Blue', 'Red', 'Green', 'Orange', 'Kraft'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-gray-500">Orientation*</label>
                      <select
                        value={formTemplateOrientation}
                        onChange={(e) => setFormTemplateOrientation(e.target.value as any)}
                        className="input-brand text-xs py-2 font-bold"
                      >
                        <option value="Horizontal">Horizontal</option>
                        <option value="Vertical">Vertical</option>
                      </select>
                    </div>
                  </div>

                  {/* Industry & Theme */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-gray-500">Industry*</label>
                      <select
                        value={formTemplateIndustry}
                        onChange={(e) => setFormTemplateIndustry(e.target.value)}
                        className="input-brand text-xs py-2 font-bold"
                      >
                        {['Corporate', 'Wedding', 'Medical', 'Creative', 'Tech', 'Retail', 'Education', 'Food & Dining'].map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-gray-500">Theme Style*</label>
                      <select
                        value={formTemplateTheme}
                        onChange={(e) => setFormTemplateTheme(e.target.value)}
                        className="input-brand text-xs py-2 font-bold"
                      >
                        {['Minimal', 'Elegant', 'Bold', 'Vintage', 'Modern', 'Colorful'].map(th => (
                          <option key={th} value={th}>{th}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Canvas JSON Layout */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase text-gray-500">Canvas JSON Layout (FabricJS)*</label>
                    </div>
                    <textarea
                      required
                      value={formTemplateCanvasJson}
                      onChange={(e) => setFormTemplateCanvasJson(e.target.value)}
                      className="input-brand text-xs py-2 h-20 font-mono font-bold"
                      placeholder='{"objects":[]}'
                    />
                  </div>

                  {/* Template Thumbnail Manager */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">TEMPLATE PREVIEW THUMBNAIL*</label>
                      <div>
                        <input
                          type="file"
                          id="admin-template-file-picker"
                          accept="image/*"
                          onChange={handleTemplateThumbnailUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('admin-template-file-picker')?.click()}
                          className="text-[11px] font-extrabold uppercase text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          + UPLOAD THUMBNAIL
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <div className="h-10 w-10 bg-zinc-50 border border-zinc-200 rounded flex-shrink-0 flex items-center justify-center text-zinc-400">
                        {formTemplateThumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={formTemplateThumbnail} alt="prev" className="h-full w-full object-cover rounded" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </div>
                      {formTemplateThumbnail.startsWith('data:') ? (
                        <input
                          type="text"
                          readOnly
                          value="[Device File: Ready to Save]"
                          className="input-brand text-[10px] py-1.5 flex-grow font-bold bg-yellow-50/10 cursor-not-allowed text-primary"
                        />
                      ) : (
                        <input
                          type="url"
                          value={formTemplateThumbnail}
                          onChange={(e) => setFormTemplateThumbnail(e.target.value)}
                          placeholder="Paste thumbnail URL or upload file"
                          className="input-brand text-[10px] py-1.5 flex-grow font-bold"
                        />
                      )}
                      {formTemplateThumbnail && (
                        <button
                          type="button"
                          onClick={() => setFormTemplateThumbnail('')}
                          className="p-1.5 border border-red-200 hover:border-red-500 rounded-lg text-red-500 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="pt-4 border-t border-yellow-100 flex gap-4">
                    {templateEditMode && (
                      <button
                        type="button"
                        onClick={handleResetTemplateForm}
                        className="flex-1 btn-secondary text-xs py-2"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-grow btn-primary text-xs py-2 uppercase font-black"
                    >
                      {templateEditMode ? 'Save Template Changes' : 'Add Template'}
                    </button>
                  </div>

                </form>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
