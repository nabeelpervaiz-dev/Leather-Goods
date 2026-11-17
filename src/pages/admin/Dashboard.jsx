import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { getFriendlyFirebaseError } from '../../services/errorHandler.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import Button from '../../components/common/Button.jsx';

export default function Dashboard() {
  const {
    products,
    categories,
    orders,
    inventoryLogs,
    activityLogs,
    storeSettings,
    isLoading,
    seedCatalog,
  } = useStore();
  const { showToast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const currency = storeSettings.currency || 'PKR';

  const metrics = useMemo(() => {
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const confirmedOrders = orders.filter((o) => o.status === 'Confirmed').length;
    const processingOrders = orders.filter((o) => o.status === 'Processing').length;
    const shippedOrders = orders.filter((o) => o.status === 'Shipped').length;
    const deliveredList = orders.filter((o) => o.status === 'Delivered');
    const deliveredOrders = deliveredList.length;
    const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;
    const lowStockProducts = products.filter(
      (p) => Number(p.stockQuantity) <= 5
    ).length;

    const activeOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalSoldItems = activeOrders.reduce(
      (sum, o) => sum + (o.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0),
      0
    );

    // Revenue strictly from Delivered orders
    const totalRevenue = deliveredList.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );

    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalSoldItems,
      totalRevenue,
      lowStockProducts,
    };
  }, [products, categories, orders]);

  // Real monthly chart computed strictly from Delivered Firestore orders (trailing 6 months)
  const chartSeries = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      months.push({
        key,
        month: label,
        revenue: 0,
        orderCount: 0,
        isCurrent: offset === 0,
      });
    }

    orders
      .filter((o) => o.status === 'Delivered')
      .forEach((order) => {
        const dt = new Date(order.deliveredAt || order.createdAt);
        if (Number.isNaN(dt.getTime())) return;
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        const bucket = months.find((m) => m.key === key);
        if (bucket) {
          bucket.revenue += Number(order.total) || 0;
          bucket.orderCount += 1;
        }
      });

    return months;
  }, [orders]);

  const maxChartRevenue = Math.max(
    ...chartSeries.map((m) => m.revenue),
    10000
  );

  const bestSellers = useMemo(
    () => products.filter((p) => p.isBestSeller).slice(0, 5),
    [products]
  );

  const recentActivities = useMemo(() => {
    const adminEvents = (activityLogs || []).slice(0, 6).map((act) => ({
      id: act.id,
      text: act.description || act.action,
      date: act.createdAt,
    }));
    const orderEvents = orders.slice(0, 4).map((order) => ({
      id: `ord-${order.id}`,
      text: `Order ${order.orderNumber || order.id} (${order.customerName}) — ${order.status}`,
      date: order.createdAt,
    }));
    const stockEvents = inventoryLogs.slice(0, 4).map((log) => ({
      id: `inv-${log.id}`,
      text: `Stock ${log.quantity >= 0 ? `+${log.quantity}` : log.quantity} on ${log.productName} (${log.reason})`,
      date: log.createdAt,
    }));

    return [...adminEvents, ...orderEvents, ...stockEvents]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 7);
  }, [activityLogs, orders, inventoryLogs]);

  const handleSeedCatalog = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      await seedCatalog();
      showToast('Initial leather catalog, categories, and store settings restored.');
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to restore catalog.'), 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AdminLayout
      title="Overview"
      subtitle="Live local store catalog, order metrics, and inventory health"
    >
      <div className="space-y-8">
        {!isLoading && products.length === 0 && categories.length === 0 && (
          <div className="bg-white border border-[#8C5A36] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#17130F]">
                Store Catalog Is Currently Empty
              </h2>
              <p className="text-sm text-[#625D57] mt-1">
                Seed the Creating Leather Goods categories, 12 studio products, and default PKR COD store settings into browser storage.
              </p>
            </div>
            <Button onClick={handleSeedCatalog} disabled={seeding}>
              <Database className="w-4 h-4" />
              <span>{seeding ? 'Restoring...' : 'Restore Initial Catalog'}</span>
            </Button>
          </div>
        )}

        {/* Live Firestore Statistic Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Total Products" value={metrics.totalProducts} />
          <StatCard label="Total Categories" value={metrics.totalCategories} />
          <StatCard label="Total Orders" value={metrics.totalOrders} />
          <StatCard label="Pending" value={metrics.pendingOrders} />
          <StatCard label="Confirmed" value={metrics.confirmedOrders} />
          <StatCard label="Processing" value={metrics.processingOrders} />
          <StatCard label="Shipped" value={metrics.shippedOrders} />
          <StatCard label="Delivered" value={metrics.deliveredOrders} />
          <StatCard label="Cancelled" value={metrics.cancelledOrders} />
          <StatCard label="Total Sold Items" value={metrics.totalSoldItems} />
          <StatCard
            label="Delivered Revenue"
            value={formatPrice(metrics.totalRevenue, currency)}
            helper="Delivered orders only"
          />
          <StatCard
            label="Low Stock Products"
            value={metrics.lowStockProducts}
            helper="5 units or fewer"
            highlight={metrics.lowStockProducts > 0}
          />
        </div>

        {/* Chart & Best Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 bg-white border border-[#E6E2DC] p-6">
            <div className="flex items-baseline justify-between gap-2 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#17130F]">
                  Delivered Revenue (Last 6 Months)
                </h2>
                <p className="text-sm text-[#625D57]">
                  Computed from Delivered orders in {currency}
                </p>
              </div>
            </div>

            <div className="h-56 flex items-end gap-3 sm:gap-5 pt-6 border-b border-[#E6E2DC]">
              {chartSeries.map((bar) => {
                const heightPct =
                  bar.revenue > 0
                    ? Math.max(10, Math.round((bar.revenue / maxChartRevenue) * 100))
                    : 4;
                return (
                  <div
                    key={bar.key}
                    className="flex-1 flex flex-col items-center justify-end h-full gap-2"
                    title={`${bar.month}: ${formatPrice(bar.revenue, currency)} (${bar.orderCount} delivered)`}
                  >
                    <span className="text-sm text-[#625D57] tabular-nums hidden sm:block">
                      {bar.revenue > 0 ? `${Math.round(bar.revenue / 1000)}k` : '0'}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[48px] transition-all ${
                        bar.revenue === 0
                          ? 'bg-[#E6E2DC]'
                          : bar.isCurrent
                          ? 'bg-[#8C5A36]'
                          : 'bg-[#241811]'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 sm:gap-5 pt-3">
              {chartSeries.map((bar) => (
                <div
                  key={bar.key}
                  className="flex-1 text-center text-sm font-medium text-[#625D57]"
                >
                  {bar.month}
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-5 bg-white border border-[#E6E2DC] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#17130F]">
                Best-Selling Products
              </h2>
              <Link
                to="/admin/sales"
                className="text-sm font-medium text-[#8C5A36] hover:underline"
              >
                Manage
              </Link>
            </div>
            {bestSellers.length === 0 ? (
              <p className="text-sm text-[#625D57]">
                No products marked as Best Seller yet.
              </p>
            ) : (
              <div className="divide-y divide-[#E6E2DC]">
                {bestSellers.map((prod) => (
                  <div
                    key={prod.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#17130F] truncate">
                        {prod.name}
                      </p>
                      <p className="text-sm text-[#625D57] tabular-nums">
                        SKU: {prod.sku} · Stock: {prod.stockQuantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[#17130F] tabular-nums shrink-0">
                      {formatPrice(prod.discountPrice || prod.price, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Recent Orders & Latest Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 bg-white border border-[#E6E2DC] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#17130F]">Recent Orders</h2>
              <Link
                to="/admin/orders"
                className="text-sm font-medium text-[#8C5A36] hover:underline"
              >
                View All Orders
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-sm text-[#625D57]">
                No orders placed yet. Orders submitted at checkout appear here in real time.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E6E2DC] text-[#625D57]">
                      <th className="py-2.5 pr-4 font-medium">Order ID</th>
                      <th className="py-2.5 pr-4 font-medium">Customer</th>
                      <th className="py-2.5 pr-4 font-medium">Status</th>
                      <th className="py-2.5 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E2DC]">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td className="py-3 pr-4 font-medium text-[#17130F] tabular-nums">
                          {order.orderNumber || order.id}
                        </td>
                        <td className="py-3 pr-4 text-[#17130F]">
                          {order.customerName}
                        </td>
                        <td className="py-3 pr-4 text-[#625D57]">{order.status}</td>
                        <td className="py-3 text-right font-semibold text-[#17130F] tabular-nums">
                          {formatPrice(order.total, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="lg:col-span-5 bg-white border border-[#E6E2DC] p-6">
            <h2 className="text-lg font-semibold text-[#17130F] mb-4">
              Latest Activities
            </h2>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-[#625D57]">
                Admin updates, order transitions, and stock transactions will log here.
              </p>
            ) : (
              <ul className="divide-y divide-[#E6E2DC] text-sm">
                {recentActivities.map((act) => (
                  <li key={act.id} className="py-3">
                    <p className="text-[#17130F]">{act.text}</p>
                    <p className="text-[#625D57] tabular-nums mt-0.5">
                      {act.date
                        ? new Date(act.date).toLocaleDateString('en-PK', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Just now'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
