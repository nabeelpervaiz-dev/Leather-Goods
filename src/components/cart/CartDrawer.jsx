import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart.js';
import { useStore } from '../../context/StoreContext.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import CartItem from './CartItem.jsx';

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    isDrawerOpen,
    closeDrawer,
  } = useCart();
  const { storeSettings } = useStore();
  const [animateOpen, setAnimateOpen] = useState(false);

  const currency = storeSettings.currency || 'PKR';
  const threshold = Number(storeSettings.freeDeliveryThreshold) || 0;
  const remainingForFree = Math.max(0, threshold - subtotal);

  useEffect(() => {
    if (!isDrawerOpen) {
      setAnimateOpen(false);
      return undefined;
    }
    const raf = window.requestAnimationFrame(() => setAnimateOpen(true));
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${
        isDrawerOpen && animateOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isDrawerOpen}
    >
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-[#17130F]/50"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
        style={{
          transform:
            isDrawerOpen && animateOpen
              ? 'translate3d(0, 0, 0)'
              : 'translate3d(100%, 0, 0)',
        }}
        className="relative z-10 w-full max-w-md bg-white h-full border-l border-[#E6E2DC] flex flex-col transition-transform duration-200 ease-out"
      >
        {/* Header */}
        <div className="px-6 h-16 border-b border-[#E6E2DC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#17130F]" />
            <h2 className="text-lg font-semibold text-[#17130F]">
              Shopping Bag ({itemCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close shopping bag"
            className="p-2 text-[#625D57] hover:text-[#17130F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Note */}
        {items.length > 0 && threshold > 0 && (
          <div className="px-6 py-2.5 bg-[#F3F1ED] border-b border-[#E6E2DC] text-sm text-[#17130F]">
            {remainingForFree === 0
              ? 'You qualify for complimentary Cash on Delivery shipping.'
              : `Add ${formatPrice(remainingForFree, currency)} more for free shipping.`}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-10 h-10 text-[#625D57] mb-3" />
              <p className="text-base font-medium text-[#17130F] mb-1">
                Your shopping bag is empty
              </p>
              <p className="text-sm text-[#625D57] mb-6">
                Explore handcrafted leather shoes, jackets, wallets, and bags.
              </p>
              <Link
                to="/shop"
                onClick={closeDrawer}
                className="px-6 py-3 bg-[#241811] text-white text-sm font-medium hover:bg-[#3A281E] transition-colors"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={item.key} item={item} compact />
              ))}
            </div>
          )}
        </div>

        {/* Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#E6E2DC] bg-[#F3F1ED] space-y-4 shrink-0">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-[#625D57]">
                <span>Subtotal</span>
                <span className="tabular-nums text-[#17130F]">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#625D57]">
                <span>Delivery</span>
                <span className="tabular-nums text-[#17130F]">
                  {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E6E2DC] text-base font-semibold text-[#17130F]">
                <span>Total (Cash on Delivery)</span>
                <span className="tabular-nums">{formatPrice(total, currency)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/cart"
                onClick={closeDrawer}
                className="text-center py-3 px-4 border border-[#17130F] bg-white text-[#17130F] text-sm font-medium hover:bg-[#E8DCCB] transition-colors"
              >
                View Bag
              </Link>
              <Link
                to="/checkout"
                onClick={closeDrawer}
                className="text-center py-3 px-4 bg-[#241811] text-white text-sm font-medium hover:bg-[#3A281E] transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
