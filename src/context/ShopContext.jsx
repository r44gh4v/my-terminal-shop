import React, { createContext, useContext, useState, useEffect } from 'react';
import { terminalClient } from '../api/terminalClient';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [serverCart, setServerCart] = useState({ items: [] });
  const [localCart, setLocalCart] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data on mount
  useEffect(() => {
    terminalClient.viewInit()
      .then(res => {
        const data = res.data || res;
        setProfile(data.user);
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
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
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
    setProfile(res.data || res);
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

  // Orders
  const refreshOrders = async () => {
    const res = await terminalClient.listOrders();
    setOrders(res.data || res);
    return res;
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        profile,
        serverCart,
        localCart,
        updateLocalCartItem,
        clearLocalCart,
        finalizeCart,
        updateProfile,
        addresses,
        addAddress,
        removeAddress,
        setShippingAddress,
        cards,
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