import React, { createContext, useContext, useState, useEffect } from 'react';
import { terminalClient } from '../api/terminalClient';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [serverCart, setServerCart] = useState({ items: [] });
  const [localCart, setLocalCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products and cart on mount
  useEffect(() => {
    Promise.all([terminalClient.listProducts(), terminalClient.getCart()])
      .then(([prodRes, cartRes]) => {
        setProducts(prodRes.data || prodRes);
        const sc = cartRes.data || cartRes;
        setServerCart(sc);
        // initialize localCart from serverCart items
        const initial = {};
        (sc.items || []).forEach(item => {
          const vid = item.productVariantID || item.id;
          initial[vid] = item.quantity;
        });
        setLocalCart(initial);
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

  return (
    <ShopContext.Provider
      value={{
        products,
        serverCart,
        localCart,
        updateLocalCartItem,
        clearLocalCart,
        finalizeCart,
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