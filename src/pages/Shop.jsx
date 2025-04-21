import React, { useEffect, useMemo, useState } from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

function Shop() {
  const { products, loading, error, localCart, updateLocalCartItem, subscriptions, addSubscription, cancelSubscription } = useShop();
  const [subscribeErrors, setSubscribeErrors] = useState({});

  useEffect(() => {
    console.log('products list:', products);
  }, [products]);

  // Filter out products that require subscription
  const filteredProducts = useMemo(() => 
    products.filter(p => p.subscription !== 'required'), 
    [products]
  );

  const featured = useMemo(() => 
    filteredProducts.filter(p => p.tags?.featured), 
    [filteredProducts]
  );
  
  const originals = useMemo(() => 
    filteredProducts.filter(p => !p.tags?.featured), 
    [filteredProducts]
  );

  if (loading) return <div className='text-5xl animate-pulse'>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleSubscribe = async (vid) => {
    try {
      await addSubscription(vid, 1);
      setSubscribeErrors(errs => ({ ...errs, [vid]: null }));
    } catch (e) {
      setSubscribeErrors(errs => ({ ...errs, [vid]: e.message }));
    }
  };

  const handleUnsubscribe = async (subId, vid) => {
    try {
      await cancelSubscription(subId);
      setSubscribeErrors(errs => ({ ...errs, [vid]: null }));
    } catch (e) {
      setSubscribeErrors(errs => ({ ...errs, [vid]: e.message }));
    }
  };

  return (
    <div className="space-y-4">
      {featured.length > 0 && (
        <section>
          <h1 className="bg-[#ff5e0017] p-2 px-3 text-4xl font-bold mb-4 text-[#FF5C00] text-shadow-[0_0_5px_#FF5C00]">
            ~ featured ~
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featured.map(product => {
              const vid = product.variants[0].id;
              const qty = localCart[vid] || 0;
              const sub = subscriptions.find(s => s.variants && s.variants[vid]);
              const isActive = !!sub;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={qty}
                  onPlus={q => updateLocalCartItem(vid, q)}
                  onMinus={q => updateLocalCartItem(vid, q)}
                  subscriptionRequired={false}
                  subscriptionActive={isActive}
                  onSubscribe={() => handleSubscribe(vid)}
                  onUnsubscribe={() => sub && handleUnsubscribe(sub.id, vid)}
                  subscriptionError={subscribeErrors[vid]}
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
              const sub = subscriptions.find(s => s.variants && s.variants[vid]);
              const isActive = !!sub;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={qty}
                  onPlus={q => updateLocalCartItem(vid, q)}
                  onMinus={q => updateLocalCartItem(vid, q)}
                  subscriptionRequired={false}
                  subscriptionActive={isActive}
                  onSubscribe={() => handleSubscribe(vid)}
                  onUnsubscribe={() => sub && handleUnsubscribe(sub.id, vid)}
                  subscriptionError={subscribeErrors[vid]}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default Shop;
