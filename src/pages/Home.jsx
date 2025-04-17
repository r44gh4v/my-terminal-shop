import React, { useState, useEffect } from 'react';
import { terminalClient } from '../api/terminalClient';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    terminalClient.listProducts()
      .then(response => {
        console.log('list products response', response);
        setProducts(response.data || response);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (variantId) => {
    try {
      const response = await terminalClient.addToCart(variantId, 1);
      console.log('add to cart response', response);
      alert('Added to cart');
    } catch (err) {
      alert('Error adding to cart: ' + err.message);
    }
  };

  // Example getProduct usage (logged)
  // terminalClient.getProduct(products[0]?.id).then(res => console.log('getProduct response', res));

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products.map(product => (
        <div key={product.id} className="border p-4 rounded">
          <h2 className="font-bold text-lg">{product.name}</h2>
          {product.description && <p className="text-sm my-2">{product.description}</p>}
          <button
            onClick={() => addToCart(product.defaultVariantId || product.id)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >Add to Cart</button>
        </div>
      ))}
    </div>
  );
}

export default Home;