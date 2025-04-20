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
    return <div className='text-5xl animate-pulse'>Cart Empty :{"["}</div>
  }

  return (
    <div className="">

      <div className="mb-4 flex justify-between">
        <button
          className="px-3 py-1 text-lg bg-[#ed4245] text-white transition duration-200 hover:cursor-pointer hover:scale-105 shadow-[0_0_10px_#ed4245]"
          onClick={handleClear}>
          Clear Cart
        </button>
        <button
          className="px-3 py-1 text-lg bg-[#57f287] text-white transition duration-200 hover:cursor-pointer hover:scale-105 shadow-[0_0_10px_#57f287]"
          onClick={handleCheckout} >
          Checkout
        </button>
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