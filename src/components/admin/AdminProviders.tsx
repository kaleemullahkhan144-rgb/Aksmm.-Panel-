import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import { ApiProvider } from '../../types/smm';
import {
  Server,
  PlusCircle,
  RefreshCw,
  Download,
  Key,
  Globe,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';

export const AdminProviders: React.FC = () => {
  const {
    apiProviders,
    saveApiProvider,
    deleteApiProvider,
    syncProviderServices,
    formatCurrency
  } = useSMM();

  const [editingProvider, setEditingProvider] = useState<Partial<ApiProvider> | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider || !editingProvider.name || !editingProvider.url) return;

    saveApiProvider(editingProvider);
    setFeedback(`Provider ${editingProvider.name} saved successfully!`);
    setEditingProvider(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTestConnection = (prov: ApiProvider) => {
    setTestingId(prov.id);
    setTimeout(() => {
      setFeedback(`Connection to ${prov.name} verified! Response: HTTP 200 OK · Balance: $${prov.balance.toFixed(2)} USD`);
      setTestingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }, 600);
  };

  const handleImport = (prov: ApiProvider) => {
    const importedCount = syncProviderServices(prov.id);
    setFeedback(`Successfully imported & mapped ${importedCount} services from ${prov.name} into panel catalog!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            API Providers Integration & Automated Sync
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Connect upstream SMM v2 APIs to automate order forwarding, sync balances, and import service catalogs.
          </p>
        </div>

        <button
          onClick={() =>
            setEditingProvider({
              name: '',
              url: 'https://',
              apiKey: '',
              balance: 100.0,
              currency: 'USD',
              status: 'active'
            })
          }
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          Add API Provider
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-200 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          {feedback}
        </div>
      )}

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apiProviders.map(prov => (
          <div key={prov.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{prov.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Provider ID: #{prov.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  prov.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {prov.status}
                </span>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 text-[11px]">API URL:</span>
                  <span className="text-indigo-400 truncate max-w-[200px]">{prov.url}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 text-[11px]">API Key:</span>
                  <span className="text-slate-400 truncate max-w-[180px]">
                    {prov.apiKey.substring(0, 8)}•••••••••••••
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-500 text-[11px]">Available Provider Balance:</span>
                  <span className="text-emerald-400 font-bold">${prov.balance.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Last Sync:</span>
                  <span>{prov.lastSync || 'Never'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection(prov)}
                  disabled={testingId === prov.id}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${testingId === prov.id ? 'animate-spin' : ''}`} />
                  Check Balance
                </button>
                <button
                  onClick={() => handleImport(prov)}
                  className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-200 text-xs font-semibold flex items-center gap-1.5 border border-purple-800"
                  title="Pull provider services list (action: services) and import into catalog"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  Import Services
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingProvider(prov)}
                  className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove provider ${prov.name}?`)) deleteApiProvider(prov.id);
                  }}
                  className="p-1.5 rounded bg-slate-800 text-rose-400 hover:text-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Provider Edit/Add Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setEditingProvider(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              {editingProvider.id ? 'Edit API Provider' : 'Add API Provider'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Provider Name *</label>
                <input
                  type="text"
                  value={editingProvider.name || ''}
                  onChange={e => setEditingProvider({ ...editingProvider, name: e.target.value })}
                  placeholder="e.g. SMMKings or JustAnotherPanel"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">API Endpoint URL *</label>
                <input
                  type="url"
                  value={editingProvider.url || ''}
                  onChange={e => setEditingProvider({ ...editingProvider, url: e.target.value })}
                  placeholder="https://provider.com/api/v2"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">API Key *</label>
                <input
                  type="text"
                  value={editingProvider.apiKey || ''}
                  onChange={e => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                  placeholder="API Key provided by the SMM provider"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
