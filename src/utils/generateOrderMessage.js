import { formatPrice } from './formatPrice.js';

export function generateOrderMessage(order, currency = 'PKR') {
  const orderRef = order.orderNumber || order.id;
  const customerName = order.customerName || order.customer?.fullName || '';
  const phone = order.phone || order.customer?.phone || '';
  const alternatePhone = order.alternatePhone || order.customer?.whatsapp || phone;
  const city = order.city || order.customer?.city || '';
  const area = order.area || order.customer?.area || '';
  const address = order.address || order.customer?.address || '';
  const notes = order.notes || order.customer?.notes || '';

  const lines = [
    'NEW ORDER',
    '',
    `Order ID: ${orderRef}`,
    '',
    `Customer: ${customerName}`,
    `Phone: ${phone}`,
    `WhatsApp: ${alternatePhone}`,
    `City: ${city}`,
    `Area: ${area}`,
    `Address: ${address}`,
  ];

  if (notes) {
    lines.push(`Notes: ${notes}`);
  }

  lines.push('', 'ORDER ITEMS:', '');

  (order.items || []).forEach((item, index) => {
    const itemName = item.productName || item.name;
    const size = item.selectedSize || item.size;
    const color = item.selectedColor || item.color;
    const lineTotal =
      item.totalPrice !== undefined
        ? item.totalPrice
        : (item.unitPrice || 0) * (item.quantity || 1);

    lines.push(`${index + 1}. ${itemName}`);
    if (size) {
      lines.push(`   Size: ${size}`);
    }
    if (color) {
      lines.push(`   Color: ${color}`);
    }
    lines.push(`   Quantity: ${item.quantity}`);
    lines.push(`   Price: ${formatPrice(lineTotal, currency)}`);
    lines.push('');
  });

  lines.push(`Subtotal: ${formatPrice(order.subtotal, currency)}`);
  lines.push(
    `Delivery: ${order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee, currency)}`
  );
  lines.push(`Total: ${formatPrice(order.total, currency)}`);
  lines.push('');
  lines.push(`Payment: ${order.paymentMethod || 'Cash on Delivery'}`);

  return lines.join('\n');
}

export function buildWhatsAppOrderUrl(whatsappNumber, order, currency = 'PKR') {
  const cleanedPhone = String(whatsappNumber || '923001234567').replace(/[^\d]/g, '');
  const message = generateOrderMessage(order, currency);
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
}

export function buildCustomerWhatsAppContactUrl(customerPhone, orderRef) {
  let cleaned = String(customerPhone || '').replace(/[^\d]/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = `92${cleaned.slice(1)}`;
  }
  const message = `Assalam-o-Alaikum, we are contacting you from Creating Leather Goods regarding your order ${orderRef}.`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
