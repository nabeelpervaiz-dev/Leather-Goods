import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice.js';
import { useCart } from '../../hooks/useCart.js';
import { useStore } from '../../context/StoreContext.jsx';
import SafeImage from '../common/SafeImage.jsx';

export default function CartItem({ item, compact = false }) {
  const { updateQuantity, removeFromCart, updateVariant, closeDrawer } = useCart();
  const { storeSettings } = useStore();
  const currency = storeSettings.currency || 'PKR';

  return (
    <div className="flex gap-4 py-4 border-b border-[#E6E2DC]">
      <Link
        to={`/product/${item.productId}`}
        onClick={closeDrawer}
        className={`${compact ? 'w-20 h-20' : 'w-24 h-24'} bg-[#F3F1ED] border border-[#E6E2DC] shrink-0 overflow-hidden`}
      >
        <SafeImage
          src={item.image}
          alt={item.name}
          fallbackTitle={item.name}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              to={`/product/${item.productId}`}
              onClick={closeDrawer}
              className="text-base font-medium text-[#17130F] hover:underline line-clamp-1"
            >
              {item.name}
            </Link>
            <p className="text-sm text-[#625D57] tabular-nums">
              {formatPrice(item.unitPrice, currency)} each
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeFromCart(item.key)}
            aria-label={`Remove ${item.name}`}
            className="p-1.5 text-[#625D57] hover:text-[#B42318] transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Variant controls */}
        <div className="flex flex-wrap items-center gap-2 my-2">
          {item.availableSizes?.length > 0 && (
            <select
              aria-label={`Change size for ${item.name}`}
              value={item.size || ''}
              onChange={(e) => updateVariant(item.key, { size: e.target.value })}
              className="bg-[#F3F1ED] border border-[#E6E2DC] px-2 py-1 text-sm text-[#17130F] cursor-pointer"
            >
              {item.availableSizes.map((s) => (
                <option key={s} value={s}>
                  Size {s}
                </option>
              ))}
            </select>
          )}
          {item.availableColors?.length > 0 && (
            <select
              aria-label={`Change color for ${item.name}`}
              value={item.color || ''}
              onChange={(e) => updateVariant(item.key, { color: e.target.value })}
              className="bg-[#F3F1ED] border border-[#E6E2DC] px-2 py-1 text-sm text-[#17130F] cursor-pointer"
            >
              {item.availableColors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Stepper & Line Total */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center border border-[#E6E2DC]">
            <button
              type="button"
              onClick={() => updateQuantity(item.key, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center text-[#17130F] hover:bg-[#F3F1ED] transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.key, item.quantity + 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center text-[#17130F] hover:bg-[#F3F1ED] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-base font-semibold text-[#17130F] tabular-nums">
            {formatPrice(item.unitPrice * item.quantity, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
