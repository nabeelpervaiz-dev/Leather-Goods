import { useMemo, useState } from 'react';
import { Copy, Eye, MessageSquare, Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { ORDER_STATUSES } from '../../services/orderService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { buildCustomerWhatsAppContactUrl } from '../../utils/generateOrderMessage.js';
import { getFriendlyFirebaseError } from '../../services/errorHandler.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';

export default function Orders() {
  const {
    orders,
    storeSettings,
    changeOrderStatus,
    saveOrderNotes,
  } = useStore();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const currency = storeSettings.currency || 'PKR';

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();

    return orders.filter((order) => {
      if (statusFilter !== 'All' && order.status !== statusFilter) return false;

      if (dateFilter !== 'all') {
        const orderTime = new Date(order.createdAt).getTime();
        if (dateFilter === 'today') {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          if (orderTime < startOfDay.getTime()) return false;
        } else if (dateFilter === '7d') {
          if (now - orderTime > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (dateFilter === '30d') {
          if (now - orderTime > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      if (q) {
        const hay = [
          order.orderNumber,
          order.id,
          order.customerName,
          order.phone,
          order.alternatePhone,
          order.city,
          ...(order.items || []).map((i) => i.productName || i.name),
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, dateFilter]);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      const updated = await changeOrderStatus(orderId, nextStatus);
      if (selectedOrder?.id === orderId && updated) {
        setSelectedOrder(updated);
      }
      showToast(`Order updated to ${nextStatus}.`);
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to update order status.'), 'error');
    }
  };

  const handleCopyPhone = async (phone) => {
    try {
      await navigator.clipboard.writeText(phone);
      showToast(`Copied ${phone}`);
    } catch {
      showToast('Could not copy phone number.', 'error');
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setNotesDraft(order.internalNotes || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder || savingNotes) return;
    setSavingNotes(true);
    try {
      const updated = await saveOrderNotes(selectedOrder.id, notesDraft);
      if (updated) {
        setSelectedOrder(updated);
      }
      showToast(`Saved internal notes for ${selectedOrder.orderNumber || selectedOrder.id}.`);
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to save internal notes.'), 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <AdminLayout
      title="Orders"
      subtitle="Cash on Delivery orders, status transitions, and customer WhatsApp contact"
    >
      <div className="space-y-6">
        {/* Search, Date Filter & Status Tabs */}
        <div className="bg-white border border-[#E6E2DC] p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#625D57] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Order ID, customer, phone, or city..."
                className="w-full pl-10 pr-4 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F] focus:outline-none focus:border-[#17130F]"
              />
            </div>

            <select
              aria-label="Filter orders by date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3.5 py-2 bg-white border border-[#E6E2DC] text-sm text-[#17130F]"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['All', ...ORDER_STATUSES].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 text-sm font-medium border transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#241811] text-white border-[#241811]'
                    : 'bg-white text-[#625D57] border-[#E6E2DC] hover:text-[#17130F]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-[#E6E2DC] overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E6E2DC] bg-[#F3F1ED] text-[#625D57]">
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Phone</th>
                <th className="py-3 px-4 font-medium">Products</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2DC]">
              {filteredOrders.map((order) => {
                const displayId = order.orderNumber || order.id;
                const contactPhone = order.alternatePhone || order.phone;
                return (
                  <tr key={order.id} className="hover:bg-[#F3F1ED]/50">
                    <td className="py-3 px-4 font-semibold text-[#17130F] tabular-nums whitespace-nowrap">
                      {displayId}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#17130F]">
                        {order.customerName}
                      </p>
                      <p className="text-[#625D57]">{order.city}</p>
                    </td>
                    <td className="py-3 px-4 tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{order.phone}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(order.phone)}
                          aria-label={`Copy ${order.phone}`}
                          className="p-1 text-[#625D57] hover:text-[#17130F] cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <p className="truncate text-[#17130F]">
                        {(order.items || [])
                          .map((i) => `${i.quantity}× ${i.productName || i.name}`)
                          .join(', ')}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#17130F] tabular-nums whitespace-nowrap">
                      {formatPrice(order.total, currency)}
                    </td>
                    <td className="py-3 px-4 text-[#625D57] tabular-nums whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-[#625D57] whitespace-nowrap">
                      {order.paymentMethod || 'COD'}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        aria-label={`Status for ${displayId}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-2.5 py-1 border text-sm font-medium bg-white cursor-pointer ${
                          order.status === 'Cancelled'
                            ? 'border-[#B42318] text-[#B42318]'
                            : order.status === 'Pending'
                            ? 'border-[#8C5A36] text-[#8C5A36]'
                            : 'border-[#17130F] text-[#17130F]'
                        }`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openDetails(order)}
                        aria-label={`View details for ${displayId}`}
                        className="p-2 text-[#17130F] hover:text-[#8C5A36] cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={buildCustomerWhatsAppContactUrl(contactPhone, displayId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Contact ${order.customerName} on WhatsApp`}
                        className="inline-flex p-2 text-[#8C5A36] hover:text-[#17130F]"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#625D57]">
                    No orders match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={
          selectedOrder
            ? `Order ${selectedOrder.orderNumber || selectedOrder.id}`
            : 'Order Details'
        }
        maxWidth="max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F3F1ED] border border-[#E6E2DC] p-4">
              <div className="space-y-1">
                <p className="font-semibold text-[#17130F]">Customer</p>
                <p>{selectedOrder.customerName}</p>
                <p className="tabular-nums">Phone: {selectedOrder.phone}</p>
                <p className="tabular-nums">
                  WhatsApp: {selectedOrder.alternatePhone || selectedOrder.phone}
                </p>
                <p className="text-[#625D57]">
                  Stock Reserved:{' '}
                  {selectedOrder.stockReserved
                    ? 'Yes (deducted)'
                    : selectedOrder.status === 'Pending'
                    ? 'Not yet (deducts when Confirmed)'
                    : 'Released'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[#17130F]">Delivery Address</p>
                <p>
                  {selectedOrder.area}, {selectedOrder.city}
                </p>
                <p className="text-[#625D57]">{selectedOrder.address}</p>
                {selectedOrder.notes && (
                  <p className="text-[#8C5A36]">
                    Customer note: {selectedOrder.notes}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="font-semibold text-[#17130F] mb-2">Line Items</p>
              <div className="border border-[#E6E2DC] divide-y divide-[#E6E2DC]">
                {(selectedOrder.items || []).map((item, idx) => {
                  const lineTotal =
                    item.totalPrice !== undefined
                      ? item.totalPrice
                      : (item.unitPrice || 0) * (item.quantity || 1);
                  return (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="p-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-medium text-[#17130F]">
                          {item.productName || item.name}
                        </p>
                        <p className="text-[#625D57]">
                          {[
                            item.selectedColor || item.color,
                            item.selectedSize || item.size
                              ? `Size ${item.selectedSize || item.size}`
                              : null,
                            `Qty ${item.quantity}`,
                            item.sku,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <span className="font-semibold text-[#17130F] tabular-nums">
                        {formatPrice(lineTotal, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E6E2DC] pt-4">
              <div className="space-y-1 tabular-nums">
                <p className="text-[#625D57]">
                  Subtotal: {formatPrice(selectedOrder.subtotal, currency)} · Delivery:{' '}
                  {selectedOrder.deliveryFee === 0
                    ? 'Free'
                    : formatPrice(selectedOrder.deliveryFee, currency)}
                </p>
                <p className="text-base font-bold text-[#17130F]">
                  Total: {formatPrice(selectedOrder.total, currency)} (
                  {selectedOrder.paymentMethod || 'Cash on Delivery'})
                </p>
              </div>
              <a
                href={buildCustomerWhatsAppContactUrl(
                  selectedOrder.alternatePhone || selectedOrder.phone,
                  selectedOrder.orderNumber || selectedOrder.id
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#241811] text-white font-medium hover:bg-[#3A281E]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Customer</span>
              </a>
            </div>

            <div className="border-t border-[#E6E2DC] pt-4 space-y-2">
              <label className="block font-semibold text-[#17130F]">
                Internal Admin Notes
              </label>
              <textarea
                rows={3}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Courier tracking ID, confirmation notes..."
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveNotes} disabled={savingNotes}>
                  {savingNotes ? 'Saving...' : 'Save Internal Notes'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
