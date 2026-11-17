import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getFriendlyFirebaseError } from '../../services/errorHandler.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';

export default function Inventory() {
  const { products, inventoryLogs, adjustStock } = useStore();
  const { showToast } = useToast();
  const [busyProductId, setBusyProductId] = useState(null);

  const summary = useMemo(() => {
    const outOfStock = products.filter((p) => Number(p.stockQuantity) === 0).length;
    const lowStock = products.filter(
      (p) => Number(p.stockQuantity) > 0 && Number(p.stockQuantity) <= 5
    ).length;
    const totalUnits = products.reduce(
      (sum, p) => sum + (Number(p.stockQuantity) || 0),
      0
    );
    return { outOfStock, lowStock, totalUnits };
  }, [products]);

  const handleAdjust = async (product, delta) => {
    if (busyProductId === product.id) return;
    setBusyProductId(product.id);
    try {
      await adjustStock(
        product.id,
        delta,
        delta > 0 ? 'Manual restock' : 'Manual stock reduction'
      );
      showToast(
        `Adjusted ${product.name} stock (${delta > 0 ? `+${delta}` : delta}).`
      );
    } catch (error) {
      showToast(
        getFriendlyFirebaseError(error, error?.message || 'Stock adjustment failed.'),
        'error'
      );
    } finally {
      setBusyProductId(null);
    }
  };

  return (
    <AdminLayout
      title="Inventory"
      subtitle="Stock thresholds, restocking, and local stock adjustment log"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E6E2DC] p-5">
            <p className="text-sm text-[#625D57]">Total Units Available</p>
            <p className="text-2xl font-bold text-[#17130F] tabular-nums mt-1">
              {summary.totalUnits}
            </p>
          </div>
          <div className="bg-white border border-[#E6E2DC] p-5">
            <p className="text-sm text-[#625D57]">Low Stock Warnings (1–5 units)</p>
            <p className="text-2xl font-bold text-[#8C5A36] tabular-nums mt-1">
              {summary.lowStock}
            </p>
          </div>
          <div className="bg-white border border-[#E6E2DC] p-5">
            <p className="text-sm text-[#625D57]">Out of Stock Products</p>
            <p className="text-2xl font-bold text-[#B42318] tabular-nums mt-1">
              {summary.outOfStock}
            </p>
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-white border border-[#E6E2DC] overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E6E2DC] bg-[#F3F1ED] text-[#625D57]">
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">SKU</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Stock Level</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2DC]">
              {products.map((product) => {
                const qty = Number(product.stockQuantity) || 0;
                const isBusy = busyProductId === product.id;
                const statusText =
                  qty === 0 ? 'Out of Stock' : qty <= 5 ? 'Low Stock' : 'In Stock';
                return (
                  <tr key={product.id}>
                    <td className="py-3 px-4 font-medium text-[#17130F]">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-[#625D57] tabular-nums">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4 capitalize text-[#625D57]">
                      {product.categoryName || product.categoryId}
                    </td>
                    <td className="py-3 px-4 font-semibold tabular-nums text-[#17130F]">
                      {qty}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          qty === 0
                            ? 'text-[#B42318]'
                            : qty <= 5
                            ? 'text-[#8C5A36]'
                            : 'text-[#17130F]'
                        }`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={qty <= 0 || isBusy}
                          onClick={() => handleAdjust(product, -1)}
                          aria-label={`Decrease ${product.name} stock by 1`}
                          className="px-2.5 py-1 border border-[#E6E2DC] bg-white hover:bg-[#F3F1ED] disabled:opacity-40 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                          <span>1</span>
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleAdjust(product, 1)}
                          aria-label={`Increase ${product.name} stock by 1`}
                          className="px-2.5 py-1 border border-[#E6E2DC] bg-white hover:bg-[#F3F1ED] disabled:opacity-40 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>1</span>
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleAdjust(product, 5)}
                          className="px-2.5 py-1 border border-[#241811] bg-[#241811] text-white hover:bg-[#3A281E] disabled:opacity-40 cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
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

        {/* Stock Transaction Log */}
        <div className="bg-white border border-[#E6E2DC] p-6">
          <h2 className="text-lg font-semibold text-[#17130F] mb-3">
            Recent Stock Transactions
          </h2>
          {inventoryLogs.length === 0 ? (
            <p className="text-sm text-[#625D57]">
              No stock transactions logged yet. Adjustments or orders will record here.
            </p>
          ) : (
            <ul className="divide-y divide-[#E6E2DC] text-sm">
              {inventoryLogs.slice(0, 15).map((log) => (
                <li
                  key={log.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-medium text-[#17130F]">
                      {log.productName}
                    </span>{' '}
                    <span className="text-[#625D57]">({log.sku})</span> —{' '}
                    <span className="text-[#625D57]">{log.reason}</span>
                  </div>
                  <div className="tabular-nums text-[#17130F]">
                    <span
                      className={
                        log.quantity < 0 ? 'text-[#B42318] font-semibold' : 'font-semibold'
                      }
                    >
                      {log.quantity >= 0 ? `+${log.quantity}` : log.quantity}
                    </span>{' '}
                    <span className="text-[#625D57]">
                      ({log.previousStock} → {log.newStock})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
