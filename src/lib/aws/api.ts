const API_BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('infistyle_id_token') : null;
  
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
};
