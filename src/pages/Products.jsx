import React, { useEffect, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

function Products() {
  const { products, loading, error, localCart, updateLocalCartItem } = useShop();
  // Log products list
  useEffect(() => {
    console.log('products list:', products);
  }, [products]);
  // Compute featured/originals
  // exclude subscription-required
  const featured = useMemo(
    () => products.filter(p => p.tags?.featured && p.subscription !== 'required'),
    [products]
  );
  const originals = useMemo(
    () => products.filter(p => !p.tags?.featured && p.subscription !== 'required'),
    [products]
  );
  if (loading) return <div className='text-5xl animate-pulse '>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className=" space-y-4">

      {featured.length > 0 && (
        <section>
          <h1 className="bg-[#ff5e0017] p-2 px-3  text-4xl font-bold mb-4 text-[#FF5C00] text-shadow-[0_0_5px_#FF5C00]">
            ~ featured ~
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featured.map(product => {
              const vid = product.variants[0].id;
              const qty = localCart[vid] || 0;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={qty}
                  onPlus={q => updateLocalCartItem(vid, q)}
                  onMinus={q => updateLocalCartItem(vid, q)}
                />
              );
            })}
          </div>

        </section>
      )}

      {originals.length > 0 && (
        <section>
          <h1 className="bg-[#ff5e0017] p-2 px-3 text-4xl font-bold mb-4 text-[#FF5C00] text-shadow-[0_0_5px_#FF5C00]">
            ~ originals ~
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {originals.map(product => {
              const vid = product.variants[0].id;
              const qty = localCart[vid] || 0;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={qty}
                  onPlus={q => updateLocalCartItem(vid, q)}
                  onMinus={q => updateLocalCartItem(vid, q)}
                />
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}

export default Products;
