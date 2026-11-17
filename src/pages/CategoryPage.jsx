import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { getEffectivePrice } from '../utils/calculateDiscount.js';
import ProductFilters from '../components/products/ProductFilters.jsx';
import ProductGrid from '../components/products/ProductGrid.jsx';
import SafeImage from '../components/common/SafeImage.jsx';

export default function CategoryPage({ mode = 'category' }) {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories } = useStore();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(mode === 'sale');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    setSelectedColor('all');
    setSelectedSize('all');
    setPriceRange('all');
    setInStockOnly(false);
    setOnSaleOnly(mode === 'sale');
  }, [slug, mode]);

  const currentCategory = useMemo(() => {
    if (mode !== 'category') return null;
    return categories.find((c) => c.slug === slug) || null;
  }, [categories, mode, slug]);

  const baseProducts = useMemo(() => {
    const published = products.filter((p) => p.isPublished !== false);
    if (mode === 'category' && slug) {
      return published.filter((p) => p.category === slug);
    }
    if (mode === 'sale') {
      return published.filter((p) => p.isOnSale && p.discountPrice);
    }
    if (mode === 'new-arrivals') {
      return [...published].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return published;
  }, [products, mode, slug]);

  const availableColors = useMemo(() => {
    const set = new Set();
    baseProducts.forEach((p) => p.colors?.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [baseProducts]);

  const availableSizes = useMemo(() => {
    const set = new Set();
    baseProducts.forEach((p) => p.sizes?.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [baseProducts]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = baseProducts.filter((product) => {
      if (q) {
        const haystack = [
          product.name,
          product.material,
          product.description,
          product.sku,
          ...(product.colors || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      const price = getEffectivePrice(product);
      if (priceRange === 'under-5000' && price >= 5000) return false;
      if (priceRange === '5000-15000' && (price < 5000 || price > 15000)) return false;
      if (priceRange === '15000-30000' && (price < 15000 || price > 30000)) return false;
      if (priceRange === 'over-30000' && price <= 30000) return false;

      if (selectedColor !== 'all' && !product.colors?.includes(selectedColor)) {
        return false;
      }
      if (selectedSize !== 'all' && !product.sizes?.includes(selectedSize)) {
        return false;
      }
      if (inStockOnly && Number(product.stock) <= 0) {
        return false;
      }
      if (onSaleOnly && !product.isOnSale) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') {
        return getEffectivePrice(a) - getEffectivePrice(b);
      }
      if (sortBy === 'price-desc') {
        return getEffectivePrice(b) - getEffectivePrice(a);
      }
      if (sortBy === 'best-sellers') {
        return Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller));
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [
    baseProducts,
    search,
    priceRange,
    selectedColor,
    selectedSize,
    inStockOnly,
    onSaleOnly,
    sortBy,
  ]);

  const handleReset = () => {
    setSearch('');
    setPriceRange('all');
    setSelectedColor('all');
    setSelectedSize('all');
    setInStockOnly(false);
    setOnSaleOnly(mode === 'sale');
    if (searchParams.has('search')) {
      setSearchParams({});
    }
  };

  let pageTitle = 'All Leather Goods';
  let pageDescription =
    'Explore our complete collection of handcrafted shoes, jackets, wallets, and bags.';
  let bannerImage = '/src/assets/images/workshop_craftsmanship_1794844438224.webp';

  if (mode === 'category' && currentCategory) {
    pageTitle = currentCategory.name;
    pageDescription = currentCategory.description;
    bannerImage = currentCategory.image;
  } else if (mode === 'new-arrivals') {
    pageTitle = 'New Arrivals';
    pageDescription = 'Our latest small-batch releases in full-grain hides.';
    bannerImage = '/src/assets/images/hero_leather_shoes_1794844437208.webp';
  } else if (mode === 'sale') {
    pageTitle = 'Archive Sale';
    pageDescription = 'Seasonal reductions on handcrafted leather goods while stock lasts.';
    bannerImage = '/src/assets/images/hero_leather_bag_1794844438936.webp';
  } else if (mode === 'category' && !currentCategory) {
    pageTitle = slug ? `${slug.charAt(0).toUpperCase()}${slug.slice(1)}` : 'Collection';
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-[#625D57] mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-[#17130F]">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#17130F] font-medium">{pageTitle}</span>
      </nav>

      {/* Category Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 border border-[#E6E2DC] bg-[#F3F1ED] mb-8 items-stretch">
        <div className="lg:col-span-2 p-6 md:p-10 flex flex-col justify-center">
          <p className="text-sm font-medium text-[#8C5A36] uppercase tracking-wider mb-2">
            Creating Leather Goods
          </p>
          <h1 className="text-[32px] md:text-[44px] font-bold tracking-tight text-[#17130F] mb-3">
            {pageTitle}
          </h1>
          <p className="text-base text-[#625D57] max-w-xl leading-relaxed mb-4">
            {pageDescription}
          </p>
          <p className="text-sm font-medium text-[#17130F] tabular-nums">
            {baseProducts.length} {baseProducts.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        <div className="aspect-[16/9] lg:aspect-auto lg:h-64 border-t lg:border-t-0 lg:border-l border-[#E6E2DC] overflow-hidden">
          <SafeImage
            src={bannerImage}
            alt={pageTitle}
            fallbackTitle={pageTitle}
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Filters & Sorting */}
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        selectedSize={selectedSize}
        onSizeChange={setSelectedSize}
        inStockOnly={inStockOnly}
        onInStockChange={setInStockOnly}
        onSaleOnly={onSaleOnly}
        onSaleOnlyChange={setOnSaleOnly}
        availableColors={availableColors}
        availableSizes={availableSizes}
        totalResults={filteredProducts.length}
        onReset={handleReset}
      />

      {/* Product Grid */}
      <ProductGrid products={filteredProducts} onResetFilters={handleReset} />
    </div>
  );
}
