import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Hammer, ShieldCheck, Star, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { initialTestimonials } from '../data/testimonials.js';
import { formatPrice } from '../utils/formatPrice.js';
import { calculateDiscountPercentage, getEffectivePrice } from '../utils/calculateDiscount.js';
import ProductGrid from '../components/products/ProductGrid.jsx';
import SafeImage from '../components/common/SafeImage.jsx';
import heroShoesImg from '../assets/images/hero_leather_shoes_1794844437208.webp';
import heroBagImg from '../assets/images/hero_leather_bag_1794844438936.webp';

const HERO_SPOTLIGHTS = [
  {
    id: 'shoes',
    label: 'Shoes',
    title: 'Goodyear-welted footwear',
    caption: 'Full-grain calfskin · Hand-burnished soles',
    to: '/category/shoes',
    image: heroShoesImg,
    alt: 'Handcrafted espresso leather Oxford shoes on travertine stone',
    fallbackTitle: 'Creating Leather Goods Footwear',
  },
  {
    id: 'bags',
    label: 'Bags',
    title: 'Carryalls & weekenders',
    caption: 'Pull-up hides · Solid cast brass hardware',
    to: '/category/bags',
    image: heroBagImg,
    alt: 'Cognac full-grain leather weekender duffle bag with brass hardware',
    fallbackTitle: 'Creating Leather Goods Bags',
  },
  {
    id: 'jackets',
    label: 'Jackets',
    title: 'Tailored leather outerwear',
    caption: 'Drum-dyed hides · Natural drape over time',
    to: '/category/jackets',
    image: '/src/assets/images/jacket_racer_espresso_1794844440857.webp',
    alt: 'Tailored espresso leather cafe racer jacket',
    fallbackTitle: 'Creating Leather Goods Jackets',
  },
  {
    id: 'wallets',
    label: 'Wallets',
    title: 'Vegetable-tanned pocket goods',
    caption: 'Hand-skived edges · Ages with everyday carry',
    to: '/category/wallets',
    image: '/src/assets/images/wallet_bifold_cognac_1794844441528.webp',
    alt: 'Cognac vegetable-tanned leather bifold wallet',
    fallbackTitle: 'Creating Leather Goods Wallets',
  },
];

export default function Home() {
  const { products, categories, storeSettings } = useStore();
  const { showToast } = useToast();
  const [activeSpotId, setActiveSpotId] = useState('shoes');
  const [hasSwitchedHero, setHasSwitchedHero] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const activeSpotlight =
    HERO_SPOTLIGHTS.find((item) => item.id === activeSpotId) || HERO_SPOTLIGHTS[0];
  const currency = storeSettings.currency || 'PKR';

  const publishedProducts = useMemo(
    () => products.filter((p) => p.isPublished !== false),
    [products]
  );

  const enabledCategories = useMemo(
    () => categories.filter((c) => c.enabled !== false),
    [categories]
  );

  const newArrivals = useMemo(
    () =>
      [...publishedProducts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8),
    [publishedProducts]
  );

  const saleProducts = useMemo(
    () =>
      publishedProducts.filter(
        (p) =>
          p.isOnSale &&
          p.discountPrice != null &&
          Number(p.discountPrice) < Number(p.originalPrice)
      ),
    [publishedProducts]
  );

  const bestSellers = useMemo(
    () => publishedProducts.filter((p) => p.isBestSeller).slice(0, 4),
    [publishedProducts]
  );

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const p of publishedProducts) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [publishedProducts]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const trimmed = newsletterEmail.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValid) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setNewsletterSubmitted(true);
    setNewsletterEmail('');
    showToast('Email validated for newsletter preview (demo mode).');
  };

  return (
    <div>
      {/* C. Simple Interactive Showcase Hero */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Editorial Column */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-5 md:space-y-6">
            <p className="text-sm font-medium text-[#8C5A36] tracking-wide">
              Workshop Collection · Cash on Delivery
            </p>

            <h1 className="text-[34px] sm:text-[44px] lg:text-[52px] xl:text-[58px] font-bold leading-[1.06] tracking-tight text-[#17130F]">
              Crafted in leather. Made for life.
            </h1>

            <p className="text-base text-[#625D57] leading-relaxed max-w-md">
              Discover timeless leather shoes, jackets, wallets, and bags made for everyday living.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#241811] text-white px-7 py-3.5 min-h-[44px] text-base font-medium hover:bg-[#3A281E] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={activeSpotlight.to}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-1 text-sm font-medium text-[#17130F] hover:text-[#8C5A36] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Shop {activeSpotlight.label}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Interactive Craft Selector */}
            <div className="pt-4 border-t border-[#E6E2DC]">
              <p className="text-xs font-medium uppercase tracking-wider text-[#625D57] mb-2">
                Preview Craft
              </p>
              <div
                className="grid grid-cols-4 gap-2"
                role="group"
                aria-label="Preview featured leather categories"
              >
                {HERO_SPOTLIGHTS.map((item) => {
                  const isActive = item.id === activeSpotlight.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        if (item.id !== activeSpotId) {
                          setActiveSpotId(item.id);
                          setHasSwitchedHero(true);
                        }
                      }}
                      className={`min-h-[44px] px-2 text-sm font-medium text-left transition-colors border-b-2 cursor-pointer whitespace-nowrap truncate ${
                        isActive
                          ? 'border-[#17130F] text-[#17130F]'
                          : 'border-transparent text-[#625D57] hover:text-[#17130F] hover:border-[#E6E2DC]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Single Showcase Frame */}
          <div className="lg:col-span-7 border border-[#E6E2DC] bg-[#F3F1ED]">
            <div className="aspect-[4/3] overflow-hidden bg-[#F3F1ED]">
              <SafeImage
                key={activeSpotlight.id}
                src={activeSpotlight.image}
                alt={activeSpotlight.alt}
                fallbackTitle={activeSpotlight.fallbackTitle}
                loading="eager"
                fetchPriority={activeSpotlight.id === 'shoes' ? 'high' : undefined}
                className={`w-full h-full object-cover ${
                  hasSwitchedHero ? 'animate-toast-enter' : ''
                }`}
              />
            </div>

            <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-white border-t border-[#E6E2DC] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-medium text-[#17130F] truncate">
                  {activeSpotlight.title}
                </p>
                <p className="text-xs sm:text-sm text-[#625D57] truncate">
                  {activeSpotlight.caption}
                </p>
              </div>
              <Link
                to={activeSpotlight.to}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-2 text-sm font-medium text-[#17130F] hover:text-[#8C5A36] transition-colors whitespace-nowrap shrink-0"
              >
                <span>View</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* D. Shop by Category */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16 border-t border-[#E6E2DC]">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold tracking-tight text-[#17130F]">
              Shop by Category
            </h2>
            <p className="text-sm sm:text-base text-[#625D57] mt-1">
              Four core silhouettes crafted from full-grain vegetable-tanned hides.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#17130F] hover:text-[#8C5A36] transition-colors whitespace-nowrap shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory pb-2 md:pb-0">
          {enabledCategories.map((category) => {
            const count = categoryCounts[category.slug] || 0;
            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group min-w-[75%] sm:min-w-[46%] md:min-w-0 snap-start flex flex-col border border-[#E6E2DC] bg-white hover:border-[#8C5A36] transition-colors"
              >
                <div className="aspect-[4/3] bg-[#F3F1ED] overflow-hidden border-b border-[#E6E2DC]">
                  <SafeImage
                    src={category.image}
                    alt={category.name}
                    fallbackTitle={category.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <h3 className="text-lg font-semibold text-[#17130F]">
                        {category.name}
                      </h3>
                      <span className="text-sm text-[#625D57] tabular-nums">
                        {count} {count === 1 ? 'style' : 'styles'}
                      </span>
                    </div>
                    <p className="text-sm text-[#625D57] leading-relaxed line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#17130F] group-hover:text-[#8C5A36] transition-colors">
                    <span>Explore {category.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* E. New Arrivals */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16 border-t border-[#E6E2DC]">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold tracking-tight text-[#17130F]">
              New Arrivals
            </h2>
            <p className="text-base text-[#625D57] mt-1">
              Recent additions straight from the workshop bench.
            </p>
          </div>
          <Link
            to="/new-arrivals"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#17130F] hover:text-[#8C5A36] transition-colors whitespace-nowrap"
          >
            <span>Shop All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={newArrivals} />
      </section>

      {/* F. Sale Collection */}
      {saleProducts.length > 0 && (
        <section className="bg-[#F3F1ED] border-y border-[#E6E2DC]">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold tracking-tight text-[#17130F]">
                  Seasonal Archive Sale
                </h2>
                <p className="text-base text-[#625D57] mt-1">
                  Limited reductions on selected handcrafted leather pieces.
                </p>
              </div>
              <Link
                to="/sale"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B42318] hover:underline whitespace-nowrap"
              >
                <span>View All Sale</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
              {saleProducts.slice(0, 4).map((product) => {
                const discountPct = calculateDiscountPercentage(
                  product.originalPrice,
                  product.discountPrice
                );
                const primaryImage =
                  product.images?.[product.primaryImageIndex || 0] ||
                  product.images?.[0] ||
                  '';

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group bg-white border border-[#E6E2DC] flex flex-col hover:border-[#8C5A36] transition-colors"
                  >
                    <div className="relative aspect-[4/3] bg-[#F3F1ED] overflow-hidden border-b border-[#E6E2DC]">
                      <SafeImage
                        src={primaryImage}
                        alt={product.name}
                        fallbackTitle={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <span className="absolute top-3 left-3 bg-[#B42318] text-white px-2.5 py-0.5 text-sm font-medium tabular-nums">
                        -{discountPct}%
                      </span>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <h3 className="text-base font-medium text-[#17130F] group-hover:underline">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2.5 tabular-nums pt-1">
                        <span className="text-base font-semibold text-[#B42318]">
                          {formatPrice(getEffectivePrice(product), currency)}
                        </span>
                        <span className="text-sm text-[#625D57] line-through">
                          {formatPrice(product.originalPrice, currency)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* G. Brand Story / Craftsmanship */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[460px] bg-[#F3F1ED] border border-[#E6E2DC] overflow-hidden">
            <SafeImage
              src="/src/assets/images/workshop_craftsmanship_1794844438224.webp"
              alt="Artisan hand-stitching a vegetable-tanned leather bag on a wooden workbench"
              fallbackTitle="Our Leather Workshop"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center py-4 lg:px-6">
            <p className="text-sm font-medium text-[#8C5A36] uppercase tracking-wider mb-3">
              Craftsmanship
            </p>
            <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold tracking-tight text-[#17130F] mb-5">
              Made with care. Built to last.
            </h2>
            <p className="text-base text-[#625D57] leading-relaxed mb-8 max-w-xl">
              We believe good leather goods should get better with time. Every piece in our collection is selected for its craftsmanship, quality materials, and timeless design.
            </p>
            <div>
              <Link
                to="/story"
                className="inline-flex items-center gap-2 border border-[#17130F] text-[#17130F] px-6 py-3 text-base font-medium hover:bg-[#241811] hover:text-white transition-colors"
              >
                <span>Discover Our Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* H. Why Choose Us */}
      <section className="border-y border-[#E6E2DC] bg-[#F3F1ED]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E6E2DC] p-6 md:p-8">
              <ShieldCheck className="w-6 h-6 text-[#8C5A36] mb-4" />
              <h3 className="text-lg font-semibold text-[#17130F] mb-2">
                Premium Leather
              </h3>
              <p className="text-base text-[#625D57] leading-relaxed">
                Full-grain calfskin, drum-dyed cowhide, and vegetable-tanned hides that develop an honest patina over years of use.
              </p>
            </div>

            <div className="bg-white border border-[#E6E2DC] p-6 md:p-8">
              <Hammer className="w-6 h-6 text-[#8C5A36] mb-4" />
              <h3 className="text-lg font-semibold text-[#17130F] mb-2">
                Carefully Crafted
              </h3>
              <p className="text-base text-[#625D57] leading-relaxed">
                Goodyear-welted soles, hand-burnished wallet edges, and solid cast brass hardware inspected individually before dispatch.
              </p>
            </div>

            <div className="bg-white border border-[#E6E2DC] p-6 md:p-8">
              <Truck className="w-6 h-6 text-[#8C5A36] mb-4" />
              <h3 className="text-lg font-semibold text-[#17130F] mb-2">
                Cash on Delivery
              </h3>
              <p className="text-base text-[#625D57] leading-relaxed">
                Simple Cash on Delivery across Pakistan with direct WhatsApp order confirmation before your parcel leaves the workshop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* I. Featured Collection / Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold tracking-tight text-[#17130F]">
                Best Sellers
              </h2>
              <p className="text-base text-[#625D57] mt-1">
                Our most requested everyday leather staples.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#17130F] hover:text-[#8C5A36] transition-colors whitespace-nowrap"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ProductGrid products={bestSellers} />
        </section>
      )}

      {/* J. Customer Testimonials */}
      <section className="border-t border-[#E6E2DC] bg-[#F3F1ED]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="mb-8">
            <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold tracking-tight text-[#17130F]">
              Worn & Carried Across Pakistan
            </h2>
            <p className="text-base text-[#625D57] mt-1">
              Customer notes on fit, hide patina, and delivery experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialTestimonials.map((review) => (
              <article
                key={review.id}
                className="bg-white border border-[#E6E2DC] p-6 flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#8C5A36] text-[#8C5A36]"
                      />
                    ))}
                  </div>
                  <p className="text-base text-[#17130F] leading-relaxed">
                    “{review.quote}”
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E6E2DC] text-sm">
                  <p className="font-semibold text-[#17130F]">{review.name}</p>
                  <p className="text-[#625D57]">
                    {review.city} · {review.product}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* K. Minimal Newsletter Section */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-semibold tracking-tight text-[#17130F] mb-3">
            Stay close to the craft.
          </h2>
          <p className="text-base text-[#625D57] leading-relaxed mb-6">
            Get updates on new collections, special offers, and stories behind our products.
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              aria-label="Email address"
              className="flex-1 px-4 py-3 bg-[#F3F1ED] border border-[#E6E2DC] text-base text-[#17130F] placeholder:text-[#625D57] focus:outline-none focus:border-[#17130F]"
            />
            <button
              type="submit"
              className="px-7 py-3 bg-[#241811] text-white text-base font-medium hover:bg-[#3A281E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Sign Up
            </button>
          </form>

          {newsletterSubmitted && (
            <p className="text-sm text-[#625D57] mt-3">
              Prototype preview: your email format was validated locally. Live mailing list subscriptions will be connected when backend services are added.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
