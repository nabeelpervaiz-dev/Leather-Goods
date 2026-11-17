import ProductCard from './ProductCard.jsx';

export default function ProductGrid({
  products = [],
  isLoading = false,
  emptyTitle = 'No leather goods match your selection',
  emptyDescription = 'Try clearing your active filters or browsing another category.',
  onResetFilters,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex flex-col animate-pulse">
            <div className="aspect-[4/3] bg-[#F3F1ED] border border-[#E6E2DC]" />
            <div className="pt-3 space-y-2">
              <div className="h-4 bg-[#F3F1ED] w-3/4" />
              <div className="h-3.5 bg-[#F3F1ED] w-1/2" />
              <div className="h-4 bg-[#F3F1ED] w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="border border-[#E6E2DC] bg-[#F3F1ED] py-16 px-6 text-center">
        <h3 className="text-lg font-semibold text-[#17130F] mb-2">{emptyTitle}</h3>
        <p className="text-base text-[#625D57] max-w-md mx-auto mb-6">
          {emptyDescription}
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-6 py-2.5 bg-[#241811] text-white text-sm font-medium hover:bg-[#3A281E] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
