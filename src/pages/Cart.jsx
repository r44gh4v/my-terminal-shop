import React, { useState, useMemo } from 'react';
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
  const [newAddress, setNewAddress] = useState({
    name: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    postalCode: ''
  });
  const [addingAddress, setAddingAddress] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');

  // Calculate total cart price
  const cartTotal = useMemo(() => {
    let total = 0;
    Object.entries(localCart).forEach(([variantId, quantity]) => {
      if (quantity > 0) {
        const product = products.find(p => p.variants?.some(v => v.id === variantId));
        const price = product?.variants.find(v => v.id === variantId)?.price || 0;
        total += price * quantity;
      }
    });
    return total;
  }, [localCart, products]);

  if (loading) return <div className='text-5xl animate-pulse'>Loading...</div>;
  if (error) return <div className='text-red-500'>Error: {error}</div>;

  const handleClear = () => clearLocalCart();
  const handleStartCheckout = () => setStep(1);
  const handleNextAddress = async () => {
    let addressIdToUse = selectedAddress;

    if (addingAddress) {
      try {
        const newAddressData = {
          name: newAddress.name,
          street1: newAddress.street1,
          street2: newAddress.street2,
          city: newAddress.city,
          state: newAddress.state,
          country: newAddress.country,
          phone: newAddress.phone,
          postalCode: newAddress.postalCode
        };

        // addAddress now returns the actual address object on success
        const addedAddress = await addAddress(newAddressData);

        // Check if we got a valid address object back
        if (addedAddress && addedAddress.id) {
          addressIdToUse = addedAddress.id;
          setSelectedAddress(addressIdToUse); // Select the new address
          setNewAddress({ name: '', street1: '', street2: '', city: '', state: '', country: '', phone: '', postalCode: '' });
          setAddingAddress(false); // Close the form
        } else {
          // This case should ideally not happen if addAddress throws an error on failure
          console.error("Failed to add address.");
          return; // Stop processing
        }
      } catch (error) {
        console.error("Error adding address:", error);
        // Optionally: Show an error message to the user
        return; // Stop processing on error
      }
    }

    if (addressIdToUse) {
      try {
        await setShippingAddress(addressIdToUse);
        setStep(2);
      } catch (error) {
        console.error("Error setting shipping address:", error);
      }
    } else {
      console.warn("Please select or add a shipping address.");
    }
  };
  const handlePrevAddress = () => setStep(0);
  const handleNextPayment = async () => {
    if (selectedCard) {
      await setPaymentCard(selectedCard);
      setStep(3);
    }
  };
  const handlePrevPayment = () => setStep(1);
  const handleConfirm = () => finalizeCart();
  const handlePrevConfirm = () => setStep(2);

  const entries = Object.entries(localCart).filter(([_, qty]) => qty > 0);

  if (entries.length === 0 && step === 0) {
    return <div className='text-5xl animate-pulse'>Cart Empty :{"["}</div>
  }

  return (
    <div className="">

      {step === 0 && (
        <>
          <div className="relative flex justify-between items-center mb-6">
            <button
              onClick={handleClear}
              className="px-3 py-1 text-lg bg-[#ed4245] text-white transition duration-200 hover:cursor-pointer hover:scale-105 shadow-[0_0_10px_#ed4245]"
            >
              Clear Cart
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-white">
              Total: ${(cartTotal / 100).toFixed(2)}
            </div>

            <button
              onClick={handleStartCheckout}
              className="px-3 py-1 text-lg bg-[#57f287] text-white transition duration-200 hover:cursor-pointer hover:scale-105 shadow-[0_0_10px_#57f287]"
            >
              Checkout
            </button>
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
          <div className="relative flex justify-between items-center mb-4">
            <button
              onClick={handlePrevAddress}
              className="px-2 py-1 bg-gray-600 text-white hover:shadow-lg hover:cursor-pointer transition"
            >
              Back (Cart)
            </button>
            <h2 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-white">Shipping Address</h2>
            <button
              onClick={handleNextAddress}
              disabled={!selectedAddress}
              className="px-2 py-1 bg-[#57f287] text-white hover:shadow-[0_0_10px_#57f287] hover:cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue (Payment)
            </button>
          </div>

          {addresses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl mb-2">Saved Addresses</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(a => (
                  <li key={a.id} className={`border p-3 cursor-pointer ${selectedAddress === a.id ? 'border-[#FF5C00] shadow-[0_0_10px_#FF5C00]' : 'border-[#FF5C00]'}`}>
                    <input
                      type="radio"
                      id={`address-${a.id}`}
                      name="address"
                      value={a.id}
                      checked={selectedAddress === a.id}
                      onChange={e => {
                        setSelectedAddress(e.target.value);
                        setAddingAddress(false); // Hide add form if selecting existing
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`address-${a.id}`} className="cursor-pointer">
                      <div><strong>{a.name || 'No name'}</strong></div>
                      <div>{a.street1}, {a.city}, {a.country}</div>
                      {a.phone && <div>Phone: {a.phone}</div>}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {addingAddress ? (
            <div className="border border-[#FF5C00] p-4 mb-4">
              <h3 className="text-xl mb-4">New Address</h3>
              {/* Grid layout with sm breakpoint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {/* Row 1: Full Name | Phone Number */}
                <input
                  type="text"
                  id="address-name"
                  name="fullName"
                  placeholder="Full Name *"
                  value={newAddress.name}
                  onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  required
                />
                <input
                  type="tel"
                  id="address-phone"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={newAddress.phone}
                  onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                />

                {/* Row 2: Street Address 1 (Full Width) */}
                <input
                  type="text"
                  id="address-street1"
                  name="street1"
                  placeholder="Street Address 1 *"
                  value={newAddress.street1}
                  onChange={e => setNewAddress({ ...newAddress, street1: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white sm:col-span-2"
                  required
                />

                {/* Row 3: Street Address 2 (Full Width) */}
                <input
                  type="text"
                  id="address-street2"
                  name="street2"
                  placeholder="Street Address 2 (optional)"
                  value={newAddress.street2}
                  onChange={e => setNewAddress({ ...newAddress, street2: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white sm:col-span-2"
                />

                {/* Row 4: City | State/Province */}
                <input
                  type="text"
                  id="address-city"
                  name="city"
                  placeholder="City *"
                  value={newAddress.city}
                  onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  required
                />
                <input
                  type="text"
                  id="address-state"
                  name="state"
                  placeholder="State/Province *"
                  value={newAddress.state}
                  onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  required
                />

                {/* Row 5: Postal Code | Country */}
                <input
                  type="text"
                  id="address-postalCode"
                  name="postalCode"
                  placeholder="Postal Code *"
                  value={newAddress.postalCode}
                  onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  required
                />
                <input
                  type="text"
                  id="address-country"
                  name="country"
                  placeholder="Country Code (US, IN, etc.) *"
                  value={newAddress.country}
                  onChange={e => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  required
                />
              </div>
              {/* ... Save/Cancel buttons ... */}
              <div className="mt-4">
                <button
                  onClick={handleNextAddress}
                  className="px-3 py-1 bg-[#57f287] text-white hover:shadow-[0_0_10px_#57f287] hover:cursor-pointer transition"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setAddingAddress(false)}
                  className="px-3 py-1 ml-2 bg-[#ed4245] text-white hover:shadow-[0_0_10px_#ed4245] hover:cursor-pointer transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingAddress(true)}
              className="px-3 py-1 mb-4 bg-[#FF5C00] text-white hover:shadow-[0_0_10px_#FF5C00] hover:cursor-pointer transition"
            >
              Add New Address
            </button>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="relative flex justify-between items-center mb-4">
            <button
              onClick={handlePrevPayment}
              className="px-3 py-1 bg-gray-600 text-white hover:shadow-lg hover:cursor-pointer transition"
            >
              Back to Address
            </button>
            <h2 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-white">Payment Method</h2>
            <button
              onClick={handleNextPayment}
              disabled={!selectedCard}
              className="px-3 py-1 bg-[#57f287] text-white hover:shadow-[0_0_10px_#57f287] hover:cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Review
            </button>
          </div>

          {cards.length > 0 ? (
            <ul className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map(c => (
                <li key={c.id} className="border border-[#FF5C00] p-3 cursor-pointer">
                  <input
                    type="radio"
                    id={`card-${c.id}`}
                    name="card"
                    value={c.id}
                    checked={selectedCard === c.id}
                    onChange={e => setSelectedCard(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor={`card-${c.id}`} className="cursor-pointer">
                    <span>{c.brand || 'Card'} ending in {c.last4}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 border border-[#FF5C00] mb-4">
              No saved payment methods
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="relative flex justify-between items-center mb-4">
            <button
              onClick={handlePrevConfirm}
              className="px-3 py-1 bg-gray-600 text-white hover:shadow-lg hover:cursor-pointer transition"
            >
              Back to Payment
            </button>
            <h2 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-white">Review Order</h2>
            <button
              onClick={handleConfirm}
              className="px-3 py-1 bg-[#57f287] text-white hover:shadow-[0_0_10px_#57f287] hover:cursor-pointer transition"
            >
              Place Order
            </button>
          </div>

          <div className="mb-4 p-4 border border-[#FF5C00]">
            <div className="mb-4">
              <h3 className="text-xl mb-2">Cart Summary</h3>
              {entries.map(([variantId, quantity]) => {
                const product = products.find(p => p.variants?.some(v => v.id === variantId));
                const name = product?.name || 'Unknown';
                const price = product?.variants.find(v => v.id === variantId)?.price || 0;
                return (
                  <div key={variantId} className="flex justify-between py-1">
                    <span>{quantity} x {name}</span>
                    <span>${((price * quantity) / 100).toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total:</span>
                <span>${(cartTotal / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;