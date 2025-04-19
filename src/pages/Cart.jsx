import React from 'react';
import { useShop } from '../context/ShopContext';
import CartCard from '../components/CartCard';

function Cart() {
  const { products, localCart, updateLocalCartItem, clearLocalCart, finalizeCart } = useShop();
  // Clear and checkout actions
  const handleClear = () => clearLocalCart();
  const handleCheckout = () => finalizeCart();

  const entries = Object.entries(localCart).filter(([_, qty]) => qty > 0);
  if (entries.length === 0) {
    return (
      <div className="p-4">
        <button onClick={handleClear} className="mb-4 px-4 py-2 bg-red-600 text-white rounded">Clear Cart</button>
        <button onClick={handleCheckout} className="mb-4 ml-2 px-4 py-2 bg-green-600 text-white rounded">Checkout</button>
        <div>Your cart is empty.</div>
      </div>
    );
  }
  return (
    <div className="p-4">
      <div className="mb-4 flex space-x-2">
        <button onClick={handleClear} className="px-4 py-2 bg-red-600 text-white rounded">Clear Cart</button>
        <button onClick={handleCheckout} className="px-4 py-2 bg-green-600 text-white rounded">Checkout</button>
      </div>
      {entries.map(([variantId, quantity]) => {
        const product = products.find(p => p.variants?.some(v => v.id === variantId));
        const name = product?.name || 'Unknown';
        const price = product?.variants.find(v => v.id === variantId)?.price || 0;
        return (
          <CartCard
            key={variantId}
            name={name}
            price={price}
            quantity={quantity}
            onPlus={() => updateLocalCartItem(variantId, quantity + 1)}
            onMinus={() => updateLocalCartItem(variantId, Math.max(0, quantity - 1))}
          />
        );
      })}
    </div>
  );
}

export default Cart;