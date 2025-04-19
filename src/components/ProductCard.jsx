import React from 'react';

function ProductCard({ product, quantity = 0, onPlus, onMinus }) {
  const tags = product.tags;

  // dynamic border color
  const dynamicColor = tags.color || '#000000';

  const variantId =
    product.defaultVariantId ||
    product.defaultVariantID ||
    product.variants?.[0]?.id;

  const handlePlus = () => onPlus && onPlus(quantity + 1);
  const handleMinus = () => onMinus && onMinus(Math.max(0, quantity - 1));

  const price = product.variants?.[0]?.price || 0;
  const variantName = product.variants?.[0]?.name || '';

  return (
    <div
      className="p-3"
      style={{ border: `2px solid ${dynamicColor}`, boxShadow: `0 0 8px ${dynamicColor}` }}
    >

      {/* product name */}
      <h1
        className="font-semibold mb-1"
        style={{ color: dynamicColor }}>
        {product.name}
      </h1>

      <p
        className="text-sm mb-4">
        {variantName}
      </p>

      <p
        className="text-sm mb-4"
        style={{ color: dynamicColor }}>
        ${(price / 100).toFixed(2)}
      </p>

      <div className="flex items-center mb-4 gap-3">
        <button onClick={handleMinus} className="px-2 py-1  ">-</button>
        <div className=" text-center">{quantity}</div>
        <button onClick={handlePlus} className="px-2 py-1  ">+</button>
      </div>

      <p className="text-sm mb-1">{product.description}</p>

    </div>
  );
}

export default ProductCard;
