import { initialCategories } from '../data/categories.js';
import { STORAGE_KEYS, readStorage, writeStorage } from './storageService.js';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function normalizeCategory(raw) {
  if (!raw) return null;
  const image =
    raw.image || raw.imageUrl || '/src/assets/images/hero_leather_bag_1794844438936.webp';
  const enabled =
    typeof raw.enabled === 'boolean' ? raw.enabled : raw.isActive !== false;
  return {
    ...raw,
    image,
    imageUrl: image,
    enabled,
    isActive: enabled,
  };
}

export async function getCategories() {
  const stored = readStorage(STORAGE_KEYS.CATEGORIES, null);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored
      .map(normalizeCategory)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }
  writeStorage(STORAGE_KEYS.CATEGORIES, initialCategories);
  return initialCategories.map(normalizeCategory);
}

export async function createCategory(categoryInput) {
  const categories = await getCategories();
  const image =
    categoryInput.image ||
    categoryInput.imageUrl ||
    '/src/assets/images/hero_leather_bag_1794844438936.webp';
  const enabled =
    typeof categoryInput.enabled === 'boolean'
      ? categoryInput.enabled
      : categoryInput.isActive !== false;

  const nextCategory = normalizeCategory({
    id: categoryInput.id || `cat-${Date.now()}`,
    name: categoryInput.name.trim(),
    slug: slugify(categoryInput.slug || categoryInput.name),
    description: String(categoryInput.description || '').trim(),
    image,
    enabled,
    displayOrder: categories.length + 1,
  });
  const updated = [...categories, nextCategory];
  writeStorage(STORAGE_KEYS.CATEGORIES, updated);
  return nextCategory;
}

export async function updateCategory(categoryId, updates) {
  const categories = await getCategories();
  const updated = categories.map((cat) => {
    if (cat.id !== categoryId) return cat;
    const nextImage = updates.image || updates.imageUrl || cat.image;
    const nextEnabled =
      typeof updates.enabled === 'boolean'
        ? updates.enabled
        : typeof updates.isActive === 'boolean'
        ? updates.isActive
        : cat.enabled;
    return normalizeCategory({
      ...cat,
      ...updates,
      slug: updates.slug ? slugify(updates.slug) : cat.slug,
      image: nextImage,
      enabled: nextEnabled,
    });
  });
  writeStorage(STORAGE_KEYS.CATEGORIES, updated);
  return updated.find((c) => c.id === categoryId) || null;
}

export async function deleteCategory(categoryId) {
  const categories = await getCategories();
  const updated = categories.filter((c) => c.id !== categoryId);
  writeStorage(STORAGE_KEYS.CATEGORIES, updated);
  return updated;
}
