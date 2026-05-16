import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('abadal_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-redirect to login on 401
api.interceptors.response.use(
  r => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('abadal_token')
      localStorage.removeItem('abadal_user')
    }
    return Promise.reject(error)
  }
)

// ─── AUTH ───
export const authApi = {
  register: (data: any) => api.post('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data).then(r => r.data),
  adminLogin: (data: { email: string; password: string }) => api.post('/auth/admin-login', data).then(r => r.data),
  forgotPassword: (phone: string) => api.post('/auth/forgot-password', { phone }).then(r => r.data),
  verifyOtp: (phone: string, code: string) => api.post('/auth/verify-otp', { phone, code }).then(r => r.data),
  resetPassword: (tempToken: string, newPassword: string) => api.post('/auth/reset-password', { tempToken, newPassword }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
}

// ─── PRODUCTS ───
export const productsApi = {
  list: (params?: any) => api.get('/products', { params }).then(r => r.data),
  featured: () => api.get('/products/featured').then(r => r.data),
  bySlug: (slug: string) => api.get(`/products/${slug}`).then(r => r.data),
  create: (data: any) => api.post('/products', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/products/${id}`).then(r => r.data),
  setFeatured: (id: string, data: any) => api.patch(`/products/${id}/featured`, data).then(r => r.data),
  addVariant: (id: string, data: any) => api.post(`/products/${id}/variants`, data).then(r => r.data),
  updateVariant: (id: string, data: any) => api.patch(`/products/variants/${id}`, data).then(r => r.data),
  deleteVariant: (id: string) => api.delete(`/products/variants/${id}`).then(r => r.data),
  // Author submission flow
  submit: (data: any) => api.post('/products/submit', data).then(r => r.data),
  mySubmissions: () => api.get('/products/my-submissions').then(r => r.data),
  // Admin approval flow
  pendingSubmissions: () => api.get('/products/pending').then(r => r.data),
  approveSubmission: (id: string) => api.patch(`/products/${id}/approve`).then(r => r.data),
  rejectSubmission: (id: string, note?: string) => api.patch(`/products/${id}/reject`, { note }).then(r => r.data),
}

// ─── CATEGORIES ───
export const categoriesApi = {
  list: () => api.get('/categories').then(r => r.data),
  create: (data: any) => api.post('/categories', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/categories/${id}`).then(r => r.data),
}

// ─── AUTHORS ───
export const authorsApi = {
  list: () => api.get('/authors').then(r => r.data),
  bySlug: (slug: string) => api.get(`/authors/${slug}`).then(r => r.data),
  create: (data: any) => api.post('/authors', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/authors/${id}`, data).then(r => r.data),
  myStats: () => api.get('/authors/me/stats').then(r => r.data),
}

// ─── CART ───
export const cartApi = {
  get: () => api.get('/cart').then(r => r.data),
  add: (variantId: string, quantity: number, priceType: string) => api.post('/cart', { variantId, quantity, priceType }).then(r => r.data),
  update: (itemId: string, quantity: number) => api.patch(`/cart/${itemId}`, { quantity }).then(r => r.data),
  remove: (itemId: string) => api.delete(`/cart/${itemId}`).then(r => r.data),
  clear: () => api.delete('/cart').then(r => r.data),
  merge: (items: any[]) => api.post('/cart/merge', { items }).then(r => r.data),
}

// ─── ADDRESSES ───
export const addressesApi = {
  list: () => api.get('/addresses').then(r => r.data),
  create: (data: any) => api.post('/addresses', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/addresses/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/addresses/${id}`).then(r => r.data),
  setDefault: (id: string) => api.patch(`/addresses/${id}/default`).then(r => r.data),
}

// ─── ORDERS ───
export const ordersApi = {
  create: (data: any) => api.post('/orders', data).then(r => r.data),
  list: (params?: any) => api.get('/orders', { params }).then(r => r.data),
  byId: (id: string) => api.get(`/orders/${id}`).then(r => r.data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }).then(r => r.data),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`).then(r => r.data),
  refund: (id: string, data?: any) => api.post(`/orders/${id}/refund`, data).then(r => r.data),
}

// ─── SHIPPING ───
export const shippingApi = {
  rates: (data: { city: string; weight: number; subtotal: number }) => api.post('/shipping/rates', data).then(r => r.data),
  book: (orderId: string) => api.post(`/shipping/${orderId}/book`).then(r => r.data),
  track: (orderId: string) => api.get(`/shipping/${orderId}/track`).then(r => r.data),
  waybillUrl: (orderId: string) => `${API_BASE}/shipping/${orderId}/waybill`,
}

// ─── REVIEWS ───
export const reviewsApi = {
  list: (productId: string) => api.get('/reviews', { params: { productId } }).then(r => r.data),
  pending: () => api.get('/reviews/pending').then(r => r.data),
  create: (data: any) => api.post('/reviews', data).then(r => r.data),
  approve: (id: string) => api.patch(`/reviews/${id}/approve`).then(r => r.data),
  remove: (id: string) => api.delete(`/reviews/${id}`).then(r => r.data),
}

// ─── WISHLIST ───
export const wishlistApi = {
  list: () => api.get('/wishlist').then(r => r.data),
  add: (productId: string) => api.post('/wishlist', { productId }).then(r => r.data),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`).then(r => r.data),
}

// ─── COUPONS ───
export const couponsApi = {
  list: () => api.get('/coupons').then(r => r.data),
  create: (data: any) => api.post('/coupons', data).then(r => r.data),
  validate: (code: string, orderTotal: number) => api.post('/coupons/validate', { code, orderTotal }).then(r => r.data),
  remove: (id: string) => api.delete(`/coupons/${id}`).then(r => r.data),
}

// ─── USERS (admin) ───
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }).then(r => r.data),
  byId: (id: string) => api.get(`/users/${id}`).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/users/${id}`).then(r => r.data),
}

// ─── PAYMENT ACCOUNTS ───
export const paymentAccountsApi = {
  list: () => api.get('/payment-accounts').then(r => r.data),
  customerFacing: () => api.get('/payment-accounts/customer-facing').then(r => r.data),
  create: (data: any) => api.post('/payment-accounts', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/payment-accounts/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/payment-accounts/${id}`).then(r => r.data),
  setDefault: (id: string) => api.patch(`/payment-accounts/${id}/default`).then(r => r.data),
}

// ─── ROYALTY PAYOUTS ───
export const royaltyApi = {
  list: (params?: any) => api.get('/royalty-payouts', { params }).then(r => r.data),
  mine: () => api.get('/royalty-payouts/me').then(r => r.data),
  create: (data: any) => api.post('/royalty-payouts', data).then(r => r.data),
  markPaid: (id: string, bankRef: string) => api.patch(`/royalty-payouts/${id}`, { status: 'PAID', bankRef }).then(r => r.data),
}

// ─── SETTINGS ───
export const settingsApi = {
  get: () => api.get('/settings').then(r => r.data),
  update: (data: any) => api.patch('/settings', data).then(r => r.data),
}

// ─── ANALYTICS ───
export const analyticsApi = {
  trackEvent: (events: any | any[]) => {
    const body = Array.isArray(events) ? events : [events]
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' })
      navigator.sendBeacon(`${API_BASE}/analytics/event`, blob)
    } else {
      api.post('/analytics/event', body).catch(() => {})
    }
  },
  dashboard: (range = '7d') => api.get('/analytics/dashboard', { params: { range } }).then(r => r.data),
  liveVisitors: () => api.get('/analytics/live-visitors').then(r => r.data),
  topProducts: (range = '7d') => api.get('/analytics/top-products', { params: { range } }).then(r => r.data),
  geography: () => api.get('/analytics/geography').then(r => r.data),
  bookEngagement: (range = '7d') => api.get('/analytics/book-engagement', { params: { range } }).then(r => r.data),
  exportUrl: (type: 'orders' | 'revenue' | 'customers' | 'events') => `${API_BASE}/analytics/export?type=${type}`,
}

// ─── MEDIA ───
export const mediaApi = {
  upload: (file: File): Promise<{ url: string; publicId: string }> => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  },
  remove: (publicId: string) => api.delete(`/media/${publicId}`).then(r => r.data),
}
