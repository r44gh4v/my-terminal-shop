import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';

export default function OrdersSection() {
  const { getOrders } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const orderData = await getOrders();
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    refreshOrders();
  }, []);

  if (loading) return <div className="animate-pulse">Loading orders...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl sm:text-4xl font-bold">
          {ordersList.length > 0 ? 'Order History' : 'No Orders'}
        </h2>
        <button onClick={refreshOrders} className="px-3 py-1 bg-gray-600 text-white hover:scale-105 hover:shadow-[0_0_8px_#4b5563] hover:cursor-pointer transition duration-150">
          Refresh
        </button>
      </div>

      <ul className="space-y-2">
        {ordersList.map(o => (
          <li key={o.id} className="flex justify-between items-center p-2 border">
            <div>Order {o.id}: ${((o.total || 0) / 100).toFixed(2)} - {o.status}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}