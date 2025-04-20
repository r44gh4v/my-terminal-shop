import React from 'react';

function CartCard({ name, price, quantity, onPlus, onMinus }) {
  const formattedPrice = (price / 100).toFixed(2);
  const totalPrice = ((price * quantity) / 100).toFixed(2);

  return (
    <div className="border px-4 py-3 mb-4 grid grid-cols-1 md:grid-cols-3 items-center gap-4">

      <div className="text-4xl">{name}</div>

      <div className="text-3xl flex items-center gap-2 justify-center">
        <button
          className=" transition duration-200 hover:text-shadow-[0_0_8px_#FFffff] hover:scale-110 hover:font-bold hover:cursor-pointer "
          onClick={onMinus}>
          -
        </button>
        <span className="px-2">{quantity}</span>
        <button
          className=" transition duration-200 hover:text-shadow-[0_0_8px_#FFffff] hover:scale-110 hover:font-bold hover:cursor-pointer "
          onClick={onPlus}>
          +
        </button>
      </div>

      <div className="text-2xl text-right">${totalPrice}</div>

    </div>
  );
}

export default CartCard;