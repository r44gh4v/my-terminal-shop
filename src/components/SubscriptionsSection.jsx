import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';

export default function SubscriptionsSection() {
  const { getSubscriptions, cancelSubscription } = useShop();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localSubscriptions, setLocalSubscriptions] = useState([]);

  // Fetch subscriptions on component mount
  useEffect(() => {
    refreshSubscriptions();
  }, []);

  const refreshSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the getSubscriptions function from our context
      const data = await getSubscriptions();
      setLocalSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to refresh subscriptions:", err);
      setError(err.message || "Failed to refresh subscriptions");
      setLocalSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      await cancelSubscription(id);
      // Optimistically update UI
      setLocalSubscriptions(prev => 
        Array.isArray(prev) ? prev.filter(s => s.id !== id) : []
      );
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      setError(err.message || "Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };
  
  // Ensure we have an array, even if empty
  const subscriptionsList = Array.isArray(localSubscriptions) ? localSubscriptions : [];

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl sm:text-4xl font-bold">
          {subscriptionsList.length > 0 ? 'Active Subscriptions' : 'No Subscriptions'}
        </h2>
        <button 
          onClick={refreshSubscriptions}
          disabled={loading} 
          className="px-3 py-1 bg-gray-600 text-white hover:scale-105 hover:shadow-[0_0_8px_#4b5563] hover:cursor-pointer transition duration-150 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="text-[#ed4245] mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-4">Loading subscriptions...</div>
      ) : (
        <ul className="space-y-2">
          {subscriptionsList.map(s => (
            <li key={s.id} className="flex justify-between items-center p-2 border">
              <div>
                <div>Subscription {s.id}</div>
                <div className="text-sm text-gray-500">Quantity: {s.quantity}</div>
                {s.productVariantID && (
                  <div className="text-xs text-gray-500">Product: {s.productVariantID}</div>
                )}
              </div>
              <button 
                onClick={() => handleCancelSubscription(s.id)} 
                disabled={loading}
                className="px-2 py-1 bg-[#ed4245] text-white hover:scale-105 hover:shadow-[0_0_8px_#ed4245] hover:cursor-pointer transition duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}