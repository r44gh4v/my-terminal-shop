import React from 'react';

function ProductCard({ product, quantity = 0, onPlus, onMinus, subscriptionRequired = false, subscriptionActive = false, onSubscribe, onUnsubscribe, subscriptionError }) {
  const tags = product.tags;

  // dynamic border color with fallback for pure black
  let dynamicColor = tags.color || '#FF5C00';
  if (dynamicColor == '#000000') {
    dynamicColor = '#999999';
  }

  const variantId = product.variants?.[0]?.id;

  const handlePlus = () => onPlus && onPlus(quantity + 1);
  const handleMinus = () => onMinus && onMinus(Math.max(0, quantity - 1));
  const handleSubscribe = () => onSubscribe && onSubscribe();

  const price = product.variants?.[0]?.price || 0;
  const variantName = product.variants?.[0]?.name || '';

  return (
    <div
      className={`p-2 md:p-3 px-3 md:px-4 hover:bg-[${dynamicColor}] transition-colors`}
      style={{ border: `2px solid ${dynamicColor}`, boxShadow: `0 0 5px ${dynamicColor}` }}
    >

      <div className='flex flex-col sm:flex-row justify-between items-baseline gap-2'>
        {/* PRODUCT NAME */}
        <h1
          className="text-2xl md:text-4xl"
          style={{ color: dynamicColor, textShadow: `0 0 3px ${dynamicColor}` }}>
          {product.name}
        </h1>

        {/* PRICE */}
        <div
          className="text-xl md:text-2xl"
          style={{ color: dynamicColor }}>
          ${(price / 100).toFixed(2)}
        </div>
      </div>

      {/* VARIANT */}
      <p
        className="text-base md:text-lg">
        {variantName}
      </p>

      {/* ADD REMOVE or SUBSCRIBE */}
      {subscriptionRequired
        ? (
          <>
            <button
              className={`text-xl flex ml-auto mr-auto px-2 my-2 md:my-3 py-1 text-white hover:scale-103 hover:cursor-pointer transition duration-200 ${subscriptionActive ? 'bg-[#ed4245] hover:shadow-[0_0_10px_#ed4245] hover:cursor-pointer' : 'bg-[#57f287] hover:shadow-[0_0_10px_#57f287] hover:cursor-pointer'}`}
              onClick={subscriptionActive ? onUnsubscribe : onSubscribe}
            >
              {subscriptionActive ? 'Unsubscribe' : 'Subscribe'}
            </button>
            {subscriptionError && <div className="text-red-500 text-sm mt-1">{subscriptionError}</div>}
          </>
        )
        : (
          <div className="text-2xl md:text-3xl my-2 md:my-3 flex justify-center items-center gap-2 md:gap-3">
            <button
              className="transition duration-200 hover:text-shadow-[0_0_8px_#FFffff] hover:scale-110 hover:font-bold hover:cursor-pointer"
              onClick={handleMinus}>
              -
            </button>

            <div className="px-1" style={{ color: dynamicColor, textShadow: `0 0 3px ${dynamicColor}` }}>
              {quantity}
            </div>

            <button
              className="transition duration-200 hover:text-shadow-[0_0_8px_#FFffff] hover:scale-110 hover:font-bold hover:cursor-pointer"
              onClick={handlePlus}>
              +
            </button>
          </div>
        )}

      {/* DESCRIPTION */}
      <p className="text-base md:text-lg">{product.description}</p>

    </div>
  );
}

export default ProductCard;
