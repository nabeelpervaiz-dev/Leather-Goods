import { initialProducts } from '../data/products.js';
import { initialCategories } from '../data/categories.js';
import { initialOrders } from '../data/orders.js';
import { initialStoreSettings } from '../data/storeSettings.js';
import { STORAGE_KEYS, readStorage, writeStorage } from './storageService.js';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function appendActivityLog(action, description, targetId = null) {
  const logs = readStorage(STORAGE_KEYS.ACTIVITY_LOGS, []);
  const next = [
    {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action,
      description,
      targetId,
      createdAt: new Date().toISOString(),
    },
    ...(Array.isArray(logs) ? logs : []),
  ].slice(0, 60);
  writeStorage(STORAGE_KEYS.ACTIVITY_LOGS, next);
}

export function normalizeProduct(raw) {
  if (!raw) return null;
  const originalPrice = Number(raw.originalPrice ?? raw.price ?? 0);
  const stock = Math.max(0, Math.trunc(Number(raw.stock ?? raw.stockQuantity ?? 0)));
  const category = raw.category || raw.categoryId || 'shoes';
  const isPublished =
    typeof raw.isPublished === 'boolean'
      ? raw.isPublished
      : raw.isActive !== false && raw.status !== 'draft';

  return {
    ...raw,
    category,
    categoryId: category,
    originalPrice,
    price: originalPrice,
    stock,
    stockQuantity: stock,
    isPublished,
    isActive: isPublished,
    status: isPublished ? 'published' : 'draft',
  };
}

export async function getProducts(includeDrafts = true) {
  const stored = readStorage(STORAGE_KEYS.PRODUCTS, null);
  const list = Array.isArray(stored) ? stored : initialProducts;
  if (!Array.isArray(stored)) {
    writeStorage(STORAGE_KEYS.PRODUCTS, initialProducts);
  }
  const normalized = list.map(normalizeProduct);
  return includeDrafts ? normalized : normalized.filter((p) => p.isPublished);
}

export async function getProductById(idOrSlug) {
  const products = await getProducts(true);
  return products.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export async function createProduct(productInput) {
  const products = await getProducts(true);
  const productId = productInput.id || `prod-${Date.now()}`;
  const originalPrice = Number(productInput.originalPrice ?? productInput.price ?? 0);
  const stock = Math.max(0, Math.trunc(Number(productInput.stock ?? productInput.stockQuantity ?? 0)));
  const isOnSale = Boolean(productInput.isOnSale);
  const discountPrice =
    isOnSale && productInput.discountPrice ? Number(productInput.discountPrice) : null;
  const category = productInput.category || productInput.categoryId || 'shoes';
  const isPublished =
    typeof productInput.isPublished === 'boolean'
      ? productInput.isPublished
      : productInput.isActive !== false && productInput.status !== 'draft';

  const newProduct = normalizeProduct({
    id: productId,
    name: String(productInput.name || '').trim(),
    slug: slugify(productInput.name) || productId,
    category,
    sku: String(productInput.sku || '').trim().toUpperCase(),
    description: String(productInput.description || '').trim(),
    material: String(productInput.material || '').trim(),
    specifications: Array.isArray(productInput.specifications) ? productInput.specifications : [],
    originalPrice,
    discountPrice,
    isOnSale,
    isFeatured: Boolean(productInput.isFeatured),
    isBestSeller: Boolean(productInput.isBestSeller),
    isPublished,
    stock,
    sizes: Array.isArray(productInput.sizes) ? productInput.sizes : [],
    colors: Array.isArray(productInput.colors) ? productInput.colors : [],
    images: (productInput.images || []).slice(0, 4),
    primaryImageIndex: Number(productInput.primaryImageIndex) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.PRODUCTS, [newProduct, ...products]);

  if (stock > 0) {
    const logs = readStorage(STORAGE_KEYS.INVENTORY_LOGS, []);
    writeStorage(STORAGE_KEYS.INVENTORY_LOGS, [
      {
        id: `inv-${Date.now()}`,
        productId,
        productName: newProduct.name,
        sku: newProduct.sku,
        quantity: stock,
        previousStock: 0,
        newStock: stock,
        reason: 'Initial product stock',
        createdAt: new Date().toISOString(),
      },
      ...(Array.isArray(logs) ? logs : []),
    ]);
  }

  appendActivityLog('PRODUCT_CREATED', `Created product ${newProduct.name} (${newProduct.sku})`, productId);
  return newProduct;
}

export async function updateProduct(productId, updates) {
  const products = await getProducts(true);
  let updatedProduct = null;

  const nextProducts = products.map((prev) => {
    if (prev.id !== productId) return prev;

    const nextOriginalPrice =
      updates.originalPrice !== undefined || updates.price !== undefined
        ? Number(updates.originalPrice ?? updates.price)
        : prev.originalPrice;

    const nextIsOnSale =
      typeof updates.isOnSale === 'boolean' ? updates.isOnSale : prev.isOnSale;

    const nextStock =
      updates.stock !== undefined || updates.stockQuantity !== undefined
        ? Math.max(0, Math.trunc(Number(updates.stock ?? updates.stockQuantity ?? 0)))
        : prev.stock;

    const nextPublished =
      typeof updates.isPublished === 'boolean'
        ? updates.isPublished
        : typeof updates.isActive === 'boolean'
        ? updates.isActive
        : updates.status !== undefined
        ? updates.status !== 'draft'
        : prev.isPublished;

    updatedProduct = normalizeProduct({
      ...prev,
      ...updates,
      slug: updates.name ? slugify(updates.name) : prev.slug,
      category: updates.category || updates.categoryId || prev.category,
      originalPrice: nextOriginalPrice,
      discountPrice: nextIsOnSale
        ? updates.discountPrice !== undefined
          ? Number(updates.discountPrice) || null
          : prev.discountPrice
        : null,
      stock: nextStock,
      isOnSale: nextIsOnSale,
      isPublished: nextPublished,
      updatedAt: new Date().toISOString(),
    });
    return updatedProduct;
  });

  if (!updatedProduct) {
    throw new Error('Product not found.');
  }

  writeStorage(STORAGE_KEYS.PRODUCTS, nextProducts);
  appendActivityLog('PRODUCT_UPDATED', `Updated product ${updatedProduct.name}`, productId);
  return updatedProduct;
}

export async function deleteProduct(productId) {
  const products = await getProducts(true);
  const target = products.find((p) => p.id === productId);
  const next = products.filter((p) => p.id !== productId);
  writeStorage(STORAGE_KEYS.PRODUCTS, next);
  if (target) {
    appendActivityLog('PRODUCT_DELETED', `Deleted product ${target.name}`, productId);
  }
  return next;
}

export async function adjustProductStock(productId, delta, reason = 'Manual adjustment') {
  const numericDelta = Math.trunc(Number(delta) || 0);
  if (numericDelta === 0) return null;

  const products = await getProducts(true);
  const target = products.find((p) => p.id === productId);
  if (!target) {
    throw new Error('Product not found.');
  }

  const previousStock = Number(target.stock) || 0;
  const newStock = previousStock + numericDelta;
  if (newStock < 0) {
    throw new Error('Stock quantity cannot become negative.');
  }

  const nextProducts = products.map((p) =>
    p.id === productId
      ? normalizeProduct({ ...p, stock: newStock, updatedAt: new Date().toISOString() })
      : p
  );
  writeStorage(STORAGE_KEYS.PRODUCTS, nextProducts);

  const logs = readStorage(STORAGE_KEYS.INVENTORY_LOGS, []);
  writeStorage(STORAGE_KEYS.INVENTORY_LOGS, [
    {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      productId,
      productName: target.name,
      sku: target.sku || '',
      quantity: numericDelta,
      previousStock,
      newStock,
      reason,
      createdAt: new Date().toISOString(),
    },
    ...(Array.isArray(logs) ? logs : []),
  ]);

  appendActivityLog(
    'INVENTORY_ADJUSTED',
    `Adjusted ${target.name} stock (${numericDelta > 0 ? `+${numericDelta}` : numericDelta}) — ${reason}`,
    productId
  );

  return { previousStock, newStock };
}

export async function getInventoryLogs(maxItems = 50) {
  const logs = readStorage(STORAGE_KEYS.INVENTORY_LOGS, []);
  return Array.isArray(logs) ? logs.slice(0, maxItems) : [];
}

export async function getActivityLogs(maxItems = 50) {
  const logs = readStorage(STORAGE_KEYS.ACTIVITY_LOGS, []);
  return Array.isArray(logs) ? logs.slice(0, maxItems) : [];
}

export async function seedInitialCatalog() {
  writeStorage(STORAGE_KEYS.CATEGORIES, initialCategories);
  writeStorage(STORAGE_KEYS.PRODUCTS, initialProducts);
  writeStorage(STORAGE_KEYS.ORDERS, initialOrders);
  writeStorage(STORAGE_KEYS.SETTINGS, initialStoreSettings);
  appendActivityLog(
    'CATALOG_SEEDED',
    `Restored ${initialCategories.length} categories, ${initialProducts.length} products, and default store settings`,
    'seed'
  );
}
