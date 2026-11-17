import { useState } from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { calculateDiscountPercentage } from '../../utils/calculateDiscount.js';
import { getFriendlyFirebaseError } from '../../services/errorHandler.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';

export default function Sales() {
  const { products, storeSettings, editProduct } = useStore();
  const { showToast } = useToast();
  const [draftDiscounts, setDraftDiscounts] = useState({});

  const currency = storeSettings.currency || 'PKR';

  const handleApplySale = async (product) => {
    const rawValue =
      draftDiscounts[product.id] !== undefined
        ? draftDiscounts[product.id]
        : product.discountPrice || '';
    const numeric = Number(rawValue);

    if (!numeric || numeric <= 0 || numeric >= Number(product.price)) {
      showToast(
        `Enter a discount price below ${formatPrice(product.price, currency)}.`,
        'error'
      );
      return;
    }

    try {
      await editProduct(product.id, {
        isOnSale: true,
        discountPrice: numeric,
      });
      showToast(`Enabled sale pricing on ${product.name}.`);
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to apply sale price.'), 'error');
    }
  };

  const handleDisableSale = async (product) => {
    try {
      await editProduct(product.id, { isOnSale: false, discountPrice: null });
      showToast(`Removed sale pricing from ${product.name}.`);
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to disable sale.'), 'error');
    }
  };

  const handleToggle = async (product, field, label) => {
    try {
      await editProduct(product.id, { [field]: !product[field] });
      showToast(`${product.name}: ${label} updated.`);
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to update product.'), 'error');
    }
  };

  return (
    <AdminLayout
      title="Sales & Merchandising"
      subtitle="Control markdown prices, featured placements, and best-seller badges"
    >
      <div className="bg-white border border-[#E6E2DC] overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#E6E2DC] bg-[#F3F1ED] text-[#625D57]">
              <th className="py-3 px-4 font-medium">Product</th>
              <th className="py-3 px-4 font-medium">Regular Price</th>
              <th className="py-3 px-4 font-medium">Sale Price ({currency})</th>
              <th className="py-3 px-4 font-medium">Discount</th>
              <th className="py-3 px-4 font-medium">Merchandising</th>
              <th className="py-3 px-4 font-medium text-right">Sale Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E2DC]">
            {products.map((product) => {
              const inputValue =
                draftDiscounts[product.id] !== undefined
                  ? draftDiscounts[product.id]
                  : product.discountPrice || '';
              const pct = calculateDiscountPercentage(
                product.price,
                inputValue
              );

              return (
                <tr key={product.id}>
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#17130F]">{product.name}</p>
                    <p className="text-[#625D57] capitalize">
                      {product.categoryName || product.categoryId}
                    </p>
                  </td>
                  <td className="py-3 px-4 tabular-nums font-medium text-[#17130F]">
                    {formatPrice(product.price, currency)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={inputValue}
                        onChange={(e) =>
                          setDraftDiscounts((prev) => ({
                            ...prev,
                            [product.id]: e.target.value,
                          }))
                        }
                        placeholder="Sale price"
                        className="w-28 px-2.5 py-1.5 bg-[#F3F1ED] border border-[#E6E2DC] text-sm tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplySale(product)}
                        className="px-3 py-1.5 bg-[#241811] text-white text-sm font-medium hover:bg-[#3A281E] cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 tabular-nums font-semibold text-[#B42318]">
                    {pct > 0 ? `-${pct}%` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(product, 'isFeatured', 'Featured')}
                        className={`px-2.5 py-1 border text-sm cursor-pointer ${
                          product.isFeatured
                            ? 'bg-[#241811] text-white border-[#241811]'
                            : 'bg-white text-[#625D57] border-[#E6E2DC]'
                        }`}
                      >
                        Featured
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggle(product, 'isBestSeller', 'Best Seller')
                        }
                        className={`px-2.5 py-1 border text-sm cursor-pointer ${
                          product.isBestSeller
                            ? 'bg-[#8C5A36] text-white border-[#8C5A36]'
                            : 'bg-white text-[#625D57] border-[#E6E2DC]'
                        }`}
                      >
                        Best Seller
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {product.isOnSale ? (
                      <button
                        type="button"
                        onClick={() => handleDisableSale(product)}
                        className="px-3 py-1 border border-[#B42318] text-[#B42318] text-sm font-medium hover:bg-[#FFF5F5] cursor-pointer"
                      >
                        Disable Sale
                      </button>
                    ) : (
                      <span className="text-[#625D57]">Regular Price</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#625D57]">
                  No products available in catalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
