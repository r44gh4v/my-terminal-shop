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
    removeAddress,
    addCard,
    removeCard,
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
  const [newCard, setNewCard] = useState({
    number: '4242424242424242', // Preset card number for development
    expiry: '',                 // Combined MM/YY field
    cvc: '',
    name: ''
  });
  const [addingCard, setAddingCard] = useState(false);
  const [selectedAddressObj, setSelectedAddressObj] = useState(null);
  const [selectedCardObj, setSelectedCardObj] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Add loading state for order processing

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

        const addedAddress = await addAddress(newAddressData);

        if (addedAddress && addedAddress.id) {
          addressIdToUse = addedAddress.id;
          setSelectedAddress(addressIdToUse);
          setNewAddress({ name: '', street1: '', street2: '', city: '', state: '', country: '', phone: '', postalCode: '' });
          setAddingAddress(false);
        } else {
          console.error("Failed to add address.");
          return;
        }
      } catch (error) {
        console.error("Error adding address:", error);
        return;
      }
    }

    try {
      console.log('Selected address ID:', addressIdToUse);
      
      // Store the selected address object for display on review page
      const addressObj = addresses.find(a => a.id === addressIdToUse);
      if (addressObj) {
        setSelectedAddressObj(addressObj);
      }
      
      // WORKAROUND: Skip the problematic API call that's causing 500 errors
      // await setShippingAddress(addressIdToUse);
      
      // Still proceed to the payment step
      setStep(2);
    } catch (error) {
      console.error("Error in address step:", error);
    }
  };
  const handlePrevAddress = () => setStep(0);
  const handleNextPayment = async () => {
    if (selectedCard) {
      try {
        await setPaymentCard(selectedCard);
        const cardObj = cards.find(c => c.id === selectedCard);
        if (cardObj) {
          setSelectedCardObj(cardObj);
        }
        setStep(3);
      } catch (error) {
        console.error("Error setting payment card:", error);
      }
    }
  };
  const handlePrevPayment = () => setStep(1);
  const handleConfirm = async () => {
    try {
      // Show loading indicator while processing order
      setIsPlacingOrder(true);
      
      // WORKAROUND: Skip the problematic API call that's causing 500 errors
      // if (selectedAddress) {
      //   await setShippingAddress(selectedAddress);
      // }
      
      // Finalize the cart and create the order
      const result = await finalizeCart();
      
      // Clear all checkout-related states
      setSelectedAddress('');
      setSelectedAddressObj(null);
      setNewAddress({ name: '', street1: '', street2: '', city: '', state: '', country: '', phone: '', postalCode: '' });
      setAddingAddress(false);
      
      setSelectedCard('');
      setSelectedCardObj(null);
      setNewCard({
        number: '4242424242424242',
        expiry: '',
        cvc: '',
        name: ''
      });
      setAddingCard(false);
      
      // Reset step back to cart
      setStep(0);
      
      // Hide loading indicator
      setIsPlacingOrder(false);
      
      // Show success message
      alert("Order placed successfully!");
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      // Hide loading indicator
      setIsPlacingOrder(false);
      console.error("Error placing order:", error);
      alert("Failed to place order: " + error.message);
    }
  };
  const handlePrevConfirm = () => setStep(2);

  const handleRemoveAddress = async (addressId) => {
    try {
      await removeAddress(addressId);
      if (selectedAddress === addressId) {
        setSelectedAddress('');
      }
    } catch (error) {
      console.error("Error removing address:", error);
    }
  };

  const handleRemoveCard = async (cardId) => {
    try {
      await removeCard(cardId);
      if (selectedCard === cardId) {
        setSelectedCard('');
      }
    } catch (error) {
      console.error("Error removing payment card:", error);
    }
  };

  const handleAddCard = async () => {
    try {
      const [expMonth, expYear] = newCard.expiry.split('/');
      if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
        console.error("Invalid expiry format. Please use MM/YY format");
        return;
      }
      const cardData = {
        number: newCard.number.replace(/\s+/g, ''),
        exp_month: parseInt(expMonth, 10),
        exp_year: parseInt(expYear, 10),
        cvc: newCard.cvc,
        name: newCard.name || 'Card Holder'
      };
      console.log("Creating card with data:", { ...cardData, number: "XXXX" });
      const addedCard = await addCard(cardData);
      if (addedCard && addedCard.id) {
        setSelectedCard(addedCard.id);
        setNewCard({ 
          number: '4242424242424242',
          expiry: '', 
          cvc: '', 
          name: '' 
        });
        setAddingCard(false);
      } else {
        console.error("Failed to add payment card due to missing ID in response");
      }
    } catch (error) {
      console.error("Error adding payment card:", error);
    }
  };

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
                  <li key={a.id} className={`relative border p-3 cursor-pointer ${selectedAddress === a.id ? 'border-[#FF5C00] shadow-[0_0_10px_#FF5C00]' : 'border-[#FF5C00]'}`}>
                    <input
                      type="radio"
                      id={`address-${a.id}`}
                      name="address"
                      value={a.id}
                      checked={selectedAddress === a.id}
                      onChange={e => {
                        setSelectedAddress(e.target.value);
                        setAddingAddress(false);
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`address-${a.id}`} className="cursor-pointer">
                      <div><strong>{a.name || 'No name'}</strong></div>
                      <div>{a.street1}, {a.city}, {a.country}</div>
                      {a.phone && <div>Phone: {a.phone}</div>}
                    </label>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAddress(a.id);
                      }} 
                      className="absolute top-2 right-2 px-2 py-1 bg-[#ed4245] text-white hover:shadow-[0_0_5px_#ed4245] text-xs rounded"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {addingAddress ? (
            <div className="border border-[#FF5C00] p-4 mb-4">
              <h3 className="text-xl mb-4">New Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <input
                  type="text"
                  id="shipping-name"
                  name="name"
                  placeholder="Full Name *"
                  value={newAddress.name}
                  onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  autoComplete="name"
                  aria-label="Full Name"
                  required
                />
                <input
                  type="tel"
                  id="shipping-tel"
                  name="tel"
                  placeholder="Phone Number"
                  value={newAddress.phone}
                  onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  autoComplete="tel"
                  aria-label="Phone Number"
                />

                <input
                  type="text"
                  id="shipping-address-line1"
                  name="address-line1"
                  placeholder="Street Address 1 *"
                  value={newAddress.street1}
                  onChange={e => setNewAddress({ ...newAddress, street1: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white sm:col-span-2"
                  autoComplete="address-line1"
                  aria-label="Street Address Line 1"
                  required
                />

                <input
                  type="text"
                  id="shipping-address-line2"
                  name="address-line2"
                  placeholder="Street Address 2 (optional)"
                  value={newAddress.street2}
                  onChange={e => setNewAddress({ ...newAddress, street2: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white sm:col-span-2"
                  autoComplete="address-line2"
                  aria-label="Street Address Line 2"
                />

                <input
                  type="text"
                  id="shipping-city"
                  name="city"
                  placeholder="City *"
                  value={newAddress.city}
                  onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  autoComplete="address-level2"
                  aria-label="City"
                  required
                />
                <input
                  type="text"
                  id="shipping-state"
                  name="state"
                  placeholder="State/Province *"
                  value={newAddress.state}
                  onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  autoComplete="address-level1"
                  aria-label="State/Province"
                  required
                />

                <input
                  type="text"
                  id="shipping-postal-code"
                  name="postal-code"
                  placeholder="Postal Code *"
                  value={newAddress.postalCode}
                  onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  autoComplete="postal-code"
                  aria-label="Postal Code"
                  required
                />
                <input
                  type="text"
                  id="shipping-country"
                  name="country"
                  placeholder="Country Code (US, IN, etc.) *"
                  value={newAddress.country}
                  onChange={e => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white"
                  autoComplete="country"
                  aria-label="Country"
                  required
                />
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setAddingAddress(false)}
                  className="px-3 py-1 bg-[#ed4245] text-white hover:shadow-[0_0_10px_#ed4245] hover:cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNextAddress}
                  className="px-3 py-1 bg-[#57f287] text-white hover:shadow-[0_0_10px_#57f287] hover:cursor-pointer transition"
                >
                  Save Address
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

          {cards.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl mb-2">Saved Payment Methods</h3>
              <ul className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map(c => (
                  <li key={c.id} className={`relative border p-3 cursor-pointer ${selectedCard === c.id ? 'border-[#FF5C00] shadow-[0_0_10px_#FF5C00]' : 'border-[#FF5C00]'}`}>
                    <input
                      type="radio"
                      id={`card-${c.id}`}
                      name="card"
                      value={c.id}
                      checked={selectedCard === c.id}
                      onChange={e => {
                        setSelectedCard(e.target.value);
                        setAddingCard(false);
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`card-${c.id}`} className="cursor-pointer">
                      <div className="font-semibold">{c.brand || 'Card'} •••• {c.last4 || '****'}</div>
                      {c.name && <div className="text-sm text-gray-300 mt-1">Name: {c.name}</div>}
                      <div className="text-sm text-gray-300">
                        Expires: {c.exp_month ? c.exp_month.toString().padStart(2, '0') : '**'}/
                        {c.exp_year ? c.exp_year.toString().padStart(2, '0') : '**'}
                      </div>
                    </label>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCard(c.id);
                      }} 
                      className="absolute top-2 right-2 px-2 py-1 bg-[#ed4245] text-white hover:shadow-[0_0_5px_#ed4245] text-xs rounded"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {addingCard ? (
            <div className="border border-[#FF5C00] p-4 mb-4">
              <h3 className="text-xl mb-4">Add New Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <input
                  type="text"
                  id="cc-number"
                  name="cc-number"
                  placeholder="Card Number *"
                  value={newCard.number}
                  onChange={e => setNewCard({ ...newCard, number: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white sm:col-span-2"
                  readOnly
                  aria-label="Card Number"
                  autoComplete="cc-number"
                  required
                />

                <input
                  type="text"
                  id="cc-name"
                  name="cc-name"
                  placeholder="Card Holder Name *"
                  value={newCard.name}
                  onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                  className="w-full p-2 border bg-transparent text-white sm:col-span-2"
                  aria-label="Card Holder Name"
                  autoComplete="cc-name"
                  required
                />

                <input
                  type="text"
                  id="cc-exp"
                  name="cc-exp"
                  placeholder="Expiration (MM/YY) *"
                  value={newCard.expiry}
                  onChange={e => {
                    let input = e.target.value.replace(/[^\d/]/g, '');
                    if (newCard.expiry.length > input.length && newCard.expiry.includes('/')) {
                      if (input.length === 2 && !input.includes('/')) {
                        input = input.substring(0, 1);
                      }
                    }
                    if (input.length === 2 && !input.includes('/')) {
                      input = `${input}/`;
                    } else if (input.length > 3 && !input.includes('/')) {
                      input = `${input.substring(0, 2)}/${input.substring(2, 4)}`;
                    }
                    if (input.length <= 5) {
                      setNewCard({ ...newCard, expiry: input });
                    }
                  }}
                  className="w-full p-2 border bg-transparent text-white"
                  aria-label="Card Expiration Date"
                  autoComplete="cc-exp"
                  required
                  maxLength="5"
                />

                <input
                  type="password"
                  id="cc-csc"
                  name="cc-csc"
                  placeholder="CVC *"
                  value={newCard.cvc}
                  onChange={e => setNewCard({ ...newCard, cvc: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                  className="w-full p-2 border bg-transparent text-white"
                  aria-label="Card Security Code"
                  autoComplete="cc-csc"
                  required
                  maxLength="4"
                />
              </div>
              <div className="mt-4">
                <button
                  onClick={handleAddCard}
                  className="px-3 py-1 bg-[#57f287] text-white hover:shadow-[0_0_10px_#57f287] hover:cursor-pointer transition"
                >
                  Save Card
                </button>
                <button
                  onClick={() => setAddingCard(false)}
                  className="px-3 py-1 ml-2 bg-[#ed4245] text-white hover:shadow-[0_0_10px_#ed4245] hover:cursor-pointer transition"
                >
                  Cancel
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Note: Using default test card number 4242424242424242 for development.
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingCard(true)}
              className="px-3 py-1 mb-4 bg-[#FF5C00] text-white hover:shadow-[0_0_10px_#FF5C00] hover:cursor-pointer transition"
            >
              Add New Payment Method
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="relative flex justify-between items-center mb-4">
            <button
              onClick={handlePrevConfirm}
              disabled={isPlacingOrder}
              className="px-3 py-1 bg-gray-600 text-white hover:shadow-lg hover:cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back to Payment
            </button>
            <h2 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-white">Review Order</h2>
            <button
              onClick={handleConfirm}
              disabled={isPlacingOrder}
              className="px-3 py-1 bg-[#57f287] text-white hover:shadow-[0_0_10px_#57f287] hover:cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? 'Processing...' : 'Place Order'}
            </button>
          </div>

          {/* Loading overlay when placing order */}
          {isPlacingOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-lg text-center">
                <div className="text-3xl text-[#FF5C00] mb-4">Processing Order</div>
                <div className="animate-pulse text-white">Please wait while we process your order...</div>
                <div className="mt-6 flex justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FF5C00]"></div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 border border-[#FF5C00]">
              <h3 className="text-xl mb-2 text-white">Shipping Address</h3>
              {selectedAddressObj ? (
                <div>
                  <div className="font-semibold">{selectedAddressObj.name}</div>
                  <div>{selectedAddressObj.street1}</div>
                  {selectedAddressObj.street2 && <div>{selectedAddressObj.street2}</div>}
                  <div>{selectedAddressObj.city}, {selectedAddressObj.state} {selectedAddressObj.zip}</div>
                  <div>{selectedAddressObj.country}</div>
                  {selectedAddressObj.phone && <div>Phone: {selectedAddressObj.phone}</div>}
                </div>
              ) : (
                <div className="text-yellow-500">No shipping address selected</div>
              )}
            </div>

            <div className="p-4 border border-[#FF5C00]">
              <h3 className="text-xl mb-2 text-white">Payment Method</h3>
              {selectedCardObj ? (
                <div>
                  <div className="font-semibold">{selectedCardObj.brand || 'Card'} •••• {selectedCardObj.last4 || '****'}</div>
                  {selectedCardObj.name && <div>Name: {selectedCardObj.name}</div>}
                  <div>Expires: {selectedCardObj.exp_month ? selectedCardObj.exp_month.toString().padStart(2, '0') : '**'}/
                  {selectedCardObj.exp_year ? selectedCardObj.exp_year.toString().padStart(2, '0') : '**'}</div>
                </div>
              ) : (
                <div className="text-yellow-500">No payment method selected</div>
              )}
            </div>
          </div>

          <div className="p-4 border border-[#FF5C00]">
            <h3 className="text-xl mb-2 text-white">Order Summary</h3>
            <div className="mb-4">
              {entries.map(([variantId, quantity], index) => {
                const product = products.find(p => p.variants?.some(v => v.id === variantId));
                const name = product?.name || 'Unknown';
                const price = product?.variants.find(v => v.id === variantId)?.price || 0;
                return (
                  <div key={`order-item-${variantId}`} className="flex justify-between py-1">
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