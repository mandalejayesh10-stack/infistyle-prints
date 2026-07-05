'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, CornerDownRight, ShieldCheck, ChevronRight } from 'lucide-react';

import { syncCartToBackend } from '@/lib/cart-sync';

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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('infistyle_cart');
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  const updateQty = (id: string, newQty: number) => {
    if (newQty < 50) return; // set minimum qty
    const updated = cartItems.map(item => {
      if (item.id === id) {
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('infistyle_cart', JSON.stringify(updated));
    syncCartToBackend(updated);
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('infistyle_cart', JSON.stringify(updated));
    syncCartToBackend(updated);
    // Dispatch a storage event to sync header count instantly
    window.dispatchEvent(new Event('storage'));
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => {
    // base calculation + add-ons
    let itemPrice = item.unitPrice * item.qty;
    if (item.corners === 'Rounded') itemPrice += (50 * (item.qty / 100));
    if (item.speed === 'SameDay') itemPrice += 150;
    return acc + itemPrice;
  }, 0);

  const shipping = subtotal > 1500 ? 0 : (cartItems.length > 0 ? 100 : 0);
  const gst = subtotal * 0.18;
  const total = subtotal + shipping + gst;

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow flex flex-col">
      <h1 className="text-3xl font-black text-dark-charcoal tracking-tight mb-8">
        Your Shopping <span className="text-primary">Cart</span>
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 brand-card bg-yellow-50/10 max-w-2xl mx-auto w-full my-auto">
          <ShoppingBag className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-dark-charcoal">Your cart is empty</h2>
          <p className="text-xs text-gray-500 font-semibold mt-1 mb-8 max-w-sm mx-auto">
            Design premium visiting cards, custom stationary, or branded caps and add them here to proceed to delivery.
          </p>
          <Link href="/catalog" className="btn-primary py-3 px-8 text-sm">
            Explore Print Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="brand-card p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                
                {/* Thumb / Info */}
                <div className="flex gap-4 items-center">
                  <div className="h-20 w-20 bg-yellow-50 rounded-lg overflow-hidden border border-primary/20 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumbnail} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-dark-charcoal leading-tight">{item.productName}</h3>
                    <div className="text-[10px] text-gray-400 font-semibold mt-1 space-y-0.5">
                      <p className="flex items-center"><CornerDownRight className="h-3 w-3 text-primary mr-1" /> Corner: {item.corners}</p>
                      <p className="flex items-center"><CornerDownRight className="h-3 w-3 text-primary mr-1" /> Finish: {item.finish}</p>
                      <p className="flex items-center"><CornerDownRight className="h-3 w-3 text-primary mr-1" /> Speed: {item.speed}</p>
                    </div>
                  </div>
                </div>

                {/* Qty & Price controls */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8 border-t sm:border-0 border-yellow-50 pt-3 sm:pt-0">
                  
                  {/* Quantity Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold">Qty:</span>
                    <select
                      value={item.qty}
                      onChange={(e) => updateQty(item.id, Number(e.target.value))}
                      className="input-brand text-xs py-1 px-2 font-bold"
                    >
                      <option value={100}>100 units</option>
                      <option value={200}>200 units</option>
                      <option value={500}>500 units</option>
                      <option value={1000}>1000 units</option>
                      <option value={2000}>2000 units</option>
                      <option value={5000}>5000 units</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-black block uppercase tracking-wider">Subtotal</span>
                    <span className="font-black text-dark-charcoal text-sm">
                      ₹{((item.unitPrice * item.qty) + (item.corners === 'Rounded' ? 50 * (item.qty / 100) : 0) + (item.speed === 'SameDay' ? 150 : 0)).toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 border-2 border-red-200 hover:border-red-500 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>

                </div>

              </div>
            ))}
          </div>

          {/* Checkout Breakdown Sidebar */}
          <div className="lg:col-span-4 brand-card p-6 bg-yellow-50/5">
            <h2 className="text-base font-black text-dark-charcoal uppercase tracking-wider border-b border-yellow-100 pb-3 mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-3 text-xs font-bold text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-dark-charcoal">₹{subtotal.toFixed(2)}</span>
              </div>
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

            <div className="mt-6 space-y-3">
              <Link 
                href="/checkout" 
                className="w-full btn-primary py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                Proceed to Checkout
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="/catalog"
                className="w-full btn-secondary py-3 text-xs uppercase tracking-wider text-center block"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-6 pt-4 border-t border-yellow-100 flex items-center gap-2 text-[10px] text-gray-400 font-semibold leading-relaxed">
              <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
              <span>Payments secured by Razorpay Checkout SDK. Delivery coordinates verified by Google Maps autocomplete.</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
