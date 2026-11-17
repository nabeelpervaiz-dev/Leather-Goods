import { useEffect, useRef, useState } from 'react';
import { Database, Upload } from 'lucide-react';
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
import Button from '../../components/common/Button.jsx';
import SafeImage from '../../components/common/SafeImage.jsx';

export default function Settings() {
  const { storeSettings, saveStoreSettings, seedCatalog } = useStore();
  const { showToast } = useToast();

  const [formState, setFormState] = useState({
    storeName: storeSettings.storeName || '',
    logo: storeSettings.logo || '',
    logoStoragePath: storeSettings.logoStoragePath || '',
    bannerUrl: storeSettings.bannerUrl || '',
    bannerStoragePath: storeSettings.bannerStoragePath || '',
    whatsappNumber: storeSettings.whatsappNumber || '',
    contactNumber: storeSettings.contactNumber || '',
    email: storeSettings.email || '',
    address: storeSettings.address || '',
    deliveryFee: storeSettings.deliveryFee ?? 250,
    freeDeliveryThreshold: storeSettings.freeDeliveryThreshold ?? 15000,
    currency: storeSettings.currency || 'PKR',
    instagram: storeSettings.socialLinks?.instagram || '',
    facebook: storeSettings.socialLinks?.facebook || '',
    tiktok: storeSettings.socialLinks?.tiktok || '',
  });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const previewUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => revokeTemporaryImagePreview(url));
    };
  }, []);

  useEffect(() => {
    setFormState({
      storeName: storeSettings.storeName || '',
      logo: storeSettings.logo || '',
      logoStoragePath: storeSettings.logoStoragePath || '',
      bannerUrl: storeSettings.bannerUrl || '',
      bannerStoragePath: storeSettings.bannerStoragePath || '',
      whatsappNumber: storeSettings.whatsappNumber || '',
      contactNumber: storeSettings.contactNumber || '',
      email: storeSettings.email || '',
      address: storeSettings.address || '',
      deliveryFee: storeSettings.deliveryFee ?? 250,
      freeDeliveryThreshold: storeSettings.freeDeliveryThreshold ?? 15000,
      currency: storeSettings.currency || 'PKR',
      instagram: storeSettings.socialLinks?.instagram || '',
      facebook: storeSettings.socialLinks?.facebook || '',
      tiktok: storeSettings.socialLinks?.tiktok || '',
    });
  }, [storeSettings]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalBannerPreview = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const preview = createTemporaryImagePreview(file);
      previewUrlsRef.current.push(preview.url);
      setFormState((prev) => ({
        ...prev,
        bannerUrl: preview.url,
        bannerStoragePath: '',
      }));
      showToast(
        'Loaded temporary local banner preview. Use an HTTPS URL or Studio Asset before saving.'
      );
    } catch (error) {
      showToast(error?.message || 'Unable to preview banner.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formState.bannerUrl.trim()) {
      const urlCheck = validateExternalImageUrl(formState.bannerUrl);
      if (!urlCheck.valid) {
        showToast(urlCheck.error, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      await saveStoreSettings({
        storeName: formState.storeName.trim(),
        logo: formState.logo.trim(),
        logoStoragePath: formState.logoStoragePath,
        bannerUrl: formState.bannerUrl.trim(),
        bannerStoragePath: formState.bannerStoragePath,
        whatsappNumber: formState.whatsappNumber.trim(),
        contactNumber: formState.contactNumber.trim(),
        email: formState.email.trim(),
        address: formState.address.trim(),
        deliveryFee: Number(formState.deliveryFee) || 0,
        freeDeliveryThreshold: Number(formState.freeDeliveryThreshold) || 0,
        currency: formState.currency.trim() || 'PKR',
        socialLinks: {
          instagram: formState.instagram.trim(),
          facebook: formState.facebook.trim(),
          tiktok: formState.tiktok.trim(),
        },
      });
      showToast('Store settings saved locally.');
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to save store settings.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedCatalog = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      await seedCatalog();
      showToast('Catalog, categories, and store settings restored.');
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to restore catalog.'), 'error');
    } finally {
      setSeeding(false);
    }
  };

  const isTempBannerPreview = isTemporaryPreviewUrl(formState.bannerUrl);

  return (
    <AdminLayout
      title="Store Settings"
      subtitle="Configure brand details, WhatsApp number, COD delivery fees, and store media"
    >
      <div className="max-w-3xl space-y-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E6E2DC] p-6 md:p-8 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                value={formState.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Header Wordmark / Logo Text
              </label>
              <input
                type="text"
                value={formState.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Order WhatsApp Number (International digits)
              </label>
              <input
                type="text"
                value={formState.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="923001234567"
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F] tabular-nums"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Customer Support Phone
              </label>
              <input
                type="text"
                value={formState.contactNumber}
                onChange={(e) => handleChange('contactNumber', e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F] tabular-nums"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Store Email
              </label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Currency Code
              </label>
              <input
                type="text"
                value={formState.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Standard COD Delivery Charge ({formState.currency})
              </label>
              <input
                type="number"
                min="0"
                value={formState.deliveryFee}
                onChange={(e) => handleChange('deliveryFee', e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F] tabular-nums"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Free Delivery Threshold ({formState.currency})
              </label>
              <input
                type="number"
                min="0"
                value={formState.freeDeliveryThreshold}
                onChange={(e) =>
                  handleChange('freeDeliveryThreshold', e.target.value)
                }
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F] tabular-nums"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Atelier Address
              </label>
              <input
                type="text"
                value={formState.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
            </div>

            {/* Store Workshop / Banner Image (Spark-compatible) */}
            <div className="sm:col-span-2 bg-[#F3F1ED] border border-[#E6E2DC] p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#17130F]">
                    Craftsmanship / Promotional Banner Image
                  </p>
                  <p className="text-xs text-[#625D57]">
                    Choose a Studio Asset or enter an external https:// image URL. Local file previews are browser-only.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#17130F] text-sm font-medium cursor-pointer shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>Preview Local File</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLocalBannerPreview}
                    className="sr-only"
                  />
                </label>
              </div>

              <input
                type="text"
                value={formState.bannerUrl}
                onChange={(e) => {
                  handleChange('bannerUrl', e.target.value);
                  handleChange('bannerStoragePath', '');
                }}
                placeholder="https://... or /src/assets/images/..."
                className="w-full px-3 py-2 bg-white border border-[#E6E2DC] text-sm text-[#17130F]"
              />

              <select
                aria-label="Choose studio banner asset"
                value={
                  STUDIO_ASSET_OPTIONS.some((o) => o.url === formState.bannerUrl)
                    ? formState.bannerUrl
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value) {
                    handleChange('bannerUrl', e.target.value);
                    handleChange('bannerStoragePath', '');
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

              {isTempBannerPreview && (
                <p className="text-xs text-[#8C5A36]">
                  Temporary local preview active — select a Studio Asset or paste an https:// URL before saving.
                </p>
              )}

              {formState.bannerUrl && (
                <div className="w-64 aspect-[16/9] bg-white border border-[#E6E2DC] overflow-hidden">
                  <SafeImage
                    src={formState.bannerUrl}
                    alt="Store banner preview"
                    fallbackTitle="Store Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Instagram URL
              </label>
              <input
                type="url"
                value={formState.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                Facebook URL
              </label>
              <input
                type="url"
                value={formState.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#17130F] mb-1.5">
                TikTok URL
              </label>
              <input
                type="url"
                value={formState.tiktok}
                onChange={(e) => handleChange('tiktok', e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E2DC] flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Store Settings'}
            </Button>
          </div>
        </form>

        <div className="bg-white border border-[#E6E2DC] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#17130F]">
              Initialize or Restore Seed Catalog
            </h2>
            <p className="text-sm text-[#625D57] mt-0.5">
              Restores browser storage with the 4 core leather categories, 12 studio products, and default store settings.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleSeedCatalog}
            disabled={seeding}
          >
            <Database className="w-4 h-4" />
            <span>{seeding ? 'Seeding...' : 'Seed Catalog'}</span>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
