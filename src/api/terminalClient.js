// src/api/terminalClient.js
const BASE_URL = import.meta.env.VITE_TERMINAL_BASE_URL;
// Always use environment token
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
      throw new Error('401 Unauthorized: Invalid personal access token. Verify your PAT');
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
      body: JSON.stringify({ productVariantID: variantId, quantity }),
    }),
  // composite initialization endpoint
  viewInit: () => request('/view/init'),
  // subscriptions
  listSubscriptions: () => request('/subscription'),
  cancelSubscription: (id) => request(`/subscription/${id}`, { method: 'DELETE' }),
  
  // tokens
  listTokens: () => request('/token'),
  createToken: (name) => request('/token', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteToken: (id) => request(`/token/${id}`, { method: 'DELETE' }),
  // user profile
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  // addresses
  listAddresses: () => request('/address'),
  getAddress: (id) => request(`/address/${id}`),
  createAddress: (address) => request('/address', { method: 'POST', body: JSON.stringify(address) }),
  deleteAddress: (addressId) => request(`/address/${addressId}`, { method: 'DELETE' }),
  // set cart shipping address - Fix sending addressID
  setCartAddress: (addressId) => {
    console.log('Setting address ID:', addressId);
    // Try string format since the ID might need to be a string
    return request('/cart/address', { 
      method: 'PUT', 
      body: JSON.stringify({ addressID: String(addressId) }) 
    });
  },
  // set cart payment card - Fix endpoint URL
  setCartCard: (cardId) => {
    console.log('Setting card ID:', cardId);
    return request('/cart/card', { 
      method: 'PUT', 
      body: JSON.stringify({ cardID: cardId }) 
    });
  },
  // orders
  listOrders: () => request('/order'),
  getOrder: (id) => request(`/order/${id}`),
  // payment cards
  listCards: () => request('/card'),
  createCard: (card) => {
    // Add a default token for development purposes
    const cardWithToken = {
      ...card,
      token: 'tok_visa' // Use Stripe's test token
    };
    return request('/card', { method: 'POST', body: JSON.stringify(cardWithToken) });
  },
  deleteCard: (id) => request(`/card/${id}`, { method: 'DELETE' }),
};