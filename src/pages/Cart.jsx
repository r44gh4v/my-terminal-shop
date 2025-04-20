import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import CartCard from '../components/CartCard';

function Cart() {
  const {
    products,
    localCart,
    updateLocalCartItem,
    clearLocalCart,
    finalizeCart,
    loading,
    error,
    addresses,
    cards,
    addAddress,
    setShippingAddress,
    setPaymentCard
  } = useShop();

  const [step, setStep] = useState(0); // 0=cart,1=address,2=payment,3=confirm
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState({ street1: '', street2: '', city: '', state: '', country: '', phone: '', postalCode: '' });
  const [addingAddress, setAddingAddress] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');

  if (loading) return <div className='text-5xl animate-pulse'>Loading...</div>;
  if (error) return <div className='text-red-500'>Error: {error}</div>;

  const handleClear = () => clearLocalCart();
  const handleStartCheckout = () => setStep(1);
  const handleNextAddress = async () => {
    if (addingAddress) {
      // submit new address
      const addr = await addAddress({
        street1: newAddress.street1,
        street2: newAddress.street2,
        city: newAddress.city,
        state: newAddress.state,
        country: newAddress.country,
        phone: newAddress.phone,
        postalCode: newAddress.postalCode
      });
      setSelectedAddress(addr.data.id || addr.id);
      setAddingAddress(false);
    }
    if (selectedAddress) {
      await setShippingAddress(selectedAddress);
      setStep(2);
    }
  };
  const handleNextPayment = async () => {
    if (selectedCard) {
      await setPaymentCard(selectedCard);
      setStep(3);
    }
  };
  const handleConfirm = () => finalizeCart();

  const entries = Object.entries(localCart).filter(([_, qty]) => qty > 0);

  if (entries.length === 0 && step === 0) {
    return <div className='text-5xl animate-pulse'>Cart Empty :{"["}</div>
  }

  return (
    <div className="">
      {step === 0 && (
        <>
          <div className="mb-4 flex justify-between">
            <button onClick={handleClear} className="px-3 py-1 text-lg bg-[#ed4245] text-white transition duration-200 hover:cursor-pointer hover:scale-105 shadow-[0_0_10px_#ed4245]">Clear Cart</button>
            <button onClick={handleStartCheckout} className="px-3 py-1 text-lg bg-[#57f287] text-white transition duration-200 hover:cursor-pointer hover:scale-105 shadow-[0_0_10px_#57f287]">Checkout</button>
          </div>
          {entries.map(([variantId, quantity]) => {
            const product = products.find(p => p.variants?.some(v => v.id === variantId));
            const name = product?.name || 'Unknown';
            const price = product?.variants.find(v => v.id === variantId)?.price || 0;
            return <CartCard key={variantId} name={name} price={price} quantity={quantity}
                   onPlus={() => updateLocalCartItem(variantId, quantity + 1)}
                   onMinus={() => updateLocalCartItem(variantId, Math.max(0, quantity - 1))} />;
          })}
        </>
      )}
      {step === 1 && (
        <div>
          <h2 className="text-2xl mb-4">Select or Add Shipping Address</h2>
          <ul className="mb-4 space-y-2">
            {addresses.map(a => (
              <li key={a.id} className="flex items-center gap-2">
                <input type="radio" value={a.id} checked={selectedAddress===a.id}
                       onChange={e=>setSelectedAddress(e.target.value)} className="cursor-pointer" />
                <span>{a.street1}, {a.city}, {a.country}</span>
              </li>
            ))}
          </ul>
          {addingAddress ? (
            <div className="space-y-2 max-w-md">
              {['street1','street2','city','state','country','phone','postalCode'].map(field => (
                <input key={field} placeholder={field} value={newAddress[field]}
                       onChange={e => setNewAddress({...newAddress,[field]: e.target.value})}
                       className="w-full p-2 border" />
              ))}
              <button onClick={handleNextAddress} className="px-3 py-1 bg-blue-600 text-white hover:cursor-pointer hover:shadow-lg transition">Save Address</button>
            </div>
          ) : (
            <button onClick={()=>setAddingAddress(true)} className="px-3 py-1 bg-blue-600 text-white hover:cursor-pointer hover:shadow-lg transition">Add New Address</button>
          )}
          <div className="mt-4">
            <button onClick={handleNextAddress} disabled={!selectedAddress} className="px-3 py-1 bg-gray-800 text-white hover:cursor-pointer hover:shadow-lg transition">Next</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 className="text-2xl mb-4">Select Payment Method</h2>
          <ul className="mb-4 space-y-2">
            {cards.map(c => (
              <li key={c.id} className="flex items-center gap-2">
                <input type="radio" value={c.id} checked={selectedCard===c.id}
                  onChange={e=>setSelectedCard(e.target.value)} className="cursor-pointer" />
                <span>{c.brand || c.last4}</span>
              </li>
            ))}
          </ul>
          <button onClick={handleNextPayment} disabled={!selectedCard} className="px-3 py-1 bg-gray-800 text-white hover:cursor-pointer hover:shadow-lg transition">Next</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2 className="text-2xl mb-4">Confirm Order</h2>
          <button onClick={handleConfirm} className="px-3 py-1 bg-green-600 text-white hover:cursor-pointer hover:shadow-lg transition">Confirm Purchase</button>
        </div>
      )}
    </div>

  );
}

export default Cart;