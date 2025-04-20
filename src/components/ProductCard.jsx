import React from 'react';

function ProductCard({ product, quantity = 0, onPlus, onMinus }) {
  const tags = product.tags;

  // dynamic border color with fallback for pure black
  let dynamicColor = tags.color || '#ffffff';
  if (dynamicColor == '#000000') {
    dynamicColor = '#999999';
  }

  const variantId = product.variants?.[0]?.id;

  const handlePlus = () => onPlus && onPlus(quantity + 1);
  const handleMinus = () => onMinus && onMinus(Math.max(0, quantity - 1));

  const price = product.variants?.[0]?.price || 0;
  const variantName = product.variants?.[0]?.name || '';

  return (
    <div
      className={`p-3 px-4 hover:bg-[${dynamicColor}]`}
      style={{ border: `2px solid ${dynamicColor}`, boxShadow: `0 0 5px ${dynamicColor}` }}
    // , boxShadow: `0 0 5px ${dynamicColor}`
    >

      <div className='flex justify-between items-baseline '>
        {/* PRODUCT NAME */}
        <h1
          className="text-4xl "
          style={{ color: dynamicColor, textShadow: `0 0 3px ${dynamicColor}` }}>
          {product.name}
        </h1>

        {/* PRICE */}
        <div
          className="text-2xl"
          style={{ color: dynamicColor }}>
          ${(price / 100).toFixed(2)}
        </div>
      </div>

      {/* VARIANT */}
      <p
        className="text-lg">
        {variantName}
      </p>

      {/* ADD REMOVE */}
      <div className="text-3xl my-3 flex justify-center items-center gap-3">
        <button
          className="transition duration-200 hover:text-shadow-[0_0_8px_#FFffff] hover:scale-110 hover:font-bold hover:cursor-pointer"
          onClick={handleMinus} >
          -
        </button>

        <div className="px-1" style={{ color: dynamicColor, textShadow: `0 0 3px ${dynamicColor}` }}>
          {quantity}
        </div>

        <button
          className=" transition duration-200 hover:text-shadow-[0_0_8px_#FFffff] hover:scale-110 hover:font-bold hover:cursor-pointer "
          onClick={handlePlus} >
          +
        </button>
      </div>

      {/* DESCRIPTION */}
      <p className="text-lg ">{product.description}</p>

    </div>
  );
}

export default ProductCard;
