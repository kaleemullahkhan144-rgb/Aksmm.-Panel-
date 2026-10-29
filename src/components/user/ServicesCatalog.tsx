import React, { useState, useMemo } from 'react';
import { useSMM } from '../../context/SMMContext';
import { Service } from '../../types/smm';
import {
  ListOrdered,
  Search,
  Info,
  RotateCcw,
  Clock,
  Copy,
  Check,
  X,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';

interface ServicesCatalogProps {
  onNavigateToOrder?: (serviceId: number) => void;
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({ onNavigateToOrder }) => {
  const { services, categories, formatCurrency, convertUsdToPkr, currentUser } = useSMM();

  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredServices = useMemo(() => {
    return services.filter(svc => {
      if (svc.status !== 'active') return false;
      const matchesCategory = selectedCategory === 'all' || svc.categoryId === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        String(svc.id).includes(term) ||
        svc.name.toLowerCase().includes(term) ||
        svc.description.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchTerm]);

  const copyId = (id: number) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-indigo-400" />
            Services & Pricing Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse our comprehensive index of high retention social media services and live rates.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID or service keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All Categories ({services.filter(s => s.status === 'active').length})
        </button>
        {categories.filter(c => c.status === 'active').map(cat => {
          const count = services.filter(s => s.categoryId === cat.id && s.status === 'active').length;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Services Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Service ID</th>
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3 text-right">Rate / 1000</th>
                <th className="py-2.5 px-3 text-right">Min / Max</th>
                <th className="py-2.5 px-3 text-center">Refill</th>
                <th className="py-2.5 px-3 text-center">Dripfeed</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredServices.map(svc => {
                const userRate = currentUser?.customRates?.[svc.id] ?? svc.rate;
                return (
                  <tr key={svc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <span>#{svc.id}</span>
                        <button
                          onClick={() => copyId(svc.id)}
                          className="text-slate-500 hover:text-slate-300"
                          title="Copy Service ID"
                        >
                          {copiedId === svc.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-200 max-w-md">
                      <div className="font-semibold text-slate-100">{svc.name}</div>
                      {svc.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{svc.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <div className="font-bold text-emerald-400">
                        {formatCurrency(userRate)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Rs. {convertUsdToPkr(userRate).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      {svc.minQuantity.toLocaleString()} / {svc.maxQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {svc.refill ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                          <RotateCcw className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {svc.dripfeed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedService(svc)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <Info className="w-3 h-3 text-indigo-400" />
                          Details
                        </button>
                        {onNavigateToOrder && (
                          <button
                            onClick={() => onNavigateToOrder(svc.id)}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors"
                          >
                            Order
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Service Specifications
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{selectedService.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Service ID: #{selectedService.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[11px]">Rate per 1000</span>
                <p className="font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(selectedService.rate)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">PKR Equivalent</span>
                <p className="font-bold text-white mt-0.5">
                  Rs. {convertUsdToPkr(selectedService.rate).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Min Order Quantity</span>
                <p className="text-slate-200 mt-0.5">{selectedService.minQuantity.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Max Order Quantity</span>
                <p className="text-slate-200 mt-0.5">{selectedService.maxQuantity.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1">Service Description</span>
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                {selectedService.description || 'No specific description provided for this service.'}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              {onNavigateToOrder && (
                <button
                  onClick={() => {
                    const id = selectedService.id;
                    setSelectedService(null);
                    onNavigateToOrder(id);
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Order This Service
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
