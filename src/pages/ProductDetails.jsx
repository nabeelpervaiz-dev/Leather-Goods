import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { useCart } from '../hooks/useCart.js';
import { useToast } from '../context/ToastContext.jsx';
import { getProductById } from '../services/productService.js';
import { formatPrice } from '../utils/formatPrice.js';
import { calculateDiscountPercentage, getEffectivePrice } from '../utils/calculateDiscount.js';
import ProductGallery from '../components/products/ProductGallery.jsx';
import ProductGrid from '../components/products/ProductGrid.jsx';
import Button from '../components/common/Button.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, storeSettings, isLoading } = useStore();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const contextProduct = useMemo(
    () => products.find((p) => p.id === id || p.slug === id) || null,
    [products, id]
  );

  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [fetchingProduct, setFetchingProduct] = useState(false);

  useEffect(() => {
    let active = true;
    if (contextProduct || isLoading) return undefined;

    setFetchingProduct(true);
    getProductById(id)
      .then((doc) => {
        if (active) setFetchedProduct(doc);
      })
      .catch(() => {
        if (active) setFetchedProduct(null);
      })
      .finally(() => {
        if (active) setFetchingProduct(false);
      });

    return () => {
      active = false;
    };
  }, [id, contextProduct, isLoading]);

  const product = contextProduct || fetchedProduct;

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes?.length === 1 ? product.sizes[0] : '');
    setSelectedColor(product.colors?.length > 0 ? product.colors[0] : '');
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const targetCategory = product.categoryId || product.category;
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.isActive !== false &&
          p.status !== 'draft' &&
          (p.categoryId || p.category) === targetCategory
      )
      .slice(0, 4);
  }, [products, product]);

  if (isLoading || fetchingProduct) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 aspect-[4/3] bg-[#F3F1ED] border border-[#E6E2DC]" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-4 bg-[#F3F1ED] w-1/3" />
            <div className="h-10 bg-[#F3F1ED] w-3/4" />
            <div className="h-7 bg-[#F3F1ED] w-1/3" />
            <div className="h-24 bg-[#F3F1ED] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-[#17130F] mb-3">Product not found</h1>
        <p className="text-base text-[#625D57] mb-6">
          This item may have been moved or removed from the catalog.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#241811] text-white text-base font-medium"
        >
          Browse Collection
        </Link>
      </div>
    );
  }

  const currency = storeSettings.currency || 'PKR';
  const effectivePrice = getEffectivePrice(product);
  const discountPct = product.isOnSale
    ? calculateDiscountPercentage(product.price, product.discountPrice)
    : 0;
  const stock = Number(product.stockQuantity) || 0;
  const isOutOfStock = stock <= 0;
  const requiresSize = Boolean(product.sizes && product.sizes.length > 0);
  const requiresColor = Boolean(product.colors && product.colors.length > 0);
  const categorySlug = product.categoryId || product.category || 'shop';
  const categoryLabel = product.categoryName || categorySlug;

  const validateSelection = () => {
    if (isOutOfStock) {
      showToast('This product is currently out of stock.', 'error');
      return false;
    }
    if (requiresSize && !selectedSize) {
      showToast('Please select a size before adding to bag.', 'error');
      return false;
    }
    if (requiresColor && !selectedColor) {
      showToast('Please select a color before adding to bag.', 'error');
      return false;
    }
    return true;
  };

  const handleAddToBag = () => {
    if (!validateSelection()) return;
    addToCart(product, {
      size: selectedSize || null,
      color: selectedColor || null,
      quantity,
      openBag: true,
    });
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    const added = addToCart(product, {
      size: selectedSize || null,
      color: selectedColor || null,
      quantity,
      openBag: false,
    });
    if (added) {
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-sm text-[#625D57] mb-8 flex flex-wrap items-center gap-2">
        <Link to="/" className="hover:text-[#17130F]">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/category/${categorySlug}`} className="capitalize hover:text-[#17130F]">
          {categoryLabel}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#17130F] font-medium">{product.name}</span>
      </nav>

      {/* Main 2-column Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <ProductGallery
            images={product.images}
            productName={product.name}
            primaryIndex={product.primaryImageIndex || 0}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-[#E6E2DC] pb-6">
            <div className="flex items-center justify-between gap-2 text-sm text-[#625D57] mb-2">
              <span className="uppercase tracking-wider">{categoryLabel}</span>
              <span className="tabular-nums">SKU: {product.sku}</span>
            </div>

            <h1 className="text-[28px] md:text-[36px] font-semibold tracking-tight text-[#17130F] mb-3">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 tabular-nums">
              {product.isOnSale && discountPct > 0 ? (
                <>
                  <span className="text-2xl font-semibold text-[#B42318]">
                    {formatPrice(effectivePrice, currency)}
                  </span>
                  <span className="text-lg text-[#625D57] line-through">
                    {formatPrice(product.price, currency)}
                  </span>
                  <span className="bg-[#B42318] text-white px-2.5 py-0.5 text-sm font-medium">
                    Save {discountPct}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-semibold text-[#17130F]">
                  {formatPrice(effectivePrice, currency)}
                </span>
              )}
            </div>

            <div className="mt-3 text-sm">
              {isOutOfStock ? (
                <span className="text-[#B42318] font-medium">Out of Stock</span>
              ) : stock <= 5 ? (
                <span className="text-[#8C5A36] font-medium tabular-nums">
                  Low Stock — Only {stock} remaining
                </span>
              ) : (
                <span className="text-[#17130F] font-medium inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#8C5A36]" />
                  <span>In Stock — Ready for dispatch</span>
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-base text-[#625D57] leading-relaxed">
            {product.description}
          </p>

          {/* Color Selector */}
          {requiresColor && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-semibold text-[#17130F]">
                  Color: <span className="font-normal text-[#625D57]">{selectedColor}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm font-medium border transition-colors cursor-pointer ${
                      selectedColor === color
                        ? 'bg-[#241811] text-white border-[#241811]'
                        : 'bg-white text-[#17130F] border-[#E6E2DC] hover:border-[#17130F]'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {requiresSize && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-semibold text-[#17130F]">
                  Size: <span className="font-normal text-[#625D57]">{selectedSize || 'Select a size'}</span>
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 text-sm font-medium border transition-colors cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#241811] text-white border-[#241811]'
                        : 'bg-white text-[#17130F] border-[#E6E2DC] hover:border-[#17130F]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-[#17130F]">Quantity</span>
              <div className="inline-flex items-center border border-[#E6E2DC]">
                <button
                  type="button"
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#F3F1ED] disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-base font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock || quantity >= stock}
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#F3F1ED] disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                disabled={isOutOfStock}
                onClick={handleAddToBag}
                className="w-full py-3.5"
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
              </Button>
              <Button
                variant="secondary"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="w-full py-3.5"
              >
                Buy Now (COD)
              </Button>
            </div>
          </div>

          {/* Delivery & Guarantee */}
          <div className="bg-[#F3F1ED] border border-[#E6E2DC] p-4 space-y-2.5 text-sm text-[#17130F]">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#8C5A36] shrink-0" />
              <span>
                Cash on Delivery across Pakistan · Free delivery over{' '}
                {formatPrice(storeSettings.freeDeliveryThreshold, currency)}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#8C5A36] shrink-0" />
              <span>7-day unworn exchange & craftsmanship inspection</span>
            </div>
          </div>

          {/* Material & Specifications */}
          <div className="border-t border-[#E6E2DC] pt-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#17130F] mb-1.5">
                Material
              </h2>
              <p className="text-sm text-[#625D57] leading-relaxed">
                {product.material || 'Full-grain vegetable-tanned leather.'}
              </p>
            </div>

            {product.specifications?.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-[#17130F] mb-2">
                  Specifications
                </h2>
                <ul className="space-y-1.5 text-sm text-[#625D57]">
                  {product.specifications.map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#8C5A36] mt-1">·</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#E6E2DC]">
          <h2 className="text-[28px] font-semibold tracking-tight text-[#17130F] mb-8">
            Related Pieces
          </h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
