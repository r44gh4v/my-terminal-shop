// src/api/terminalClient.js
const BASE_URL = import.meta.env.VITE_TERMINAL_BASE_URL;
const TOKEN = import.meta.env.VITE_TERMINAL_BEARER_TOKEN;

// Debug: ensure env vars are loaded
console.debug('terminalClient initialized with', { BASE_URL, TOKEN });
if (!TOKEN) {
  throw new Error('No VITE_TERMINAL_BEARER_TOKEN provided. Check your .env and restart dev server.');
}

async function request(path, options = {}) {
  console.debug(`[TerminalClient] Sending request`, {
    url: `${BASE_URL}${path}`,
    method: options.method || 'GET',
    token: TOKEN ? `${TOKEN.slice(0, 8)}...` : 'none',
  });
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
};