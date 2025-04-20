// src/api/terminalClient.js
const BASE_URL = import.meta.env.VITE_TERMINAL_BASE_URL;
const TOKEN = import.meta.env.VITE_TERMINAL_BEARER_TOKEN;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) {
      throw new Error('401 Unauthorized: Invalid personal access token. Verify VITE_TERMINAL_BEARER_TOKEN');
    }
    throw new Error(body.message || `API error: ${res.status}`);
  }
  return res.json();
}

export const terminalClient = {
  listProducts: () => request('/product'),
  getProduct: (id) => request(`/product/${id}`),
  getCart: () => request('/cart'),
  addToCart: (productVariantID, quantity = 1) =>
    request('/cart/item', { method: 'PUT', body: JSON.stringify({ productVariantID, quantity }) }),
  clearCart: () => request('/cart', { method: 'DELETE' }),
  convertCart: () => request('/cart/convert', { method: 'POST' }),
  // create a new subscription for a variant
  createSubscription: (variantId, quantity = 1) =>
    request('/subscription', {
      method: 'POST',
      body: JSON.stringify({ variants: { [variantId]: quantity } }),
    }),
  // composite initialization endpoint
  viewInit: () => request('/view/init'),
  // user profile
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  // addresses
  listAddresses: () => request('/address'),
  getAddress: (id) => request(`/address/${id}`),
  createAddress: (address) => request('/address', { method: 'POST', body: JSON.stringify(address) }),
  deleteAddress: (addressId) => request(`/address/${addressId}`, { method: 'DELETE' }),
  // set cart shipping address
  setCartAddress: (addressId) => request('/cart/address', { method: 'PUT', body: JSON.stringify({ addressID: addressId }) }),
  // set cart payment card
  setCartCard: (cardId) => request('/cart/setCard', { method: 'PUT', body: JSON.stringify({ cardID: cardId }) }),
  // orders
  listOrders: () => request('/order'),
  getOrder: (id) => request(`/order/${id}`),
};