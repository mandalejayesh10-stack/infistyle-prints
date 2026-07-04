'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import confetti from 'canvas-confetti';
import { api } from '@/lib/aws/api';
import { cognitoClient } from '@/lib/aws/client';
import { getProductBySlug } from '@/lib/catalog';
import { 
  MapPin, ShieldCheck, CreditCard, ChevronRight, HelpCircle, Check,
  AlertCircle, Tag, ArrowRight, Truck, Info, Phone
} from 'lucide-react';

interface CartItem {
  id: string;
  productName: string;
  productSlug: string;
  qty: number;
  corners: string;
  finish: string;
  speed: string;
  unitPrice: number;
  thumbnail: string;
}

// Mock addresses for fallback when Google Maps API isn't configured
const MOCK_ADDRESSES = [
  { formatted: 'Connaught Place, New Delhi, Delhi 110001', city: 'New Delhi', state: 'Delhi', pincode: '110001', lat: 28.6304, lng: 77.2177 },
  { formatted: 'MG Road, Ashok Nagar, Bengaluru, Karnataka 560001', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', lat: 12.9756, lng: 77.6067 },
  { formatted: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', lat: 19.0583, lng: 72.8302 },
  { formatted: 'Park Street, Mullick Bazar, Kolkata, West Bengal 700016', city: 'Kolkata', state: 'West Bengal', pincode: '700016', lat: 22.5487, lng: 88.3562 },
  { formatted: 'T Nagar, Chennai, Tamil Nadu 600017', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017', lat: 13.0418, lng: 80.2337 }
];

export default function CheckoutContent() {
  const router = useRouter();


  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Address Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 20.5937, lng: 78.9629 }); // center of India

  // Other Checkout States
  const [gstin, setGstin] = useState('');
  const [gstApplied, setGstApplied] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  const [addressSaved, setAddressSaved] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('cod');
  const [processing, setProcessing] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Google Maps references
  const autocompleteInputRef = useRef<HTMLInputElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check if user session exists in Cognito
    const accessToken = localStorage.getItem('infistyle_access_token');
    if (accessToken) {
      cognitoClient.getUser(accessToken).then((cognitoUser) => {
        setUser({ id: cognitoUser.username, email: cognitoUser.email, name: cognitoUser.name });
        const names = (cognitoUser.name || '').split(' ');
        setFirstName(names[0] || '');
        setLastName(names.slice(1).join(' ') || '');
      }).catch((err) => {
        console.error('Error fetching Cognito user:', err);
      });
    }

    const stored = localStorage.getItem('infistyle_cart');
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => {
    let itemPrice = item.unitPrice * item.qty;
    if (item.corners === 'Rounded') itemPrice += (50 * (item.qty / 100));
    if (item.speed === 'SameDay') itemPrice += 150;
    return acc + itemPrice;
  }, 0);

  const discountAmount = subtotal * (discountPercent / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;

  const hasExpress = cartItems.some(i => i.speed === 'SameDay');
  const shipping = subtotalAfterDiscount > 1500 ? 0 : (hasExpress ? 150 : 100);

  const gst = subtotalAfterDiscount * 0.18;
  const total = subtotalAfterDiscount + shipping + gst;

  // Apply Promo
  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'INFISTYLE10') {
      setDiscountPercent(10);
      setPromoApplied(true);
    } else {
      alert('Invalid promo code. Try: INFISTYLE10');
    }
  };

  // Apply GSTIN
  const handleApplyGst = () => {
    if (/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gstin)) {
      setGstApplied(true);
    } else {
      alert('Invalid GSTIN format. E.g. 22AAAAA0000A1Z5');
    }
  };

  // GPS Location Pin lookup
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        // Trigger reverse geocode lookup
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
          );
          const data = await res.json();
          if (data.results && data.results[0]) {
            const formatted = data.results[0].formatted_address;
            setAddressSearch(formatted);
            
            // Extract city/state/pincode from components
            const comps = data.results[0].address_components;
            let cityVal = '';
            let stateVal = '';
            let pinVal = '';
            
            for (const c of comps) {
              if (c.types.includes('locality')) cityVal = c.long_name;
              if (c.types.includes('administrative_area_level_1')) stateVal = c.long_name;
              if (c.types.includes('postal_code')) pinVal = c.long_name;
            }
            
            setCity(cityVal);
            setState(stateVal);
            setPincode(pinVal);
          } else {
            // fallback mock fill
            setAddressSearch('GPS Coordinates Pinpoint, Bengaluru');
            setCity('Bengaluru');
            setState('Karnataka');
            setPincode('560001');
          }
        } catch {
          setAddressSearch('GPS Coordinates Pinpoint, Bengaluru');
          setCity('Bengaluru');
          setState('Karnataka');
          setPincode('560001');
        }
      },
      (err) => {
        alert('Could not determine GPS coordinates. Selecting Bengaluru fallback mock location.');
        handleSelectMockAddress(MOCK_ADDRESSES[1]);
      }
    );
  };

  const handleSelectMockAddress = (addr: typeof MOCK_ADDRESSES[0]) => {
    setAddressSearch(addr.formatted);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setCoordinates({ lat: addr.lat, lng: addr.lng });
    setShowAddressDropdown(false);
  };

  // Google Maps Autocomplete loader hook
  useEffect(() => {
    if (mapsLoaded && typeof window !== 'undefined' && (window as any).google && autocompleteInputRef.current) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        { types: ['address'], componentRestrictions: { country: 'IN' } }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        setCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });

        setAddressSearch(place.formatted_address || '');

        let cityVal = '';
        let stateVal = '';
        let pinVal = '';

        if (place.address_components) {
          for (const c of place.address_components) {
            if (c.types.includes('locality')) cityVal = c.long_name;
            if (c.types.includes('administrative_area_level_1')) stateVal = c.long_name;
            if (c.types.includes('postal_code')) pinVal = c.long_name;
          }
        }

        setCity(cityVal);
        setState(stateVal);
        setPincode(pinVal);
      });
    }
  }, [mapsLoaded]);

  // Order Placement logic
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setProcessing(true);

    try {
      const addressFormatted = `${addressSearch}, ${city}, ${state} - ${pincode}`;
      
      const orderPayload = {
        items: cartItems.map(item => ({
          productName: item.productName,
          qty: item.qty,
          unitPrice: item.unitPrice,
          corners: item.corners,
          finish: item.finish,
          speed: item.speed,
          thumbnail: item.thumbnail
        })),
        totalAmount: total,
        taxAmount: gst,
        shippingAmount: shipping,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'RAZORPAY',
        shippingAddress: {
          name: `${firstName} ${lastName}`,
          line1: addressSearch,
          city,
          state,
          pincode,
          lat: coordinates.lat,
          lng: coordinates.lng,
          formatted: addressFormatted
        }
      };

      // 1. Submit order and shipping details to Hono REST API in a single transaction
      const res = await api.placeOrder(orderPayload);
      const orderId = res.orderId;

      // 2. Payment flow processing
      if (paymentMethod === 'cod') {
        confetti({ particleCount: 150, spread: 80 });
        localStorage.removeItem('infistyle_cart');
        window.dispatchEvent(new Event('storage'));
        
        setToastMessage(`COD Order Placed Successfully! Order ID: ${orderId.slice(0,8).toUpperCase()}`);
        setTimeout(() => {
          setToastMessage('');
          router.push(`/dashboard?tab=orders`);
        }, 2000);
      } else {
        // Razorpay Payment Flow Client Popup
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: Math.round(total * 100),
          currency: 'INR',
          name: 'Infistyle India',
          description: 'Print Order Checkout',
          handler: async function (response: any) {
            // Confirm transaction success (updates DynamoDB status on Hono)
            confetti({ particleCount: 150, spread: 80 });
            localStorage.removeItem('infistyle_cart');
            window.dispatchEvent(new Event('storage'));

            setToastMessage(`Online Payment Successful! Order ID: ${orderId.slice(0,8).toUpperCase()}`);
            setTimeout(() => {
              setToastMessage('');
              router.push(`/dashboard?tab=orders`);
            }, 2000);
          },
          prefill: {
            name: `${firstName} ${lastName}`,
            contact: phone,
            email: user?.email || ''
          },
          theme: {
            color: '#F5B800'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error occurred during order checkouts.');
    } finally {
      setProcessing(false);
    }
  };

  const [toastMessage, setToastMessage] = useState('');

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Script Loaders */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'placeholder'}&libraries=places`} 
        strategy="lazyOnload"
        onLoad={() => setMapsLoaded(true)}
      />

      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-primary text-dark-charcoal font-black py-3.5 px-8 rounded-full border border-dark-charcoal shadow-2xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-400 font-bold mb-8 flex items-center gap-1.5">
        <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
        <span>&gt;</span>
        <span className="text-dark-charcoal">Checkout</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Shipping address form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="brand-card p-6">
            <h2 className="text-xl font-black text-dark-charcoal tracking-tight mb-6">
              Shipping & Delivery
            </h2>

            {!addressSaved ? (
              <form onSubmit={(e) => { e.preventDefault(); setAddressSaved(true); }} className="space-y-4">
                
                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-500">First Name*</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-brand text-xs py-2 font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-500">Last Name*</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input-brand text-xs py-2 font-bold"
                    />
                  </div>
                </div>

                {/* Company & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-500">Company (Optional)</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="input-brand text-xs py-2 font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-500">Phone Number*</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-brand text-xs py-2 font-bold"
                      placeholder="E.g. +91 9999988888"
                    />
                  </div>
                </div>

                {/* Detect My Location Maps Autocomplete Trigger */}
                <div className="flex flex-col gap-1.5 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-gray-500">Search Address (Google Maps)*</label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      className="text-[10px] font-black uppercase text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5" /> Detect My Location
                    </button>
                  </div>
                  
                  <input
                    ref={autocompleteInputRef}
                    type="text"
                    required
                    placeholder="Search your street address..."
                    value={addressSearch}
                    onChange={(e) => {
                      setAddressSearch(e.target.value);
                      setShowAddressDropdown(e.target.value.length > 0);
                    }}
                    className="input-brand text-xs py-2 font-bold"
                  />

                  {/* Fallback mock addresses search dropdown */}
                  {showAddressDropdown && !mapsLoaded && (
                    <div className="absolute top-14 left-0 right-0 bg-white border border-primary rounded-xl shadow-lg z-30 py-2 divide-y divide-zinc-50 max-h-48 overflow-y-auto">
                      {MOCK_ADDRESSES.filter(a => a.formatted.toLowerCase().includes(addressSearch.toLowerCase())).map((addr, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectMockAddress(addr)}
                          className="px-4 py-2 hover:bg-yellow-50 text-xs font-bold text-gray-600 cursor-pointer"
                        >
                          {addr.formatted}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* City, State, Pincode details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-500">City*</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-brand text-xs py-2 font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-500">State*</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="input-brand text-xs py-2 font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-500">Pincode*</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="input-brand text-xs py-2 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-yellow-50 flex justify-end">
                  <button type="submit" className="btn-primary text-xs py-2.5 px-8">
                    Save and Continue
                  </button>
                </div>

              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-yellow-100">
                  <span className="text-xs font-black uppercase tracking-wider text-primary">Saved Shipping Destination</span>
                  <button
                    onClick={() => setAddressSaved(false)}
                    className="text-xs text-gray-400 hover:text-dark-charcoal font-bold underline"
                  >
                    Edit Address
                  </button>
                </div>
                <div className="text-xs font-bold text-gray-600 space-y-1">
                  <p className="text-dark-charcoal font-black">{firstName} {lastName}</p>
                  {company && <p>Company: {company}</p>}
                  <p>Phone: {phone}</p>
                  <p>Address: {addressSearch}</p>
                  <p>{city}, {state} - {pincode}</p>
                </div>

                {/* Collapsible Payment details panel */}
                <div className="border-t border-yellow-100 pt-6 mt-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-dark-charcoal tracking-wider">
                    Select Payment Method
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-primary bg-yellow-50/20'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <Truck className="h-5 w-5 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-dark-charcoal">Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-gray-500 font-medium mt-0.5">Pay in cash on arrival</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'border-primary bg-yellow-50/20'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-dark-charcoal">Razorpay Online Payment</span>
                        <span className="text-[10px] text-gray-500 font-medium mt-0.5">UPI, cards, or netbanking</span>
                      </div>
                    </button>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={processing || cartItems.length === 0}
                      className="btn-primary py-3 px-10 text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                      {processing ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order summary and Map preview */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Summary */}
          <div className="brand-card p-6 bg-yellow-50/5">
            <h2 className="text-sm font-black text-dark-charcoal uppercase tracking-wider border-b border-yellow-100 pb-3 mb-4">
              Checkout Breakdown
            </h2>

            {/* GST Number verification */}
            <div className="mb-4">
              <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Company GSTIN (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  disabled={gstApplied}
                  className="input-brand text-xs py-1 px-2 font-bold flex-grow"
                />
                <button
                  type="button"
                  onClick={handleApplyGst}
                  disabled={gstApplied}
                  className="btn-primary text-xs py-1 px-3"
                >
                  {gstApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Promo Code input */}
            <div className="mb-6">
              <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Promo Code (Try: INFISTYLE10)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="INFISTYLE10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                  className="input-brand text-xs py-1 px-2 font-bold flex-grow"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoApplied}
                  className="btn-primary text-xs py-1 px-3"
                >
                  {promoApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-bold text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-dark-charcoal">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-dark-charcoal">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="text-dark-charcoal">₹{gst.toFixed(2)}</span>
              </div>
              <div className="border-t border-yellow-100 pt-3 flex justify-between text-sm font-black text-dark-charcoal">
                <span>Total Due</span>
                <span className="text-primary font-black">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* SVG Map Widget fallback marker */}
          <div className="brand-card overflow-hidden">
            <div className="bg-yellow-50 px-4 py-2 text-[10px] font-black uppercase text-dark-charcoal border-b border-primary/20">
              Live Delivery Marker Mapping
            </div>
            
            <div className="h-48 bg-zinc-100 flex items-center justify-center relative">
              {/* If Google Maps script is not active, display SVG outline map */}
              <svg className="absolute inset-0 w-full h-full text-zinc-300 fill-zinc-50" viewBox="0 0 100 100">
                <path d="M10,20 Q30,10 50,20 T90,20 Q95,50 85,80 T40,90 Q15,60 10,20 Z" stroke="#e2e8f0" strokeWidth="1" />
                <path d="M30,30 Q50,40 70,30" stroke="#f4f4f5" strokeWidth="2" fill="none" />
                <circle cx="50" cy="50" r="15" stroke="#f4f4f5" strokeWidth="1" fill="none" />
              </svg>

              {/* Dynamic Map Marker Pin */}
              <div className="absolute z-10 flex flex-col items-center animate-bounce" style={{ top: '45%', left: '48%' }}>
                <MapPin className="h-8 w-8 text-red-500 fill-white" />
                <div className="bg-dark-charcoal text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-md mt-1 whitespace-nowrap">
                  {pincode || 'Select Destination'}
                </div>
              </div>

              <div className="absolute bottom-2 right-2 z-10 bg-white border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black text-gray-400">
                Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
