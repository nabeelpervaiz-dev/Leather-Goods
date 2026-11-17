import { Search, SlidersHorizontal, X } from 'lucide-react';

const PRICE_RANGES = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-5000', label: 'Under PKR 5,000' },
  { value: '5000-15000', label: 'PKR 5,000 – 15,000' },
  { value: '15000-30000', label: 'PKR 15,000 – 30,000' },
  { value: 'over-30000', label: 'Above PKR 30,000' },
];

export default function ProductFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  selectedColor,
  onColorChange,
  selectedSize,
  onSizeChange,
  inStockOnly,
  onInStockChange,
  onSaleOnly,
  onSaleOnlyChange,
  availableColors = [],
  availableSizes = [],
  totalResults = 0,
  onReset,
}) {
  const hasActiveFilters =
    Boolean(search) ||
    priceRange !== 'all' ||
    selectedColor !== 'all' ||
    selectedSize !== 'all' ||
    inStockOnly ||
    onSaleOnly;

  return (
    <div className="border-y border-[#E6E2DC] py-5 mb-8 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#625D57] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, material, or color..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F] placeholder:text-[#625D57] focus:outline-none focus:border-[#17130F]"
          />
        </div>

        {/* Result Count & Sort */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4">
          <span className="text-sm text-[#625D57] tabular-nums">
            {totalResults} {totalResults === 1 ? 'product' : 'products'}
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="catalog-sort" className="text-sm text-[#625D57] whitespace-nowrap">
              Sort by
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-white border border-[#E6E2DC] px-3 py-2 text-sm font-medium text-[#17130F] focus:outline-none focus:border-[#17130F] cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="best-sellers">Best Sellers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#17130F] mr-1">
          <SlidersHorizontal className="w-4 h-4 text-[#8C5A36]" />
          Filters
        </span>

        {/* Price Range */}
        <select
          aria-label="Filter by price range"
          value={priceRange}
          onChange={(e) => onPriceRangeChange(e.target.value)}
          className="bg-white border border-[#E6E2DC] px-3 py-2 text-sm text-[#17130F] focus:outline-none focus:border-[#17130F] cursor-pointer"
        >
          {PRICE_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>

        {/* Color Filter */}
        {availableColors.length > 0 && (
          <select
            aria-label="Filter by color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="bg-white border border-[#E6E2DC] px-3 py-2 text-sm text-[#17130F] focus:outline-none focus:border-[#17130F] cursor-pointer"
          >
            <option value="all">All Colors</option>
            {availableColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        )}

        {/* Size Filter */}
        {availableSizes.length > 0 && (
          <select
            aria-label="Filter by size"
            value={selectedSize}
            onChange={(e) => onSizeChange(e.target.value)}
            className="bg-white border border-[#E6E2DC] px-3 py-2 text-sm text-[#17130F] focus:outline-none focus:border-[#17130F] cursor-pointer"
          >
            <option value="all">All Sizes</option>
            {availableSizes.map((size) => (
              <option key={size} value={size}>
                Size {size}
              </option>
            ))}
          </select>
        )}

        {/* Availability Toggle */}
        <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#E6E2DC] bg-white text-sm text-[#17130F] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="accent-[#241811] w-4 h-4"
          />
          <span>In Stock</span>
        </label>

        {/* On Sale Toggle */}
        <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#E6E2DC] bg-white text-sm text-[#17130F] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(e) => onSaleOnlyChange(e.target.checked)}
            className="accent-[#B42318] w-4 h-4"
          />
          <span>On Sale</span>
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#B42318] hover:underline cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
