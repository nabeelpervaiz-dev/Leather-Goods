import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as productService from '../services/productService.js';
import * as categoryService from '../services/categoryService.js';
import * as orderService from '../services/orderService.js';
import { STORAGE_KEYS, readStorage, writeStorage } from '../services/storageService.js';
import { initialProducts } from '../data/products.js';
import { initialCategories } from '../data/categories.js';
import { initialOrders } from '../data/orders.js';
import { initialStoreSettings } from '../data/storeSettings.js';

const StoreContext = createContext(null);

function getInitialOrSeed(key, fallback) {
  const stored = readStorage(key, null);
  if (stored !== null) return stored;
  writeStorage(key, fallback);
  return fallback;
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() =>
    getInitialOrSeed(STORAGE_KEYS.PRODUCTS, initialProducts).map(
      productService.normalizeProduct
    )
  );
  const [categories, setCategories] = useState(() => {
    const cats = getInitialOrSeed(STORAGE_KEYS.CATEGORIES, initialCategories).map(
      categoryService.normalizeCategory
    );
    return [...cats].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  });
  const [orders, setOrders] = useState(() =>
    getInitialOrSeed(STORAGE_KEYS.ORDERS, initialOrders)
      .map(orderService.normalizeOrder)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  );
  const [inventoryLogs, setInventoryLogs] = useState(() =>
    readStorage(STORAGE_KEYS.INVENTORY_LOGS, [])
  );
  const [activityLogs, setActivityLogs] = useState(() =>
    readStorage(STORAGE_KEYS.ACTIVITY_LOGS, [])
  );
  const [storeSettings, setStoreSettings] = useState(() => {
    const stored = readStorage(STORAGE_KEYS.SETTINGS, null);
    if (stored && typeof stored === 'object') {
      return orderService.normalizeStoreSettings(stored);
    }
    const normalized = orderService.normalizeStoreSettings(initialStoreSettings);
    writeStorage(STORAGE_KEYS.SETTINGS, normalized);
    return normalized;
  });

  const refreshStoreData = useCallback(async () => {
    const [prods, cats, ords, settings, logs, acts] = await Promise.all([
      productService.getProducts(),
      categoryService.getCategories(),
      orderService.getOrders(),
      orderService.getStoreSettings(),
      productService.getInventoryLogs(),
      productService.getActivityLogs(),
    ]);
    setProducts(prods);
    setCategories(cats);
    setOrders(ords);
    setStoreSettings(settings);
    setInventoryLogs(logs);
    setActivityLogs(acts);
  }, []);

  const addProduct = useCallback(async (input) => {
    const created = await productService.createProduct(input);
    setProducts(await productService.getProducts());
    setInventoryLogs(await productService.getInventoryLogs());
    setActivityLogs(await productService.getActivityLogs());
    return created;
  }, []);

  const editProduct = useCallback(async (id, updates) => {
    const updated = await productService.updateProduct(id, updates);
    setProducts(await productService.getProducts());
    setActivityLogs(await productService.getActivityLogs());
    return updated;
  }, []);

  const removeProduct = useCallback(async (id) => {
    const next = await productService.deleteProduct(id);
    setProducts(next);
    setActivityLogs(await productService.getActivityLogs());
  }, []);

  const adjustStock = useCallback(async (id, delta, reason) => {
    const res = await productService.adjustProductStock(id, delta, reason);
    setProducts(await productService.getProducts());
    setInventoryLogs(await productService.getInventoryLogs());
    setActivityLogs(await productService.getActivityLogs());
    return res;
  }, []);

  const addCategory = useCallback(async (input) => {
    const created = await categoryService.createCategory(input);
    setCategories(await categoryService.getCategories());
    return created;
  }, []);

  const editCategory = useCallback(async (id, updates) => {
    const updated = await categoryService.updateCategory(id, updates);
    setCategories(await categoryService.getCategories());
    return updated;
  }, []);

  const removeCategory = useCallback(async (id) => {
    const next = await categoryService.deleteCategory(id);
    setCategories(next);
  }, []);

  const placeOrder = useCallback(async (orderPayload) => {
    const created = await orderService.createOrder(orderPayload);
    setOrders(await orderService.getOrders());
    return created;
  }, []);

  const changeOrderStatus = useCallback(async (orderId, nextStatus) => {
    const updated = await orderService.updateOrderStatus(orderId, nextStatus);
    const [nextOrders, nextProducts, nextLogs] = await Promise.all([
      orderService.getOrders(),
      productService.getProducts(),
      productService.getInventoryLogs(),
    ]);
    setOrders(nextOrders);
    setProducts(nextProducts);
    setInventoryLogs(nextLogs);
    return updated;
  }, []);

  const saveOrderNotes = useCallback(async (orderId, notes) => {
    const updated = await orderService.updateOrderNotes(orderId, notes);
    setOrders(await orderService.getOrders());
    return updated;
  }, []);

  const saveStoreSettings = useCallback(async (nextSettings) => {
    const saved = await orderService.updateStoreSettings(nextSettings);
    setStoreSettings(saved);
    return saved;
  }, []);

  const seedCatalog = useCallback(async () => {
    await productService.seedInitialCatalog();
    await refreshStoreData();
  }, [refreshStoreData]);

  const value = useMemo(
    () => ({
      products,
      categories,
      orders,
      inventoryLogs,
      activityLogs,
      storeSettings,
      isLoaded: true,
      isLoading: false,
      refreshStoreData,
      addProduct,
      editProduct,
      removeProduct,
      adjustStock,
      addCategory,
      editCategory,
      removeCategory,
      placeOrder,
      changeOrderStatus,
      saveOrderNotes,
      saveStoreSettings,
      seedCatalog,
    }),
    [
      products,
      categories,
      orders,
      inventoryLogs,
      activityLogs,
      storeSettings,
      refreshStoreData,
      addProduct,
      editProduct,
      removeProduct,
      adjustStock,
      addCategory,
      editCategory,
      removeCategory,
      placeOrder,
      changeOrderStatus,
      saveOrderNotes,
      saveStoreSettings,
      seedCatalog,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return ctx;
}
