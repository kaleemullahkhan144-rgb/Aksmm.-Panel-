import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import { Service, Category } from '../../types/smm';
import {
  ListOrdered,
  PlusCircle,
  FolderPlus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Server,
  RotateCcw,
  Clock
} from 'lucide-react';

export const AdminServices: React.FC = () => {
  const {
    services,
    categories,
    apiProviders,
    saveService,
    deleteService,
    saveCategory,
    deleteCategory,
    formatCurrency
  } = useSMM();

  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');

  // Service Edit Modal
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  // Category Edit Modal
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name) return;

    saveService(editingService);
    setFeedback(`Service ${editingService.id ? 'updated' : 'created'} successfully!`);
    setEditingService(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;

    saveCategory(editingCategory);
    setFeedback(`Category ${editingCategory.id ? 'updated' : 'created'} successfully!`);
    setEditingCategory(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-purple-400" />
            Services & Categories Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create new offerings, configure pricing margins, and map to upstream API providers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'services' ? (
            <button
              onClick={() =>
                setEditingService({
                  name: '',
                  categoryId: categories[0]?.id || 1,
                  type: 'Default',
                  rate: 1.5,
                  minQuantity: 50,
                  maxQuantity: 50000,
                  description: '',
                  dripfeed: false,
                  refill: true,
                  status: 'active'
                })
              }
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              Add Service
            </button>
          ) : (
            <button
              onClick={() => setEditingCategory({ name: '', icon: 'folder', status: 'active' })}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <FolderPlus className="w-4 h-4" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-200 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          {feedback}
        </div>
      )}

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'services'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Services ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'categories'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Service Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Rate / 1k</th>
                  <th className="py-2.5 px-3 text-right">Min/Max</th>
                  <th className="py-2.5 px-3">API Mapping</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {services.map(svc => {
                  const cat = categories.find(c => c.id === svc.categoryId);
                  const provider = apiProviders.find(p => p.id === svc.apiProviderId);
                  return (
                    <tr key={svc.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-300">#{svc.id}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-white max-w-xs truncate">
                        {svc.name}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-400 max-w-[140px] truncate">
                        {cat?.name || 'Uncategorized'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400 tabular-nums">
                        ${svc.rate.toFixed(4)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                        {svc.minQuantity.toLocaleString()} / {svc.maxQuantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-sans text-[11px]">
                        {provider ? (
                          <div className="text-purple-300 flex items-center gap-1 font-mono">
                            <Server className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="truncate max-w-[100px]">{provider.name} (#{svc.apiServiceId})</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Manual / Local</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          svc.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {svc.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingService(svc)}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete service #${svc.id}?`)) deleteService(svc.id);
                            }}
                            className="p-1 rounded bg-slate-800 text-rose-400 hover:text-rose-200 hover:bg-rose-950"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Category Name</th>
                  <th className="py-2.5 px-3">Total Services</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {categories.map(cat => {
                  const count = services.filter(s => s.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-300">#{cat.id}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-white">
                        {cat.name}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-300">
                        {count} services
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cat.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {cat.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingCategory(cat)}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete category ${cat.name}?`)) deleteCategory(cat.id);
                            }}
                            className="p-1 rounded bg-slate-800 text-rose-400 hover:text-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Edit/Add Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {editingService.id ? `Edit Service #${editingService.id}` : 'Create New Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service Name *</label>
                <input
                  type="text"
                  value={editingService.name || ''}
                  onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={editingService.categoryId || categories[0]?.id}
                    onChange={e => setEditingService({ ...editingService, categoryId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rate per 1000 ($ USD)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editingService.rate ?? 1.0}
                    onChange={e => setEditingService({ ...editingService, rate: parseFloat(e.target.value || '0') })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Order</label>
                  <input
                    type="number"
                    value={editingService.minQuantity ?? 10}
                    onChange={e => setEditingService({ ...editingService, minQuantity: parseInt(e.target.value || '0', 10) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Order</label>
                  <input
                    type="number"
                    value={editingService.maxQuantity ?? 50000}
                    onChange={e => setEditingService({ ...editingService, maxQuantity: parseInt(e.target.value || '0', 10) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* API Provider Mapping */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-semibold text-purple-300 text-[11px] block">
                  Upstream API Provider Connectivity
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Provider</label>
                    <select
                      value={editingService.apiProviderId || ''}
                      onChange={e =>
                        setEditingService({
                          ...editingService,
                          apiProviderId: e.target.value ? Number(e.target.value) : undefined
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                    >
                      <option value="">None (Manual delivery)</option>
                      {apiProviders.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Provider Service ID</label>
                    <input
                      type="text"
                      value={editingService.apiServiceId || ''}
                      onChange={e => setEditingService({ ...editingService, apiServiceId: e.target.value })}
                      placeholder="e.g. 501"
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.refill ?? true}
                    onChange={e => setEditingService({ ...editingService, refill: e.target.checked })}
                    className="rounded text-purple-600 bg-slate-950"
                  />
                  <span className="text-slate-300">Enable Refill Option</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.dripfeed ?? false}
                    onChange={e => setEditingService({ ...editingService, dripfeed: e.target.checked })}
                    className="rounded text-purple-600 bg-slate-950"
                  />
                  <span className="text-slate-300">Enable Drip-feed</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingService.description || ''}
                  onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setEditingCategory(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {editingCategory.id ? 'Edit Category' : 'Create Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  value={editingCategory.name || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Instagram Followers"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={editingCategory.status || 'active'}
                  onChange={e => setEditingCategory({ ...editingCategory, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
