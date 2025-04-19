import React from 'react';

function CartCard({ name, price, quantity, onPlus, onMinus }) {
  const formattedPrice = (price / 100).toFixed(2);
  const totalPrice = ((price * quantity) / 100).toFixed(2);

  return (
    <div className="border p-4 rounded mb-4 flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-lg mb-1 text-FF5C00">{name}</h3>
        <p className="text-sm">Unit: ${formattedPrice}</p>
        <p className="text-sm font-semibold">Total: ${totalPrice}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={onMinus} className="px-2 py-1 bg-gray-200 rounded">-</button>
        <span className="px-2">{quantity}</span>
        <button onClick={onPlus} className="px-2 py-1 bg-gray-200 rounded">+</button>
      </div>
    </div>
  );
}

export default CartCard;