import React, { createContext, useContext, useState, useEffect } from 'react';
import { terminalClient } from '../api/terminalClient';

const ShopContext = createContext();
const USER_TOKEN_KEY = 'terminalShopUserToken';

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [serverCart, setServerCart] = useState({ items: [] });
  const [localCart, setLocalCart] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // no manual import needed; silent PAT generation for new users

  // Fetch initial data on mount
  useEffect(() => {
    async function init() {
      try {
        // silent PAT generation for new users
        const stored = localStorage.getItem(USER_TOKEN_KEY);
        if (!stored) {
          const createRes = await terminalClient.createToken(`auto-${Date.now()}`);
          const newToken = createRes.data || createRes;
          const secret = newToken.token || newToken.value;
          if (secret) localStorage.setItem(USER_TOKEN_KEY, secret);
        }
        // fetch initial app data now that PAT exists
        const res = await terminalClient.viewInit();
        const data = res.data || res;
        setProducts(data.products);
        setServerCart(data.cart);
        const initCart = {};
        (data.cart.items || []).forEach(item => {
          initCart[item.productVariantID || item.id] = item.quantity;
        });
        setLocalCart(initCart);
        setAddresses(data.addresses || []);
        setCards(data.cards || []);
        setOrders(data.orders || []);
        setSubscriptions(data.subscriptions || []);
        // fetch tokens for management
        const tk = await terminalClient.listTokens();
        const tokenList = Array.isArray(tk.data) ? tk.data : Array.isArray(tk) ? tk : [];
        setTokens(tokenList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Update localCart quantity only
  const updateLocalCartItem = (variantId, quantity) => {
    setLocalCart(lc => ({ ...lc, [variantId]: quantity }));
    console.log('localCart updated', { variantId, quantity });
  };

  // clear local cart
  const clearLocalCart = () => {
    setLocalCart({});
  };

  // synchronize localCart to server and finalize (checkout)
  const finalizeCart = async () => {
    try {
      // clear server cart
      await terminalClient.clearCart();
      // add items from localCart
      for (const [vid, qty] of Object.entries(localCart)) {
        if (qty > 0) await terminalClient.addToCart(vid, qty);
      }
      // convert to order
      const res = await terminalClient.convertCart();
      console.log('finalizeCart response', res);
      // reset both carts
      setLocalCart({});
      setServerCart({ items: [] });
    } catch (err) {
      console.error('finalizeCart error', err);
    }
  };

  const clearServerCart = async () => {
    const res = await terminalClient.clearCart();
    setServerCart({ items: [] });
    console.log('serverCart cleared:', res);
  };

  const convertServerCart = async () => {
    const res = await terminalClient.convertCart();
    setServerCart({ items: [] });
    console.log('serverCart converted:', res);
  };

  // Profile actions
  const updateProfile = async (info) => {
    const res = await terminalClient.updateProfile(info);
    return res;
  };

  // Address actions
  const addAddress = async (addr) => {
    const res = await terminalClient.createAddress(addr);
    setAddresses(prev => [...prev, res.data || res]);
    return res;
  };

  const removeAddress = async (id) => {
    await terminalClient.deleteAddress(id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const setShippingAddress = async (id) => {
    await terminalClient.setCartAddress(id);
    setServerCart(c => ({ ...c, addressID: id }));
  };

  // Payment card actions
  const setPaymentCard = async (id) => {
    await terminalClient.setCartCard(id);
    setServerCart(c => ({ ...c, cardID: id }));
  };

  // Card CRUD actions
  const addCard = async (cardInfo) => {
    const res = await terminalClient.createCard(cardInfo);
    setCards(prev => [...prev, res.data || res]);
    return res;
  };

  // Orders
  const refreshOrders = async () => {
    const res = await terminalClient.listOrders();
    setOrders(res.data || res);
    return res;
  };

  // Subscription actions
  const cancelSubscription = async (id) => {
    await terminalClient.cancelSubscription(id);
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const addSubscription = async (variantId, quantity = 1) => {
    const res = await terminalClient.createSubscription(variantId, quantity);
    setSubscriptions(prev => [...prev, res.data || res]);
    return res;
  };

  // Token actions
  const addToken = async (name) => {
    const res = await terminalClient.createToken(name);
    setTokens(prev => [...prev, res.data || res]);
    return res;
  };

  const removeToken = async (id) => {
    await terminalClient.deleteToken(id);
    setTokens(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        updateProfile,
        serverCart,
        localCart,
        updateLocalCartItem,
        clearLocalCart,
        finalizeCart,
        tokens,
        addToken,
        removeToken,
        subscriptions,
        addSubscription,
        cancelSubscription,
        addresses,
        addAddress,
        removeAddress,
        setShippingAddress,
        cards,
        addCard,
        setPaymentCard,
        orders,
        refreshOrders,
        loading,
        error
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}