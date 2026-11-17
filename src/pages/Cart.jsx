import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart.js';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import CartItem from '../components/cart/CartItem.jsx';

export default function Cart() {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { storeSettings } = useStore();
  const currency = storeSettings.currency || 'PKR';

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="flex items-baseline justify-between gap-4 border-b border-[#E6E2DC] pb-5 mb-8">
        <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight text-[#17130F]">
          Shopping Bag
        </h1>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-sm text-[#625D57] hover:text-[#B42318] transition-colors cursor-pointer"
          >
            Clear Bag
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="border border-[#E6E2DC] bg-[#F3F1ED] py-16 px-6 text-center">
          <ShoppingBag className="w-10 h-10 text-[#625D57] mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-[#17130F] mb-2">
            Your shopping bag is currently empty
          </h2>
          <p className="text-base text-[#625D57] mb-6 max-w-md mx-auto">
            Browse our leather shoes, jackets, wallets, and bags to add items to your order.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-7 py-3 bg-[#241811] text-white text-base font-medium hover:bg-[#3A281E] transition-colors"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8">
            {items.map((item) => (
              <CartItem key={item.key} item={item} />
            ))}
          </div>

          <aside className="lg:col-span-4 bg-[#F3F1ED] border border-[#E6E2DC] p-6 space-y-5">
            <h2 className="text-lg font-semibold text-[#17130F] border-b border-[#E6E2DC] pb-3">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-[#625D57]">
                <span>Subtotal</span>
                <span className="tabular-nums text-[#17130F] font-medium">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#625D57]">
                <span>Cash on Delivery Charge</span>
                <span className="tabular-nums text-[#17130F] font-medium">
                  {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#E6E2DC] text-base font-semibold text-[#17130F]">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(total, currency)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#241811] text-white text-base font-medium hover:bg-[#3A281E] transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/shop"
              className="block text-center text-sm font-medium text-[#17130F] hover:underline"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
