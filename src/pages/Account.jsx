import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';

const USER_TOKEN_KEY = 'terminalShopUserToken';

function Account() {
  const {
    tokens,
    addToken,
    removeToken,
    orders,
    refreshOrders,
    subscriptions,
    cancelSubscription
  } = useShop();

  const [selected, setSelected] = useState('tokens');
  const [importToken, setImportToken] = useState('');
  const [lastSecret, setLastSecret] = useState(null);

  useEffect(() => {
    // no profile section
  }, []);

  const handleCreateToken = async () => {
    // auto-generate token name
    const name = `auto-${Date.now()}`;
    const res = await addToken(name);
    const secret = res.data?.token || res.token || res.data?.value;
    setLastSecret(secret);
  };
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
            {/* Import existing PAT */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                className="flex-1 p-2 border"
                placeholder="Paste existing PAT"
                value={importToken}
                onChange={e => setImportToken(e.target.value)}
              />
              <button
                onClick={() => {
                  if (importToken) {
                    localStorage.setItem(USER_TOKEN_KEY, importToken);
                    window.location.reload();
                  }
                }}
                className="px-3 py-1 bg-blue-600 text-white hover:shadow-lg hover:cursor-pointer"
              >Import</button>
            </div>
            <h2 className="text-2xl font-bold mb-4">Personal Access Tokens</h2>
            <div className="flex flex-col gap-2 mb-4">
              <button
                onClick={handleCreateToken}
                className="px-3 py-1 bg-green-600 text-white hover:shadow-lg hover:cursor-pointer"
              >Create New Token</button>
              {lastSecret && (
                <div className="p-2 bg-gray-800 text-white">
                  <strong>Token Secret:</strong> {lastSecret}
                  <p className="text-sm text-gray-400">Save this now; it won’t be shown again.</p>
                </div>
              )}
            </div>
            <ul className="space-y-2">
              {tokens.map(t => (
                <div key={t.id} className="flex justify-between items-start p-2 border">
                  <div className="space-y-1">
                    <div><strong>{t.name}</strong></div>
                    <div className="text-sm text-gray-400">ID: {t.id}</div>
                    {t.createdAt && (
                      <div className="text-sm text-gray-400">Created: {new Date(t.createdAt).toLocaleString()}</div>
                    )}
                  </div>
                  <button
                    onClick={() => removeToken(t.id)}
                    className="px-2 py-1 bg-red-600 text-white hover:shadow-lg hover:cursor-pointer"
                  >Delete</button>
                </div>
              ))}
            </ul>
          </section>
        )}
        {/* Addresses management moved to checkout flow */}
        {selected === 'orders' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Order History</h2>
            <button onClick={handleRefreshOrders} className="mb-2 px-3 py-1 bg-gray-600 text-white rounded">Refresh</button>
            <ul className="list-disc pl-6">
              {orders.map(o => (
                <li key={o.id} className="py-1">
                  Order {o.id}: {o.status} - ${((o.total || 0) / 100).toFixed(2)}
                </li>
              ))}
            </ul>
          </section>
        )}
        {selected === 'subscriptions' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Active Subscriptions</h2>
            <ul className="space-y-2">
              {subscriptions.map(s => (
                <div key={s.id} className="flex justify-between items-center p-2 border">
                  <div>Subscription {s.id}: Qty {s.quantity}</div>
                  <button onClick={() => cancelSubscription(s.id)} className="px-2 py-1 bg-red-600 text-white">Cancel</button>
                </div>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default Account;
