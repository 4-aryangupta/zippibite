import axios from 'axios';

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Ensures every outgoing request has a clean Accept header and a timestamp
// to help with cache-busting on protected GET endpoints.
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
// On 401 → dispatch a custom event so AppContext can clear user state
// without creating a circular dependency (context → api → context).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only fire session-expired if there was an actual authenticated request
      // (not during the initial /auth/me probe on app load).
      const url = error.config?.url || '';
      const isAuthProbe = url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthProbe) {
        window.dispatchEvent(new CustomEvent('zb:session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser   = (data)       => api.post('/auth/register', data);
export const loginUser      = (data)       => api.post('/auth/login', data);
export const logoutUser     = ()           => api.post('/auth/logout');
export const fetchMe        = ()           => api.get('/auth/me');

// ── Restaurants ───────────────────────────────────────────────────────────────
export const getRestaurants = (params)     => api.get('/restaurants', { params });
export const getRestaurant  = (id)         => api.get(`/restaurants/${id}`);
export const getMenu        = (id)         => api.get(`/restaurants/${id}/menu`);

// ── Cart ──────────────────────────────────────────────────────────────────────
export const getCart        = ()           => api.get('/cart');
export const addToCart      = (data)       => api.post('/cart/add', data);
export const updateCart     = (data)       => api.put('/cart/update', data);
export const clearCart      = ()           => api.delete('/cart/clear');

// ── Orders ────────────────────────────────────────────────────────────────────
export const createOrder    = (data)       => api.post('/orders', data);
export const getMyOrders    = ()           => api.get('/orders/my');
export const getOrder       = (id)         => api.get(`/orders/${id}`);

// ── User addresses ────────────────────────────────────────────────────────────
export const getAddresses   = ()           => api.get('/user/addresses');
export const saveAddress    = (data)       => api.put('/user/address', data);
export const deleteAddress  = (id)         => api.delete(`/user/address/${id}`);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminGetOrders        = (params) => api.get('/admin/orders', { params });
export const adminUpdateStatus     = (id, data) => api.put(`/admin/orders/${id}/status`, data);
export const adminGetStats         = ()           => api.get('/admin/stats');
export const adminGetRestaurants   = ()           => api.get('/admin/restaurants');
export const adminUpdateRestaurant = (id, data)   => api.put(`/admin/restaurants/${id}`, data);
export const adminCreateRestaurant = (data)       => api.post('/admin/restaurants', data);
export const adminGetMenuItems     = (restaurantId) => api.get('/admin/menu-items', { params: { restaurantId } });
export const adminCreateMenuItem   = (data)       => api.post('/admin/menu-items', data);
export const adminUpdateMenuItem   = (id, data)   => api.put(`/admin/menu-items/${id}`, data);
export const adminDeleteMenuItem   = (id)         => api.delete(`/admin/menu-items/${id}`);
export const adminGetUsers         = ()           => api.get('/admin/users');
export const adminUpdateUser       = (id, data)   => api.put(`/admin/users/${id}`, data);

// Legacy aliases — kept so any existing component imports don't break
export const register = registerUser;
export const login    = loginUser;
export const logout   = logoutUser;
export const getMe    = fetchMe;

export default api;
