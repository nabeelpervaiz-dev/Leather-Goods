export const STORAGE_KEYS = {
  PRODUCTS: 'clg_products_v1',
  CATEGORIES: 'clg_categories_v1',
  ORDERS: 'clg_orders_v1',
  SETTINGS: 'clg_settings_v1',
  CART: 'clg_cart_v1',
  ADMIN_SESSION: 'clg_admin_session_v1',
  INVENTORY_LOGS: 'clg_inventory_logs_v1',
  ACTIVITY_LOGS: 'clg_activity_logs_v1',
};

export const STUDIO_ASSET_OPTIONS = [
  { label: 'Oxford Shoes (Espresso)', url: '/src/assets/images/shoe_oxford_espresso_1794844438979.webp' },
  { label: 'Oxford Welt Detail', url: '/src/assets/images/shoe_oxford_detail_1794844438944.webp' },
  { label: 'Penny Loafer (Cognac)', url: '/src/assets/images/shoe_loafer_cognac_1794844439598.webp' },
  { label: 'Chelsea Boot (Black)', url: '/src/assets/images/shoe_chelsea_black_1794844440011.webp' },
  { label: 'Cafe Racer Jacket', url: '/src/assets/images/jacket_racer_espresso_1794844440857.webp' },
  { label: 'Flight Bomber Jacket', url: '/src/assets/images/jacket_bomber_cognac_1794844440707.webp' },
  { label: 'Jacket Collar & Zip Detail', url: '/src/assets/images/jacket_collar_detail_1794844441541.webp' },
  { label: 'Bifold Wallet (Cognac)', url: '/src/assets/images/wallet_bifold_cognac_1794844441528.webp' },
  { label: 'Pocket Cardholder (Black)', url: '/src/assets/images/wallet_cardholder_black_1794844442221.webp' },
  { label: 'Wallet Interior Slots', url: '/src/assets/images/wallet_open_interior_1794844442823.webp' },
  { label: 'Executive Briefcase', url: '/src/assets/images/bag_briefcase_espresso_1794844443031.webp' },
  { label: 'Weekender Duffle', url: '/src/assets/images/hero_leather_bag_1794844438936.webp' },
  { label: 'Bag Hardware & Suede Detail', url: '/src/assets/images/bag_tote_detail_1794844443746.webp' },
  { label: 'Workshop Craftsmanship Banner', url: '/src/assets/images/workshop_craftsmanship_1794844438224.webp' },
];

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage removal errors
  }
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function createValidatedImagePreview(file) {
  if (!file) {
    return { error: 'No file selected.' };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: 'Only JPG, PNG, and WebP images are supported.' };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { error: 'Image file size must be 5 MB or smaller.' };
  }
  const previewUrl = URL.createObjectURL(file);
  return {
    url: previewUrl,
    fileName: file.name,
    isObjectUrl: true,
    error: null,
  };
}

export function createTemporaryImagePreview(file) {
  const result = createValidatedImagePreview(file);
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
}

export function isTemporaryPreviewUrl(url) {
  return typeof url === 'string' && url.startsWith('blob:');
}

export function revokeTemporaryImagePreview(url) {
  if (isTemporaryPreviewUrl(url)) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore revoke failures
    }
  }
}

export function validateExternalImageUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Please provide a category or banner image URL.' };
  }
  if (trimmed.startsWith('/src/assets/images/') || trimmed.startsWith('https://')) {
    return { valid: true, url: trimmed };
  }
  if (isTemporaryPreviewUrl(trimmed)) {
    return {
      valid: false,
      error: 'Please select a Studio Asset or enter an https:// URL before saving.',
    };
  }
  return {
    valid: false,
    error: 'Image URL must be an https:// address or a Studio Asset path.',
  };
}
