import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice.js';
import { calculateDiscountPercentage, getEffectivePrice } from '../../utils/calculateDiscount.js';
import { useCart } from '../../hooks/useCart.js';
import { useStore } from '../../context/StoreContext.jsx';
import SafeImage from '../common/SafeImage.jsx';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { storeSettings } = useStore();
  const [sizePromptOpen, setSizePromptOpen] = useState(false);
  const [shouldLoadSecondary, setShouldLoadSecondary] = useState(false);

  const primaryIndex = product.primaryImageIndex || 0;
  const primaryImage = product.images?.[primaryIndex] || product.images?.[0] || '';
  const secondaryImage =
    product.images?.find((_, idx) => idx !== primaryIndex) || primaryImage;

  const hasSecondary = Boolean(secondaryImage && secondaryImage !== primaryImage);
  const discountPct = product.isOnSale
    ? calculateDiscountPercentage(product.originalPrice, product.discountPrice)
    : 0;
  const effectivePrice = getEffectivePrice(product);
  const isOutOfStock = Number(product.stock) <= 0;
  const currency = storeSettings.currency || 'PKR';

  const handleQuickAdd = (e, chosenSize = null) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    if (product.sizes && product.sizes.length > 0 && !chosenSize) {
      setSizePromptOpen(true);
      return;
    }

    addToCart(product, {
      size: chosenSize,
      color: product.colors?.[0] || null,
      quantity: 1,
      openBag: true,
    });
    setSizePromptOpen(false);
  };

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={() => {
        if (hasSecondary && !shouldLoadSecondary) setShouldLoadSecondary(true);
      }}
      onFocus={() => {
        if (hasSecondary && !shouldLoadSecondary) setShouldLoadSecondary(true);
      }}
      onMouseLeave={() => setSizePromptOpen(false)}
    >
      {/* Rectangular Image Container */}
      <div className="relative aspect-[4/3] bg-[#F3F1ED] overflow-hidden border border-[#E6E2DC]">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <SafeImage
            src={primaryImage}
            alt={product.name}
            fallbackTitle={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              hasSecondary && shouldLoadSecondary ? 'group-hover:opacity-0' : ''
            }`}
          />
          {hasSecondary && shouldLoadSecondary && (
            <SafeImage
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fallbackTitle={product.name}
              loading="eager"
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Sale / Stock Rectangular Label */}
        {product.isOnSale && discountPct > 0 && !isOutOfStock && (
          <span className="absolute top-3 left-3 bg-[#B42318] text-white px-2.5 py-0.5 text-sm font-medium tracking-wide pointer-events-none">
            Sale {discountPct}%
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-3 left-3 bg-[#17130F] text-white px-2.5 py-0.5 text-sm font-medium tracking-wide pointer-events-none">
            Sold Out
          </span>
        )}

        {/* Desktop Hover Add to Bag Slide-up Bar */}
        {!isOutOfStock && (
          <div className="hidden md:block absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
            {sizePromptOpen && product.sizes?.length > 0 ? (
              <div className="bg-white/95 border-t border-[#E6E2DC] p-2.5">
                <p className="text-sm font-medium text-[#17130F] mb-2 text-center">
                  Select Size
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => handleQuickAdd(e, size)}
                      className="px-2.5 py-1 text-sm font-medium border border-[#E6E2DC] bg-white text-[#17130F] hover:bg-[#241811] hover:text-white hover:border-[#241811] transition-colors cursor-pointer"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => handleQuickAdd(e)}
                className="w-full py-3 bg-[#241811] text-white text-sm font-medium hover:bg-[#3A281E] transition-colors cursor-pointer"
              >
                Add to Bag
              </button>
            )}
          </div>
        )}

        {/* Mobile Quick-Add Circular Plus Button */}
        {!isOutOfStock && (
          <button
            type="button"
            onClick={(e) => {
              if (product.sizes?.length > 0) {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, {
                  size: product.sizes[0],
                  color: product.colors?.[0] || null,
                  quantity: 1,
                  openBag: true,
                });
              } else {
                handleQuickAdd(e);
              }
            }}
            aria-label={`Add ${product.name} to bag`}
            className="md:hidden absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-white text-[#17130F] border border-[#E6E2DC] flex items-center justify-center hover:bg-[#241811] hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Product Metadata */}
      <Link to={`/product/${product.id}`} className="pt-3 flex flex-col gap-1">
        <h3 className="text-base font-medium text-[#17130F] leading-snug group-hover:underline">
          {product.name}
        </h3>
        <p className="text-sm text-[#625D57]">
          {product.colors?.length > 0 ? product.colors.join(' / ') : 'Natural Leather'}
        </p>
        <div className="flex items-center gap-2.5 pt-0.5 tabular-nums">
          {product.isOnSale && discountPct > 0 ? (
            <>
              <span className="text-base font-semibold text-[#B42318]">
                {formatPrice(effectivePrice, currency)}
              </span>
              <span className="text-sm text-[#625D57] line-through">
                {formatPrice(product.originalPrice, currency)}
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-[#17130F]">
              {formatPrice(effectivePrice, currency)}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}

export default memo(ProductCard);
