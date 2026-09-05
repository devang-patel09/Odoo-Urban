import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Product, ProductCategory, ProductType } from '../../types';
import { 
  Package, 
  Plus, 
  Search, 
  LayoutList, 
  LayoutGrid, 
  Tag, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  X, 
  AlertCircle 
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [detailModalProductId, setDetailModalProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'GOODS' as ProductType,
    salesPrice: 0,
    costPrice: 0,
    categoryId: 0,
    imageUrl: '',
  });

  const [newCatName, setNewCatName] = useState('');

  // Fetch categories
  const { data: categories } = useQuery<ProductCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
  });

  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory, search],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: {
          categoryId: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          search: search || undefined,
        },
      });
      return res.data.data;
    },
  });

  // Fetch single product details with stock metrics
  const { data: productDetail } = useQuery<any>({
    queryKey: ['product', detailModalProductId],
    queryFn: async () => {
      if (!detailModalProductId) return null;
      const res = await api.get(`/products/${detailModalProductId}`);
      return res.data.data;
    },
    enabled: !!detailModalProductId,
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const res = await api.post('/products', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setModalOpen(false);
      setFormData({
        name: '',
        type: 'GOODS',
        salesPrice: 0,
        costPrice: 0,
        categoryId: categories && categories.length > 0 ? categories[0].id : 0,
        imageUrl: '',
      });
      setError(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create product.';
      setError(msg);
    },
  });

  // Create on-the-fly category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post('/categories', { name });
      return res.data.data;
    },
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setFormData((prev) => ({ ...prev, categoryId: newCat.id }));
      setCategoryModalOpen(false);
      setNewCatName('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId && categories && categories.length > 0) {
      formData.categoryId = categories[0].id;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#2F2F2F] tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#714B67]" />
            Products Master
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Furniture goods, combo packages, service assembly, sales prices, and purchase costs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#714B67] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[#714B67] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setError(null);
              if (categories && categories.length > 0 && !formData.categoryId) {
                setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
              }
              setModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-[#F3EAF0] text-[#714B67] font-semibold border border-[#714B67]/30'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id.toString())}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id.toString()
                  ? 'bg-[#F3EAF0] text-[#714B67] font-semibold border border-[#714B67]/30'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
          />
        </div>
      </div>

      {/* Main View: List or Kanban */}
      {isLoading ? (
        <div className="bg-white p-12 text-center text-gray-500 rounded-lg border border-gray-200">
          Loading products...
        </div>
      ) : !products || products.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-500 rounded-lg border border-gray-200">
          No products found.
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Sales Price</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {products.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setDetailModalProductId(p.id)}
                  className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
                      <Package className="w-4 h-4 text-[#714B67]" />
                    </div>
                    <span>{p.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge-purple">{p.category?.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900">
                    ₹{Number(p.salesPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-600">
                    ₹{Number(p.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailModalProductId(p.id);
                      }}
                      className="text-xs text-[#714B67] hover:underline font-semibold"
                    >
                      Stock Analysis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => setDetailModalProductId(p.id)}
              className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm hover:border-[#714B67]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="badge-purple">{p.category?.name}</span>
                  <span className="text-[11px] font-medium text-gray-500">{p.type}</span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-[#714B67]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{p.name}</h3>
                    <span className="text-xs text-gray-500">Master Item</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Sales Price:</span>
                    <div className="font-bold font-mono text-emerald-700 mt-0.5">
                      ₹{Number(p.salesPrice).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Cost:</span>
                    <div className="font-semibold font-mono text-gray-700 mt-0.5">
                      ₹{Number(p.costPrice).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Product Modal - Exactly as Mockup Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-[#E5E7EB] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#714B67]" />
                Product Master Form
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Office Chair, Wooden Table"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category (Many2One) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                    className="text-xs text-[#017E84] hover:underline font-semibold"
                  >
                    + Create on-the-fly
                  </button>
                </div>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                >
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Product Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                >
                  <option value="GOODS">Goods (Physical Furniture)</option>
                  <option value="SERVICE">Service (Assembly, Maintenance)</option>
                  <option value="COMBO">Combo Package</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Sales Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.salesPrice}
                    onChange={(e) => setFormData({ ...formData, salesPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 5000.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Cost / Purchase Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 3000.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                  {createMutation.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* On-The-Fly Category Creation Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-[#E5E7EB] p-6">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Create Category on-the-fly</h3>
            <input
              type="text"
              placeholder="e.g. Wardrobes, Desks"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#714B67] mb-4"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newCatName.trim() || createCategoryMutation.isPending}
                onClick={() => createCategoryMutation.mutate(newCatName.trim())}
                className="btn-secondary"
              >
                Save & Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Stock & Financial Drilldown Modal */}
      {detailModalProductId && productDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-[#E5E7EB] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{productDetail.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="badge-purple">{productDetail.category?.name}</span>
                  <span className="text-xs text-gray-500 font-medium">{productDetail.type}</span>
                </div>
              </div>
              <button onClick={() => setDetailModalProductId(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <span className="text-emerald-800 font-semibold uppercase tracking-wider text-[10px]">
                    Sales Price
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
                    ₹{Number(productDetail.salesPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <span className="text-[#714B67] font-semibold uppercase tracking-wider text-[10px]">
                    Purchase Cost
                  </span>
                  <div className="text-xl font-bold font-mono text-gray-900 mt-1">
                    ₹{Number(productDetail.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Dynamic Stock Aggregation */}
              <div>
                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-3">
                  Transaction Activity & Stock Aggregation
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-500">Qty Purchased:</span>
                    <div className="text-lg font-bold text-gray-900 font-mono mt-1">
                      {productDetail.stockMetrics?.quantityPurchased || 0}
                    </div>
                    <span className="text-[10px] text-gray-400">From posted bills</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-500">Qty Sold:</span>
                    <div className="text-lg font-bold text-gray-900 font-mono mt-1">
                      {productDetail.stockMetrics?.quantitySold || 0}
                    </div>
                    <span className="text-[10px] text-gray-400">From posted invoices</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-500">Current Stock:</span>
                    <div className="text-lg font-bold font-mono mt-1 text-[#017E84]">
                      {productDetail.stockMetrics?.currentStock || 0} units
                    </div>
                    <span className="text-[10px] text-gray-400">Purchased - Sold</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setDetailModalProductId(null)} className="btn-outline text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
