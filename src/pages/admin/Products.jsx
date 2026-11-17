import { useMemo, useState } from 'react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { getFriendlyFirebaseError } from '../../services/errorHandler.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ProductForm from '../../components/admin/ProductForm.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import SafeImage from '../../components/common/SafeImage.jsx';

export default function Products() {
  const {
    products,
    categories,
    storeSettings,
    isLoading,
    addProduct,
    editProduct,
    removeProduct,
  } = useStore();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currency = storeSettings.currency || 'PKR';

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const catSlug = p.categoryId || p.category || '';
      if (q) {
        const hay = `${p.name} ${p.sku} ${catSlug} ${p.categoryName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (categoryFilter !== 'all' && catSlug !== categoryFilter) {
        return false;
      }
      const stock = Number(p.stockQuantity) || 0;
      if (availabilityFilter === 'in-stock' && stock <= 0) return false;
      if (availabilityFilter === 'low-stock' && (stock <= 0 || stock > 5)) {
        return false;
      }
      if (availabilityFilter === 'out-of-stock' && stock > 0) return false;
      return true;
    });
  }, [products, search, categoryFilter, availabilityFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormModalOpen(true);
  };

  const handleSaveProduct = async (payload) => {
    if (editingProduct) {
      await editProduct(editingProduct.id, payload);
      showToast(`Updated ${payload.name}.`);
    } else {
      await addProduct(payload);
      showToast(`Created ${payload.name}.`);
    }
    setFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await removeProduct(deleteTarget.id);
      showToast(`Deleted ${deleteTarget.name}.`);
      setDeleteTarget(null);
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to delete product.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFlag = async (product, field, label) => {
    try {
      await editProduct(product.id, { [field]: !product[field] });
      showToast(`${product.name}: ${label} updated.`);
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to update product.'), 'error');
    }
  };

  const handleTogglePublishStatus = async (product) => {
    const currentlyPublished =
      product.isActive !== false && product.status !== 'draft';
    const nextPublished = !currentlyPublished;
    try {
      await editProduct(product.id, {
        isActive: nextPublished,
        status: nextPublished ? 'published' : 'draft',
      });
      showToast(
        `${product.name}: ${nextPublished ? 'Published' : 'Moved to Draft'}.`
      );
    } catch (error) {
      showToast(getFriendlyFirebaseError(error, 'Failed to update status.'), 'error');
    }
  };

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage leather catalog, pricing, images, and storefront visibility"
      action={
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filters */}
        <div className="bg-white border border-[#E6E2DC] p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#625D57] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full pl-10 pr-4 py-2 bg-[#F3F1ED] border border-[#E6E2DC] text-sm text-[#17130F] focus:outline-none focus:border-[#17130F]"
            />
          </div>

          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#E6E2DC] text-sm text-[#17130F]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by availability"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#E6E2DC] text-sm text-[#17130F]"
          >
            <option value="all">All Availability</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock (1–5)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E6E2DC] overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E6E2DC] bg-[#F3F1ED] text-[#625D57]">
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Flags</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2DC]">
              {filteredProducts.map((product) => {
                const img =
                  product.images?.[product.primaryImageIndex || 0] ||
                  product.images?.[0] ||
                  '';
                const stock = Number(product.stockQuantity) || 0;
                const isPublished =
                  product.isActive !== false && product.status !== 'draft';
                return (
                  <tr key={product.id} className="hover:bg-[#F3F1ED]/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-12 h-10 bg-[#F3F1ED] border border-[#E6E2DC] shrink-0 overflow-hidden">
                          <SafeImage
                            src={img}
                            alt={product.name}
                            fallbackTitle={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-[#17130F]">{product.name}</p>
                          <p className="text-[#625D57] tabular-nums">{product.sku}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 capitalize text-[#17130F]">
                      {product.categoryName || product.categoryId}
                    </td>

                    <td className="py-3 px-4 tabular-nums">
                      {product.isOnSale && product.discountPrice ? (
                        <div>
                          <span className="font-semibold text-[#B42318] block">
                            {formatPrice(product.discountPrice, currency)}
                          </span>
                          <span className="text-[#625D57] line-through">
                            {formatPrice(product.price, currency)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-[#17130F]">
                          {formatPrice(product.price, currency)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 tabular-nums font-medium">
                      <span
                        className={
                          stock === 0
                            ? 'text-[#B42318]'
                            : stock <= 5
                            ? 'text-[#8C5A36]'
                            : 'text-[#17130F]'
                        }
                      >
                        {stock}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleFlag(product, 'isFeatured', 'Featured')}
                          className={`px-2 py-1 border text-sm cursor-pointer ${
                            product.isFeatured
                              ? 'bg-[#241811] text-white border-[#241811]'
                              : 'bg-white text-[#625D57] border-[#E6E2DC]'
                          }`}
                        >
                          Featured
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleFlag(product, 'isBestSeller', 'Best Seller')
                          }
                          className={`px-2 py-1 border text-sm cursor-pointer ${
                            product.isBestSeller
                              ? 'bg-[#8C5A36] text-white border-[#8C5A36]'
                              : 'bg-white text-[#625D57] border-[#E6E2DC]'
                          }`}
                        >
                          Best Seller
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFlag(product, 'isOnSale', 'On Sale')}
                          className={`px-2 py-1 border text-sm cursor-pointer ${
                            product.isOnSale
                              ? 'bg-[#B42318] text-white border-[#B42318]'
                              : 'bg-white text-[#625D57] border-[#E6E2DC]'
                          }`}
                        >
                          Sale
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublishStatus(product)}
                        className={`px-2.5 py-1 border text-sm font-medium cursor-pointer ${
                          isPublished
                            ? 'border-[#17130F] text-[#17130F] bg-white'
                            : 'border-[#E6E2DC] text-[#625D57] bg-[#F3F1ED]'
                        }`}
                      >
                        {isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(product)}
                        aria-label={`Edit ${product.name}`}
                        className="p-2 text-[#17130F] hover:text-[#8C5A36] cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`Delete ${product.name}`}
                        className="p-2 text-[#625D57] hover:text-[#B42318] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!isLoading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#625D57]">
                    No products match your search or filters.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#625D57]">
                    Loading products...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Add New Product'}
        maxWidth="max-w-3xl"
      >
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleSaveProduct}
          onCancel={() => {
            setFormModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          <p className="text-base text-[#17130F]">
            Are you sure you want to remove <strong>{deleteTarget?.name}</strong> from your store catalog?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Product'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
