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

  const localStorageLoaded = useRef(false);

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

  useEffect(() => {
    if (localStorageLoaded.current || Object.keys(localCart).length > 0) {
      console.log('Saving cart to localStorage:', localCart);
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(localCart));
    }
  }, [localCart]);

  useEffect(() => {
    async function init() {
      try {
        const res = await terminalClient.viewInit();
        const data = res.data || res;
        setProducts(data.products);
        setServerCart(data.cart);

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

  const fetchProducts = async () => {
    try {
      const res = await terminalClient.listProducts();
      const productData = res.data || res;
      setProducts(productData);
      return productData;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      throw err;
    }
  };

  const getProduct = async (id) => {
    try {
      const res = await terminalClient.getProduct(id);
      return res.data || res;
    } catch (err) {
      console.error(`Error fetching product ${id}:`, err);
      setError(err.message);
      throw err;
    }
  };

  const updateLocalCartItem = (variantId, quantity) => {
    setLocalCart(lc => {
      const updatedCart = { ...lc, [variantId]: quantity };
      if (quantity === 0) {
        delete updatedCart[variantId];
      }
      return updatedCart;
    });
  };

  const clearLocalCart = () => {
    setLocalCart({});
    localStorage.removeItem(LOCAL_CART_KEY);
  };

  const syncCartToServer = async () => {
    try {
      await terminalClient.clearCart();
      for (const [vid, qty] of Object.entries(localCart)) {
        if (qty > 0) {
          await terminalClient.addToCart(vid, qty);
        }
      }
      const res = await terminalClient.getCart();
      setServerCart(res.data || res);
      return res;
    } catch (err) {
      console.error('Error syncing cart to server:', err);
      setError(err.message);
      throw err;
    }
  };

  const finalizeCart = async () => {
    try {
      await syncCartToServer();
      const res = await terminalClient.convertCart();
      console.log('finalizeCart response', res);
      
      // Clear local cart
      setLocalCart({});
      localStorage.removeItem(LOCAL_CART_KEY);
      
      // Reset server cart
      setServerCart({ items: [] });
      
      // Refresh orders to update the orders list with the new order
      const updatedOrders = await fetchOrders();
      console.log('Orders refreshed after checkout:', updatedOrders);
      
      return res;
    } catch (err) {
      console.error('finalizeCart error', err);
      throw err;
    }
  };

  const getProfile = async () => {
    try {
      const res = await terminalClient.getProfile();
      return res.data || res;
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (info) => {
    try {
      const res = await terminalClient.updateProfile(info);
      return res.data || res;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await terminalClient.listAddresses();
      const addressData = res.data || res;
      setAddresses(addressData);
      return addressData;
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err.message);
      throw err;
    }
  };

  const getAddress = async (id) => {
    try {
      const res = await terminalClient.getAddress(id);
      return res.data || res;
    } catch (err) {
      console.error(`Error fetching address ${id}:`, err);
      setError(err.message);
      throw err;
    }
  };

  const addAddress = async (addr) => {
    try {
      const apiAddress = {
        name: addr.name,
        street1: addr.street1,
        street2: addr.street2,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        phone: addr.phone,
        zip: addr.postalCode
      };

      const res = await terminalClient.createAddress(apiAddress);
      const newAddressData = res.data || res;

      if (newAddressData && typeof newAddressData === 'object' && newAddressData.id) {
        setAddresses(prev => [...prev, newAddressData]);
        return newAddressData;
      } else {
        console.error("Invalid address data received from API:", res);
        throw new Error("Failed to create address or invalid data received.");
      }
    } catch (err) {
      console.error('Error adding address:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateAddress = async (id, addr) => {
    try {
      console.warn('Address update not supported by API. Deleting and re-creating address instead.');
      await removeAddress(id);
      return await addAddress(addr);
    } catch (err) {
      console.error(`Error updating address ${id}:`, err);
      setError(err.message);
      throw err;
    }
  };

  const removeAddress = async (id) => {
    try {
      await terminalClient.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      console.error(`Error removing address ${id}:`, err);
      setError(err.message);
      throw err;
    }
  };

  const setShippingAddress = async (id) => {
    try {
      await terminalClient.setCartAddress(id);
      setServerCart(c => ({ ...c, addressID: id }));
      return true;
    } catch (err) {
      console.error(`Error setting shipping address ${id}:`, err);
      setError(err.message);
      throw err;
    }
  };

  const fetchCards = async () => {
    try {
      const res = await terminalClient.listCards();
      const cardData = res.data || res;
      setCards(cardData);
      return cardData;
    } catch (err) {
      console.error('Error fetching payment cards:', err);
      setError(err.message);
      throw err;
    }
  };

  const addCard = async (cardInfo) => {
    try {
      const res = await terminalClient.createCard(cardInfo);
      const newCard = res.data || res;
      setCards(prev => [...prev, newCard]);
      return newCard;
    } catch (err) {
      console.error('Error adding payment card:', err);
      setError(err.message);
      throw err;
    }
  };

  const removeCard = async (id) => {
    try {
      await terminalClient.deleteCard(id);
      setCards(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error(`Error removing card ${id}:`, err);
      setError(err.message);
      throw err;
    }
  };

  const setPaymentCard = async (id) => {
    try {
      await terminalClient.setCartCard(id);
      setServerCart(c => ({ ...c, cardID: id }));
      return true;
    } catch (err) {
      console.error(`Error setting payment card ${id}:`, err);
      setError(err.message);
      throw err;
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await terminalClient.listOrders();
      const orderData = res.data || res;
      setOrders(orderData);
      return orderData;
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      throw err;
    }
  };

  const getOrder = async (id) => {
    try {
      const res = await terminalClient.getOrder(id);
      return res.data || res;
    } catch (err) {
      console.error(`Error fetching order ${id}:`, err);
      setError(err.message);
      throw err;
    }
  };

  const refreshOrders = fetchOrders;

  const fetchSubscriptions = async () => {
    try {
      const res = await terminalClient.listSubscriptions();
      const subData = res.data || res;
      setSubscriptions(subData);
      return subData;
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err.message);
      throw err;
    }
  };

  const addSubscription = async (variantId, quantity = 1) => {
    try {
      const res = await terminalClient.createSubscription(variantId, quantity);
      const newSub = res.data || res;
      setSubscriptions(prev => [...prev, newSub]);
      return newSub;
    } catch (err) {
      console.error('Error adding subscription:', err);
      setError(err.message);
      throw err;
    }
  };

  const cancelSubscription = async (id) => {
    try {
      await terminalClient.cancelSubscription(id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      console.error(`Error cancelling subscription ${id}:`, err);
      setError(err.message);
      throw err;
    }
  };

  const fetchTokens = async () => {
    try {
      const res = await terminalClient.listTokens();
      const tokenList = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setTokens(tokenList);
      return tokenList;
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError(err.message);
      throw err;
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        serverCart,
        localCart,
        addresses,
        cards,
        orders,
        subscriptions,
        tokens,
        loading,
        error,
        fetchProducts,
        getProduct,
        updateLocalCartItem,
        clearLocalCart,
        syncCartToServer,
        finalizeCart,
        getProfile,
        updateProfile,
        fetchAddresses,
        getAddress,
        addAddress,
        updateAddress,
        removeAddress,
        setShippingAddress,
        fetchCards,
        addCard,
        removeCard,
        setPaymentCard,
        fetchOrders,
        getOrder,
        refreshOrders,
        fetchSubscriptions,
        addSubscription,
        cancelSubscription,
        fetchTokens
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}