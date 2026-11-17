import { useState } from 'react';
import { ImagePlus, Star, Trash2, Upload } from 'lucide-react';
import {
  STUDIO_ASSET_OPTIONS,
  createValidatedImagePreview,
} from '../../services/storageService.js';
import { useStore } from '../../context/StoreContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import SafeImage from '../common/SafeImage.jsx';
import Button from '../common/Button.jsx';

export default function ProductForm({ initialData = null, onSubmit, onCancel }) {
  const { categories } = useStore();
  const { showToast } = useToast();

  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(
    initialData?.category || categories[0]?.slug || 'shoes'
  );
  const [sku, setSku] = useState(initialData?.sku || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [material, setMaterial] = useState(initialData?.material || '');
  const [specsText, setSpecsText] = useState(
    (initialData?.specifications || []).join('\n')
  );
  const [originalPrice, setOriginalPrice] = useState(
    initialData?.originalPrice ?? ''
  );
  const [discountPrice, setDiscountPrice] = useState(
    initialData?.discountPrice ?? ''
  );
  const [stock, setStock] = useState(initialData?.stock ?? 10);
  const [sizesText, setSizesText] = useState((initialData?.sizes || []).join(', '));
  const [colorsText, setColorsText] = useState(
    (initialData?.colors || []).join(', ')
  );
  const [images, setImages] = useState(initialData?.images || []);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(
    initialData?.primaryImageIndex || 0
  );
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [isBestSeller, setIsBestSeller] = useState(
    Boolean(initialData?.isBestSeller)
  );
  const [isOnSale, setIsOnSale] = useState(Boolean(initialData?.isOnSale));
  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished !== false
  );
  const [selectedStudioAsset, setSelectedStudioAsset] = useState(
    STUDIO_ASSET_OPTIONS[0].url
  );
  const [saving, setSaving] = useState(false);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 4 - images.length;
    if (remainingSlots <= 0) {
      showToast('Maximum of 4 product images allowed.', 'error');
      return;
    }

    const added = [];
    for (const file of files.slice(0, remainingSlots)) {
      const result = createValidatedImagePreview(file);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        added.push(result.url);
      }
    }

    if (added.length > 0) {
      setImages((prev) => [...prev, ...added]);
    }
    e.target.value = '';
  };

  const handleAddStudioAsset = () => {
    if (images.length >= 4) {
      showToast('Maximum of 4 product images allowed.', 'error');
      return;
    }
    if (images.includes(selectedStudioAsset)) {
      showToast('This studio image is already attached.', 'error');
      return;
    }
    setImages((prev) => [...prev, selectedStudioAsset]);
  };

  const handleRemoveImage = (idx) => {
    const nextImages = images.filter((_, i) => i !== idx);
    setImages(nextImages);
    if (primaryImageIndex === idx) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > idx) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !originalPrice) {
      showToast('Product name, SKU, and original price are required.', 'error');
      return;
    }
    if (
      isOnSale &&
      (!discountPrice || Number(discountPrice) >= Number(originalPrice))
    ) {
      showToast(
        'Discount price must be lower than original price when On Sale is enabled.',
        'error'
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        sku: sku.trim().toUpperCase(),
        description: description.trim(),
        material: material.trim(),
        specifications: specsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        originalPrice: Number(originalPrice),
        discountPrice: isOnSale ? Number(discountPrice) : null,
        stock: Math.max(0, Number(stock) || 0),
        sizes: sizesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        colors: colorsText
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        images:
          images.length > 0
            ? images
            : ['/src/assets/images/hero_leather_bag_1794844438936.webp'],
        primaryImageIndex:
          primaryImageIndex < images.length ? primaryImageIndex : 0,
        isFeatured,
        isBestSeller,
        isOnSale,
        isPublished,
      };
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#17130F] mb-1">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lahore Cap-Toe Oxford"
            className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#17130F] mb-1">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#17130F] mb-1">
            SKU *
          </label>
          <input
            type="text"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="CLG-SH-004"
            className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#17130F] mb-1">
            Original Price (PKR) *
          </label>
          <input
            type="number"
            min="1"
            required
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F] tabular-nums"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#17130F] mb-1">
            Discount Price (PKR)
          </label>
          <input
            type="number"
            min="0"
            disabled={!isOnSale}
            value={discountPrice}
            onChange={(e) => setDiscountPrice(e.target.value)}
            placeholder={isOnSale ? 'Enter sale price' : 'Enable On Sale below'}
            className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F] disabled:opacity-50 tabular-nums"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#17130F] mb-1">
            Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F] tabular-nums"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#17130F] mb-1">
            Material
          </label>
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Full-grain vegetable-tanned cowhide"
            className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#17130F] mb-1">
            Available Sizes (comma-separated)
          </label>
          <input
            type="text"
            value={sizesText}
            onChange={(e) => setSizesText(e.target.value)}
            placeholder="40, 41, 42, 43 or S, M, L, XL"
            className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#17130F] mb-1">
            Available Colors (comma-separated)
          </label>
          <input
            type="text"
            value={colorsText}
            onChange={(e) => setColorsText(e.target.value)}
            placeholder="Espresso, Cognac, Black"
            className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
          />
        </div>

        <div className="sm:col-span-2">
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

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#17130F] mb-1">
            Specifications (one per line)
          </label>
          <textarea
            rows={3}
            value={specsText}
            onChange={(e) => setSpecsText(e.target.value)}
            placeholder="360° Goodyear welt construction&#10;Solid brass hardware"
            className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
          />
        </div>
      </div>

      {/* Up to 4 Product Images */}
      <div className="border border-[#E6E2DC] bg-[#F3F1ED] p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[#17130F]">
              Product Images ({images.length}/4)
            </p>
            <p className="text-sm text-[#625D57]">
              Uses browser object URLs for local previews (JPG, PNG, WebP up to 5 MB). Firebase Storage will replace this later.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#17130F] text-sm font-medium text-[#17130F] hover:bg-[#E8DCCB] cursor-pointer shrink-0">
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
        </div>

        {/* Studio Asset Selector */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            aria-label="Choose studio photograph"
            value={selectedStudioAsset}
            onChange={(e) => setSelectedStudioAsset(e.target.value)}
            className="flex-1 px-3 py-2 bg-white border border-[#E6E2DC] text-sm text-[#17130F]"
          >
            {STUDIO_ASSET_OPTIONS.map((opt) => (
              <option key={opt.url} value={opt.url}>
                Studio Asset: {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddStudioAsset}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#241811] text-white text-sm font-medium hover:bg-[#3A281E] cursor-pointer whitespace-nowrap"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Attach Studio Photo</span>
          </button>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={`${img}-${idx}`}
                className={`bg-white border p-2 flex flex-col gap-2 ${
                  idx === primaryImageIndex
                    ? 'border-[#17130F] ring-1 ring-[#17130F]'
                    : 'border-[#E6E2DC]'
                }`}
              >
                <div className="aspect-[4/3] bg-[#F3F1ED] overflow-hidden">
                  <SafeImage
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    fallbackTitle={`Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => setPrimaryImageIndex(idx)}
                    className={`inline-flex items-center gap-1 text-sm font-medium cursor-pointer ${
                      idx === primaryImageIndex ? 'text-[#8C5A36]' : 'text-[#625D57] hover:text-[#17130F]'
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        idx === primaryImageIndex ? 'fill-[#8C5A36]' : ''
                      }`}
                    />
                    <span>{idx === primaryImageIndex ? 'Primary' : 'Set Primary'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    aria-label="Remove image"
                    className="p-1 text-[#625D57] hover:text-[#B42318] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flags */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="flex items-center gap-2 border border-[#E6E2DC] p-3 text-sm text-[#17130F] cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="accent-[#241811]"
          />
          <span>Published</span>
        </label>
        <label className="flex items-center gap-2 border border-[#E6E2DC] p-3 text-sm text-[#17130F] cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="accent-[#241811]"
          />
          <span>Featured</span>
        </label>
        <label className="flex items-center gap-2 border border-[#E6E2DC] p-3 text-sm text-[#17130F] cursor-pointer">
          <input
            type="checkbox"
            checked={isBestSeller}
            onChange={(e) => setIsBestSeller(e.target.checked)}
            className="accent-[#241811]"
          />
          <span>Best Seller</span>
        </label>
        <label className="flex items-center gap-2 border border-[#E6E2DC] p-3 text-sm text-[#17130F] cursor-pointer">
          <input
            type="checkbox"
            checked={isOnSale}
            onChange={(e) => setIsOnSale(e.target.checked)}
            className="accent-[#B42318]"
          />
          <span>On Sale</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6E2DC]">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
