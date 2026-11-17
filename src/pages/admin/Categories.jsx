import { useEffect, useRef, useState } from 'react';
import { Edit2, Plus, Trash2, Upload } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  STUDIO_ASSET_OPTIONS,
  createTemporaryImagePreview,
  isTemporaryPreviewUrl,
  revokeTemporaryImagePreview,
  validateExternalImageUrl,
} from '../../services/storageService.js';
import { getFriendlyFirebaseError } from '../../services/errorHandler.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import SafeImage from '../../components/common/SafeImage.jsx';

export default function Categories() {
  const {
    categories,
    products,
    isLoading,
    addCategory,
    editCategory,
    removeCategory,
  } = useStore();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(STUDIO_ASSET_OPTIONS[0].url);
  const [imageStoragePath, setImageStoragePath] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const previewUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => revokeTemporaryImagePreview(url));
    };
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setTargetCategoryId(`cat-${Date.now()}`);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl(STUDIO_ASSET_OPTIONS[0].url);
    setImageStoragePath('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setTargetCategoryId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImageUrl(cat.imageUrl || cat.image || STUDIO_ASSET_OPTIONS[0].url);
    setImageStoragePath(cat.imageStoragePath || '');
    setIsActive(cat.isActive !== false);
    setModalOpen(true);
  };

  const handleLocalPreview = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const preview = createTemporaryImagePreview(file);
      previewUrlsRef.current.push(preview.url);
      setImageUrl(preview.url);
      setImageStoragePath('');
      showToast(
        'Loaded temporary local preview. Paste an HTTPS image URL or pick a Studio Asset before saving.'
      );
    } catch (error) {
      showToast(error?.message || 'Unable to preview image.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    const urlValidation = validateExternalImageUrl(imageUrl);
    if (!urlValidation.valid) {
      showToast(urlValidation.error, 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await editCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || name.trim(),
          description: description.trim(),
          imageUrl: urlValidation.url,
          imageStoragePath,
          isActive,
        });
        showToast(`Updated category ${name}.`);
      } else {
        await addCategory({
          id: targetCategoryId,
          name: name.trim(),
          slug: slug.trim() || name.trim(),
          description: description.trim(),
          imageUrl: urlValidation.url,
          imageStoragePath,
          isActive,
        });
        showToast(`Created category ${name}.`);
      }
      setModalOpen(false);
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to save category.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (cat) => {
    const nextActive = cat.isActive === false;
    try {
      await editCategory(cat.id, { isActive: nextActive });
      showToast(`${cat.name} ${nextActive ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to update category.'), 'error');
    }
  };

  const handleDelete = async (cat) => {
    try {
      await removeCategory(cat.id);
      showToast(`Deleted category ${cat.name}.`);
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to delete category.'), 'error');
    }
  };

  const isTempPreview = isTemporaryPreviewUrl(imageUrl);

  return (
    <AdminLayout
      title="Categories"
      subtitle="Organize product categories, studio photography, and storefront visibility"
      action={
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      }
    >
      {isLoading ? (
        <div className="bg-white border border-[#E6E2DC] p-10 text-center text-sm text-[#625D57]">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-[#E6E2DC] p-10 text-center text-sm text-[#625D57]">
          No categories found. Add a category or seed the initial catalog from the Overview page.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const count = products.filter(
              (p) => (p.categoryId || p.category) === cat.slug
            ).length;
            const active = cat.isActive !== false;
            return (
              <div
                key={cat.id}
                className="bg-white border border-[#E6E2DC] flex flex-col sm:flex-row overflow-hidden"
              >
                <div className="sm:w-44 aspect-[4/3] sm:aspect-auto bg-[#F3F1ED] border-b sm:border-b-0 sm:border-r border-[#E6E2DC] shrink-0">
                  <SafeImage
                    src={cat.imageUrl || cat.image}
                    alt={cat.name}
                    fallbackTitle={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h2 className="text-lg font-semibold text-[#17130F]">
                        {cat.name}
                      </h2>
                      <span className="text-sm text-[#625D57] tabular-nums">
                        {count} products
                      </span>
                    </div>
                    <p className="text-sm text-[#625D57] line-clamp-2 mb-2">
                      {cat.description}
                    </p>
                    <p className="text-sm text-[#625D57]">
                      Slug: <code>/{cat.slug}</code>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E6E2DC]">
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(cat)}
                      className={`px-3 py-1 border text-sm font-medium cursor-pointer ${
                        active
                          ? 'border-[#17130F] text-[#17130F] bg-white'
                          : 'border-[#E6E2DC] text-[#625D57] bg-[#F3F1ED]'
                      }`}
                    >
                      {active ? 'Enabled' : 'Disabled'}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        aria-label={`Edit ${cat.name}`}
                        className="p-2 text-[#17130F] hover:text-[#8C5A36] cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        aria-label={`Delete ${cat.name}`}
                        className="p-2 text-[#625D57] hover:text-[#B42318] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? `Edit ${editingCategory.name}` : 'Add Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. belts"
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#17130F] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
            />
          </div>

          <div className="bg-[#F3F1ED] border border-[#E6E2DC] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-sm font-semibold text-[#17130F] block">
                  Category Image
                </span>
                <span className="text-xs text-[#625D57]">
                  Select a Studio Asset or paste an https:// image URL.
                </span>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#17130F] text-sm font-medium cursor-pointer shrink-0">
                <Upload className="w-4 h-4" />
                <span>Preview Local File</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLocalPreview}
                  className="sr-only"
                />
              </label>
            </div>

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageStoragePath('');
              }}
              placeholder="https://... or /src/assets/images/..."
              className="w-full px-3 py-2 bg-white border border-[#E6E2DC] text-sm text-[#17130F]"
            />

            <select
              value={STUDIO_ASSET_OPTIONS.some((o) => o.url === imageUrl) ? imageUrl : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setImageUrl(e.target.value);
                  setImageStoragePath('');
                }
              }}
              className="w-full px-3 py-2 bg-white border border-[#E6E2DC] text-sm text-[#17130F]"
            >
              <option value="">Select a studio asset...</option>
              {STUDIO_ASSET_OPTIONS.map((opt) => (
                <option key={opt.url} value={opt.url}>
                  {opt.label}
                </option>
              ))}
            </select>

            {isTempPreview && (
              <p className="text-xs text-[#8C5A36]">
                Temporary local preview active — choose a Studio Asset or paste an https:// image URL before saving.
              </p>
            )}

            <div className="w-48 aspect-[4/3] bg-white border border-[#E6E2DC] overflow-hidden">
              <SafeImage
                src={imageUrl}
                alt="Category preview"
                fallbackTitle={name || 'Category'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#17130F] cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-[#241811]"
            />
            <span>Enabled on Storefront</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E6E2DC]">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
