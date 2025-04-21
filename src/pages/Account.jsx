import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';

function Account() {
  const {
    tokens,
    orders,
    refreshOrders,
    subscriptions,
    cancelSubscription
  } = useShop();

  const [selected, setSelected] = useState('tokens');

  const handleSectionClick = (sec) => setSelected(sec);
  const handleRefreshOrders = () => refreshOrders();

  return (
    <div className="flex h-full">
      <aside className="w-40 border-r p-4 space-y-4">
        <button onClick={() => handleSectionClick('tokens')} className="block w-full text-left px-2 bg-[#ff5e001d] hover:cursor-pointer hover:scale-105 transition duration-150">Access Tokens</button>
        <button onClick={() => handleSectionClick('orders')} className="block w-full text-left px-2 bg-[#ff5e001d] hover:cursor-pointer hover:scale-105 transition duration-150">Order History</button>
        <button onClick={() => handleSectionClick('subscriptions')} className="block w-full text-left px-2 bg-[#ff5e001d] hover:cursor-pointer hover:scale-105 transition duration-150">Subscriptions</button>
      </aside>
      
      <main className="flex-1 p-4">
        {selected === 'tokens' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Personal Access Token</h2>
            <div className="p-4 border border-[#FF5C00] bg-[#ff5e001d] mb-4">
              <p className="mb-2">Using environment token for API authentication.</p>
              <p className="text-sm">This application is configured to use the token from the .env file for all API requests.</p>
            </div>
          </section>
        )}
        
        {selected === 'orders' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Order History</h2>
              <button 
                onClick={handleRefreshOrders} 
                className="px-3 py-1 bg-gray-600 text-white hover:shadow-lg hover:cursor-pointer transition"
              >
                Refresh
              </button>
            </div>
            
            {orders.length === 0 ? (
              <div className="text-center py-4 border border-[#FF5C00] bg-[#ff5e001d]">No orders found</div>
            ) : (
              <ul className="space-y-2">
                {orders.map(o => (
                  <li key={o.id} className="flex justify-between items-center p-4 border border-[#FF5C00]">
                    <div>
                      <div className="font-bold">Order #{o.id}</div>
                      <div className="text-sm">Status: {o.status}</div>
                    </div>
                    <div className="text-xl">${((o.total || 0) / 100).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        
        {selected === 'subscriptions' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Active Subscriptions</h2>
            </div>
            
            {subscriptions.length === 0 ? (
              <div className="text-center py-4 border border-[#FF5C00] bg-[#ff5e001d]">No subscriptions found</div>
            ) : (
              <ul className="space-y-2">
                {subscriptions.map(s => (
                  <li key={s.id} className="flex justify-between items-center p-4 border border-[#FF5C00]">
                    <div>
                      <div className="font-bold">Subscription #{s.id}</div>
                      <div className="text-sm">Quantity: {s.quantity}</div>
                    </div>
                    <button 
                      onClick={() => cancelSubscription(s.id)} 
                      className="px-3 py-1 bg-[#ed4245] text-white hover:shadow-[0_0_8px_#ed4245] hover:cursor-pointer transition"
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Account;
