import { initialOrders } from '../data/orders.js';
import { initialStoreSettings } from '../data/storeSettings.js';
import { STORAGE_KEYS, readStorage, writeStorage } from './storageService.js';
import { getProducts, normalizeProduct } from './productService.js';

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const RESERVED_STATUSES = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
const SESSION_ORDER_CACHE_KEY = 'clg_submitted_orders_v1';

function readSessionOrderCache() {
  try {
    const raw = sessionStorage.getItem(SESSION_ORDER_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSessionOrderCache(idempotencyKey, orderData) {
  if (!idempotencyKey) return;
  try {
    const cache = readSessionOrderCache();
    cache[idempotencyKey] = orderData;
    sessionStorage.setItem(SESSION_ORDER_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore sessionStorage errors
  }
}

export function normalizeOrder(raw) {
  if (!raw) return null;
  const customer = raw.customer || {};
  const customerName = raw.customerName || customer.fullName || '';
  const phone = raw.phone || customer.phone || '';
  const alternatePhone = raw.alternatePhone || customer.whatsapp || phone;
  const city = raw.city || customer.city || '';
  const area = raw.area || customer.area || '';
  const address = raw.address || customer.address || '';
  const notes = raw.notes || customer.notes || '';
  const stockReserved =
    typeof raw.stockReserved === 'boolean' ? raw.stockReserved : Boolean(raw.stockDeducted);

  return {
    ...raw,
    orderNumber: raw.orderNumber || raw.id,
    customerName,
    phone,
    alternatePhone,
    city,
    area,
    address,
    notes,
    customer: {
      fullName: customerName,
      phone,
      whatsapp: alternatePhone,
      city,
      area,
      address,
      notes,
    },
    stockReserved,
    stockDeducted: stockReserved,
  };
}

export async function getOrders() {
  const stored = readStorage(STORAGE_KEYS.ORDERS, null);
  const list = Array.isArray(stored) ? stored : initialOrders;
  if (!Array.isArray(stored)) {
    writeStorage(STORAGE_KEYS.ORDERS, initialOrders);
  }
  return list
    .map(normalizeOrder)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function createOrder({ customer, items, idempotencyKey }) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new Error('Shopping bag is empty or exceeds the maximum item limit.');
  }

  const customerName = String(customer?.fullName || '').trim().slice(0, 120);
  const phone = String(customer?.phone || '').trim().slice(0, 30);
  const alternatePhone = String(customer?.whatsapp || customer?.phone || '')
    .trim()
    .slice(0, 30);
  const city = String(customer?.city || '').trim().slice(0, 80);
  const area = String(customer?.area || '').trim().slice(0, 120);
  const address = String(customer?.address || '').trim().slice(0, 500);
  const notes = String(customer?.notes || '').trim().slice(0, 500);

  if (
    customerName.length < 2 ||
    phone.length < 7 ||
    city.length < 2 ||
    area.length < 2 ||
    address.length < 5
  ) {
    throw new Error('Complete customer delivery details are required.');
  }

  if (idempotencyKey) {
    const cached = readSessionOrderCache()[idempotencyKey];
    if (cached) {
      return cached;
    }
  }

  const products = await getProducts(true);
  const productMap = new Map(products.map((p) => [p.id, p]));
  const requestedByProduct = new Map();
  const resolvedItems = [];
  let subtotal = 0;

  for (const rawItem of items) {
    const pid = String(rawItem.productId || '').trim();
    const product = productMap.get(pid);
    if (!product || !product.isPublished) {
      throw new Error(`Product "${rawItem.name || pid}" is no longer available.`);
    }

    const qty = Math.trunc(Number(rawItem.quantity));
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      throw new Error(`Invalid quantity for "${product.name}".`);
    }

    const totalRequested = (requestedByProduct.get(pid) || 0) + qty;
    requestedByProduct.set(pid, totalRequested);

    if (product.stock <= 0) {
      throw new Error(`"${product.name}" is currently out of stock.`);
    }
    if (product.stock < totalRequested) {
      throw new Error(`"${product.name}" only has ${product.stock} unit(s) available right now.`);
    }

    const unitPrice =
      product.isOnSale &&
      product.discountPrice != null &&
      Number(product.discountPrice) < Number(product.originalPrice)
        ? Number(product.discountPrice)
        : Number(product.originalPrice);

    const totalPrice = unitPrice * qty;
    subtotal += totalPrice;

    resolvedItems.push({
      productId: pid,
      name: product.name,
      productName: product.name,
      sku: product.sku || '',
      size: rawItem.size || rawItem.selectedSize || null,
      selectedSize: rawItem.size || rawItem.selectedSize || null,
      color: rawItem.color || rawItem.selectedColor || null,
      selectedColor: rawItem.color || rawItem.selectedColor || null,
      unitPrice,
      quantity: qty,
      totalPrice,
    });
  }

  const settings = await getStoreSettings();
  const baseFee = Number(settings.deliveryCharge ?? settings.deliveryFee ?? 250);
  const freeThreshold = Number(settings.freeDeliveryThreshold ?? 15000);
  const deliveryFee =
    freeThreshold > 0 && subtotal >= freeThreshold ? 0 : Math.max(0, baseFee);
  const total = subtotal + deliveryFee;

  const year = new Date().getFullYear();
  const randDigits = Math.floor(100 + Math.random() * 900);
  const orderId = `ORD-${year}-${randDigits}-${String(Date.now()).slice(-3)}`;
  const nowIso = new Date().toISOString();

  const createdOrder = normalizeOrder({
    id: orderId,
    orderNumber: orderId,
    customer: {
      fullName: customerName,
      phone,
      whatsapp: alternatePhone,
      city,
      area,
      address,
      notes,
    },
    items: resolvedItems,
    subtotal,
    deliveryFee,
    total,
    paymentMethod: 'Cash on Delivery',
    status: 'Pending',
    internalNotes: '',
    stockReserved: false,
    stockDeducted: false,
    whatsappStatus: 'Not opened',
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  const existingOrders = await getOrders();
  writeStorage(STORAGE_KEYS.ORDERS, [createdOrder, ...existingOrders]);

  if (idempotencyKey) {
    writeSessionOrderCache(idempotencyKey, createdOrder);
  }

  return createdOrder;
}

export async function updateOrderStatus(orderId, nextStatus, internalNotes) {
  const orders = await getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  const prevReserved = Boolean(order.stockReserved);
  const shouldReserve = RESERVED_STATUSES.includes(nextStatus);
  const products = await getProducts(true);
  const logs = readStorage(STORAGE_KEYS.INVENTORY_LOGS, []);
  const newLogs = [];
  let nextProducts = [...products];
  let nextReserved = prevReserved;

  if (prevReserved && !shouldReserve) {
    for (const item of order.items || []) {
      const target = nextProducts.find((p) => p.id === item.productId);
      if (!target) continue;
      const prevStock = Number(target.stock) || 0;
      const newStock = prevStock + item.quantity;
      nextProducts = nextProducts.map((p) =>
        p.id === target.id
          ? normalizeProduct({ ...p, stock: newStock, updatedAt: new Date().toISOString() })
          : p
      );
      newLogs.push({
        id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        productId: target.id,
        productName: item.productName || item.name || target.name,
        sku: item.sku || target.sku || '',
        orderId: order.id,
        quantity: item.quantity,
        previousStock: prevStock,
        newStock,
        reason: `Order ${order.orderNumber} marked ${nextStatus}`,
        createdAt: new Date().toISOString(),
      });
    }
    nextReserved = false;
  } else if (!prevReserved && shouldReserve) {
    for (const item of order.items || []) {
      const target = nextProducts.find((p) => p.id === item.productId);
      if (!target) continue;
      const prevStock = Number(target.stock) || 0;
      if (prevStock < item.quantity) {
        throw new Error(
          `Insufficient stock to confirm "${item.productName || item.name}" (available: ${prevStock}, required: ${item.quantity}).`
        );
      }
    }
    for (const item of order.items || []) {
      const target = nextProducts.find((p) => p.id === item.productId);
      if (!target) continue;
      const prevStock = Number(target.stock) || 0;
      const newStock = prevStock - item.quantity;
      nextProducts = nextProducts.map((p) =>
        p.id === target.id
          ? normalizeProduct({ ...p, stock: newStock, updatedAt: new Date().toISOString() })
          : p
      );
      newLogs.push({
        id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        productId: target.id,
        productName: item.productName || item.name || target.name,
        sku: item.sku || target.sku || '',
        orderId: order.id,
        quantity: -item.quantity,
        previousStock: prevStock,
        newStock,
        reason: `Order ${order.orderNumber} marked ${nextStatus}`,
        createdAt: new Date().toISOString(),
      });
    }
    nextReserved = true;
  }

  if (newLogs.length > 0) {
    writeStorage(STORAGE_KEYS.PRODUCTS, nextProducts);
    writeStorage(STORAGE_KEYS.INVENTORY_LOGS, [
      ...newLogs,
      ...(Array.isArray(logs) ? logs : []),
    ]);
  }

  let updatedOrder = null;
  const nextOrders = orders.map((o) => {
    if (o.id !== orderId) return o;
    updatedOrder = normalizeOrder({
      ...o,
      status: nextStatus,
      stockReserved: nextReserved,
      stockDeducted: nextReserved,
      ...(typeof internalNotes === 'string'
        ? { internalNotes: internalNotes.slice(0, 1000) }
        : {}),
      ...(nextStatus === 'Delivered' && o.status !== 'Delivered'
        ? { deliveredAt: new Date().toISOString() }
        : {}),
      updatedAt: new Date().toISOString(),
    });
    return updatedOrder;
  });

  writeStorage(STORAGE_KEYS.ORDERS, nextOrders);
  return updatedOrder;
}

export async function updateOrderNotes(orderId, internalNotes) {
  const orders = await getOrders();
  let updatedOrder = null;
  const nextOrders = orders.map((o) => {
    if (o.id !== orderId) return o;
    updatedOrder = normalizeOrder({
      ...o,
      internalNotes: String(internalNotes || '').slice(0, 1000),
      updatedAt: new Date().toISOString(),
    });
    return updatedOrder;
  });
  writeStorage(STORAGE_KEYS.ORDERS, nextOrders);
  return updatedOrder;
}

export function normalizeStoreSettings(raw) {
  const merged = { ...initialStoreSettings, ...(raw || {}) };
  const logoText = merged.logoText || merged.logo || initialStoreSettings.logoText;
  const contactPhone =
    merged.contactPhone || merged.contactNumber || initialStoreSettings.contactPhone;
  const deliveryCharge = Number(
    merged.deliveryCharge ?? merged.deliveryFee ?? initialStoreSettings.deliveryCharge
  );
  return {
    ...merged,
    logoText,
    logo: logoText,
    contactPhone,
    contactNumber: contactPhone,
    deliveryCharge,
    deliveryFee: deliveryCharge,
    bannerUrl:
      merged.bannerUrl || '/src/assets/images/workshop_craftsmanship_1794844438224.webp',
  };
}

export async function getStoreSettings() {
  const stored = readStorage(STORAGE_KEYS.SETTINGS, null);
  if (!stored || typeof stored !== 'object') {
    const normalized = normalizeStoreSettings(initialStoreSettings);
    writeStorage(STORAGE_KEYS.SETTINGS, normalized);
    return normalized;
  }
  return normalizeStoreSettings(stored);
}

export async function updateStoreSettings(nextSettings) {
  const prev = await getStoreSettings();
  const normalized = normalizeStoreSettings({
    ...prev,
    ...nextSettings,
    logoText:
      nextSettings.logoText ?? nextSettings.logo ?? prev.logoText,
    contactPhone:
      nextSettings.contactPhone ?? nextSettings.contactNumber ?? prev.contactPhone,
    deliveryCharge: Math.max(
      0,
      Number(nextSettings.deliveryCharge ?? nextSettings.deliveryFee ?? prev.deliveryCharge)
    ),
    freeDeliveryThreshold: Math.max(
      0,
      Number(nextSettings.freeDeliveryThreshold ?? prev.freeDeliveryThreshold)
    ),
    updatedAt: new Date().toISOString(),
  });
  writeStorage(STORAGE_KEYS.SETTINGS, normalized);
  return normalized;
}
