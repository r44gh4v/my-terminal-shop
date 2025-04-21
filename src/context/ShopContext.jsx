import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { terminalClient } from '../api/terminalClient';

const ShopContext = createContext();
const LOCAL_CART_KEY = 'terminalShopLocalCart';

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
  
  // Flag to track if localStorage was loaded
  const localStorageLoaded = useRef(false);

  // Load cart from localStorage FIRST, before any API calls
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(LOCAL_CART_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart && typeof parsedCart === 'object') {
          setLocalCart(parsedCart);
          console.log('Loaded cart from localStorage:', parsedCart);
          localStorageLoaded.current = true;
        }
      }
    } catch (err) {
      console.error('Failed to parse saved cart:', err);
      localStorage.removeItem(LOCAL_CART_KEY);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Only save to localStorage if we're not in the initial loading phase
    if (localStorageLoaded.current || Object.keys(localCart).length > 0) {
      console.log('Saving cart to localStorage:', localCart);
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(localCart));
    }
  }, [localCart]);

  // Fetch initial data on mount - after localStorage is checked
  useEffect(() => {
    async function init() {
      try {
        // fetch initial app data
        const res = await terminalClient.viewInit();
        const data = res.data || res;
        setProducts(data.products);
        setServerCart(data.cart);
        
        // Only initialize the cart from server if localStorage was empty
        // and we didn't already load from localStorage
        if (Object.keys(localCart).length === 0 && !localStorageLoaded.current) {
          const initCart = {};
          (data.cart.items || []).forEach(item => {
            initCart[item.productVariantID || item.id] = item.quantity;
          });
          if (Object.keys(initCart).length > 0) {
            setLocalCart(initCart);
          }
        }
        
        setAddresses(data.addresses || []);
        setCards(data.cards || []);
        setOrders(data.orders || []);
        setSubscriptions(data.subscriptions || []);
        
        // Only fetch tokens for reference, but don't expose them in UI
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
    setLocalCart(lc => {
      const updatedCart = { ...lc, [variantId]: quantity };
      // Remove items with quantity 0
      if (quantity === 0) {
        delete updatedCart[variantId];
      }
      return updatedCart;
    });
  };

  // clear local cart
  const clearLocalCart = () => {
    setLocalCart({});
    // Also clear from localStorage
    localStorage.removeItem(LOCAL_CART_KEY);
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
      // Clear localStorage too
      localStorage.removeItem(LOCAL_CART_KEY);
      setServerCart({ items: [] });
      
      // Refresh orders after successful checkout
      refreshOrders();
      
      return res;
    } catch (err) {
      console.error('finalizeCart error', err);
      throw err;
    }
  };

  // Clear server cart
  const clearServerCart = async () => {
    const res = await terminalClient.clearCart();
    setServerCart({ items: [] });
    console.log('serverCart cleared:', res);
  };

  // Convert server cart
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
    // Map frontend state to API expected fields
    const apiAddress = {
      name: addr.name,
      street1: addr.street1,
      street2: addr.street2,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      phone: addr.phone,
      zip: addr.postalCode // Renamed postalCode to zip
    };
    const res = await terminalClient.createAddress(apiAddress);
    const newAddressData = res.data || res; // Extract the actual address object
    // Ensure we have a valid address object before updating state
    if (newAddressData && typeof newAddressData === 'object' && newAddressData.id) {
        setAddresses(prev => [...prev, newAddressData]);
        return newAddressData; // Return the extracted address object
    } else {
        console.error("Invalid address data received from API:", res);
        // Handle error appropriately, maybe throw or return null
        throw new Error("Failed to create address or invalid data received.");
    }
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