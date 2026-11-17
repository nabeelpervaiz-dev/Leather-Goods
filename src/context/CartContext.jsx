import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS, readStorage, writeStorage } from '../services/storageService.js';
import { getEffectivePrice } from '../utils/calculateDiscount.js';
import { useStore } from './StoreContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);

function makeItemKey(productId, size, color) {
  return `${productId}__${size || 'nosize'}__${color || 'nocolor'}`;
}

export function CartProvider({ children }) {
  const { products, storeSettings } = useStore();
  const { showToast } = useToast();

  const [items, setItems] = useState(() => readStorage(STORAGE_KEYS.CART, []));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.CART, items);
  }, [items]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const addToCart = useCallback(
    (product, { size = null, color = null, quantity = 1, openBag = true } = {}) => {
      if (!product || !product.isPublished) {
        showToast('This product is currently unavailable.', 'error');
        return false;
      }
      const liveProduct = products.find((p) => p.id === product.id) || product;
      const availableStock = Number(liveProduct.stock) || 0;

      if (availableStock <= 0) {
        showToast('This item is currently out of stock.', 'error');
        return false;
      }

      const resolvedSize =
        size || (liveProduct.sizes?.length === 1 ? liveProduct.sizes[0] : null);
      const resolvedColor =
        color || (liveProduct.colors?.length > 0 ? liveProduct.colors[0] : null);

      const itemKey = makeItemKey(liveProduct.id, resolvedSize, resolvedColor);
      const primaryImage =
        liveProduct.images?.[liveProduct.primaryImageIndex || 0] ||
        liveProduct.images?.[0] ||
        '';
      const unitPrice = getEffectivePrice(liveProduct);

      let addedSuccessfully = true;

      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.key === itemKey);
        const totalForProductAcrossVariants = prev
          .filter((i) => i.productId === liveProduct.id)
          .reduce((sum, i) => sum + i.quantity, 0);

        if (totalForProductAcrossVariants + quantity > availableStock) {
          addedSuccessfully = false;
          return prev;
        }

        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + quantity,
            unitPrice,
            maxStock: availableStock,
          };
          return next;
        }

        return [
          ...prev,
          {
            key: itemKey,
            productId: liveProduct.id,
            slug: liveProduct.slug,
            name: liveProduct.name,
            sku: liveProduct.sku,
            image: primaryImage,
            size: resolvedSize,
            color: resolvedColor,
            quantity,
            unitPrice,
            maxStock: availableStock,
            availableSizes: liveProduct.sizes || [],
            availableColors: liveProduct.colors || [],
          },
        ];
      });

      if (!addedSuccessfully) {
        showToast(`Only ${availableStock} left in stock for ${liveProduct.name}.`, 'error');
        return false;
      }

      showToast(`${liveProduct.name} added to your bag.`);
      if (openBag) {
        setIsDrawerOpen(true);
      }
      return true;
    },
    [products, showToast]
  );

  const removeFromCart = useCallback((itemKey) => {
    setItems((prev) => prev.filter((item) => item.key !== itemKey));
  }, []);

  const updateQuantity = useCallback(
    (itemKey, nextQty) => {
      const targetQty = Number(nextQty);
      if (targetQty <= 0) {
        removeFromCart(itemKey);
        return;
      }

      setItems((prev) => {
        const targetItem = prev.find((i) => i.key === itemKey);
        if (!targetItem) return prev;
        const liveProduct = products.find((p) => p.id === targetItem.productId);
        const availableStock = liveProduct ? Number(liveProduct.stock) : targetItem.maxStock;
        const otherVariantsQty = prev
          .filter((i) => i.productId === targetItem.productId && i.key !== itemKey)
          .reduce((sum, i) => sum + i.quantity, 0);

        if (otherVariantsQty + targetQty > availableStock) {
          showToast(`Maximum stock (${availableStock}) reached for ${targetItem.name}.`, 'error');
          return prev;
        }

        return prev.map((item) =>
          item.key === itemKey
            ? { ...item, quantity: targetQty, maxStock: availableStock }
            : item
        );
      });
    },
    [products, removeFromCart, showToast]
  );

  const updateVariant = useCallback((itemKey, { size, color }) => {
    setItems((prev) => {
      const target = prev.find((i) => i.key === itemKey);
      if (!target) return prev;
      const nextSize = size !== undefined ? size : target.size;
      const nextColor = color !== undefined ? color : target.color;
      const nextKey = makeItemKey(target.productId, nextSize, nextColor);

      if (nextKey === itemKey) return prev;

      const duplicate = prev.find((i) => i.key === nextKey);
      if (duplicate) {
        return prev
          .filter((i) => i.key !== itemKey)
          .map((i) =>
            i.key === nextKey ? { ...i, quantity: i.quantity + target.quantity } : i
          );
      }

      return prev.map((i) =>
        i.key === itemKey
          ? { ...i, key: nextKey, size: nextSize, color: nextColor }
          : i
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const deliveryFee = useMemo(() => {
    if (items.length === 0) return 0;
    const threshold = Number(storeSettings.freeDeliveryThreshold) || 0;
    if (threshold > 0 && subtotal >= threshold) return 0;
    return Number(storeSettings.deliveryCharge) || 0;
  }, [items.length, subtotal, storeSettings]);

  const total = subtotal + deliveryFee;

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      deliveryFee,
      total,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateVariant,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      deliveryFee,
      total,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateVariant,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return ctx;
}
