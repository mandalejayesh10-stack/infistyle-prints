const API_BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };
  const token = typeof window !== 'undefined' ? (localStorage.getItem('infistyle_id_token') || getCookie('infistyle_session')) : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

export const api = {
  getCatalog: () => request('/catalog'),
  
  saveDesign: (design: {
    designId?: string;
    name: string;
    productSlug: string;
    canvasState: any;
    previewUrl: string;
  }) => request('/designs', { method: 'POST', body: JSON.stringify(design) }),
  
  getDesigns: () => request('/designs'),
  
  placeOrder: (order: {
    items: any[];
    totalAmount: number;
    taxAmount: number;
    shippingAmount: number;
    paymentMethod: string;
    shippingAddress: any;
  }) => request('/orders', { method: 'POST', body: JSON.stringify(order) }),
  
  getOrders: () => request('/orders'),
  
  getAdminStats: () => request('/admin/stats'),
  
  updateOrderStatus: (userId: string, orderId: string, status: string) => 
    request(`/admin/orders/${userId}/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  
  updateProductPrice: (slug: string, price: number) => 
    request(`/catalog/products/${slug}/price`, { method: 'PUT', body: JSON.stringify({ price }) }),
    
  seedCatalog: () => request('/seed', { method: 'POST' }),

  saveProduct: (product: any) => 
    request('/catalog/products', { method: 'POST', body: JSON.stringify(product) }),
    
  deleteProduct: (slug: string) => 
    request(`/catalog/products/${slug}`, { method: 'DELETE' }),

  savePublicTemplate: (template: {
    id?: string;
    name: string;
    productSlug: string;
    color: string;
    orientation: string;
    industry: string;
    theme: string;
    canvasJson: string;
    thumbnail: string;
  }) => request('/templates', { method: 'POST', body: JSON.stringify(template) }),
  
  getPublicTemplates: (productSlug: string) => request(`/templates/${productSlug}`),
  
  getAllTemplates: () => request('/templates'),
  
  deletePublicTemplate: (productSlug: string, templateId: string) => 
    request(`/templates/${productSlug}/${templateId}`, { method: 'DELETE' }),

  syncCart: (cart: { userId: string; userEmail: string; userName: string; items: any[] }) =>
    request('/cart', { method: 'POST', body: JSON.stringify(cart) }),

  getActiveCarts: () => request('/admin/carts'),
};
