import React from 'react';

export default function TokensSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">API Authentication</h2>
      
      <div className="bg-gray-100 p-4 rounded text-sm text-gray-700 border border-gray-200">
        <p className="font-semibold mb-2">Using Environment Token</p>
        <p>This application is using the token provided in the .env file for API authentication.</p>
        <p className="mt-2">All API requests are now authenticated using this token automatically.</p>
      </div>
    </div>
  );
}
