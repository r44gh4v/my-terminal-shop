import React, { useState, useEffect } from 'react';
import { terminalClient } from '../api/terminalClient';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await terminalClient.cart.get();
      console.log('get cart response', response);
      setCart(response.data || response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleClear = async () => {
    try {
      const response = await terminalClient.cart.clear();
      console.log('clear cart response', response);
      fetchCart();
    } catch (err) {
      alert('Error clearing cart: ' + err.message);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await terminalClient.cart.convert();
      console.log('convert cart response', response);
      alert('Order placed successfully');
      fetchCart();
    } catch (err) {
      alert('Error placing order: ' + err.message);
    }
  };

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error}</div>;

  const items = cart.items || [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {items.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id || item.productVariantID} className="border p-2 rounded">
              <div>Variant ID: {item.productVariantID || item.variant_id || item.id}</div>
              <div>Quantity: {item.quantity}</div>
            </div>
          ))}
          <div className="mt-4 flex space-x-2">
            <button onClick={handleClear} className="px-4 py-2 bg-red-600 text-white rounded">Clear Cart</button>
            <button onClick={handleCheckout} className="px-4 py-2 bg-green-600 text-white rounded">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;