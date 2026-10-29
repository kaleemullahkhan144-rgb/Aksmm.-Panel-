import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import {
  Bookmark,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  Share2,
  Search,
  ArrowRight,
  Sparkles,
  Link2
} from 'lucide-react';

interface SavedUrlsProps {
  onNavigateToOrder?: (prefillUrl: string) => void;
}

export const SavedUrls: React.FC<SavedUrlsProps> = ({ onNavigateToOrder }) => {
  const {
    currentUser,
    savedUrls,
    addSavedUrl,
    deleteSavedUrl
  } = useSMM();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const platforms = [
    'Instagram',
    'TikTok',
    'YouTube',
    'Facebook',
    'Twitter',
    'Telegram',
    'Spotify',
    'Website / Other'
  ];

  const userUrls = currentUser ? savedUrls.filter(u => u.userId === currentUser.id) : [];

  const filteredUrls = userUrls.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || item.platform.toLowerCase() === platformFilter.toLowerCase();
    return matchesSearch && matchesPlatform;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || !url.trim()) return;

    addSavedUrl({
      title: title.trim(),
      url: url.trim(),
      platform
    });

    setTitle('');
    setUrl('');
    setFeedback('Target URL saved successfully! You can autofill it in New Orders anytime.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>URL Manager & Bookmarks</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Saved Social Links & Target URLs
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Save your frequently targeted Instagram handles, TikTok videos, YouTube channels, and post links here for instant 1-click autofill in the New Order screen.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-emerald-400" />
          <span>Total Saved URLs: <strong className="text-white font-mono">{userUrls.length}</strong></span>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Add URL Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" />
          Add New Target URL / Bookmark
        </h3>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Link Title / Label
            </label>
            <input
              type="text"
              placeholder="e.g. My Instagram Handle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Platform
            </label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Target URL / Profile Link
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/myaccount"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Save URL</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter & List */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search saved links..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Platform Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${
                platformFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              All ({userUrls.length})
            </button>
            {platforms.slice(0, 5).map(p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${
                  platformFilter.toLowerCase() === p.toLowerCase()
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Saved URLs List */}
        {filteredUrls.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No saved URLs found. Add your favorite links above to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredUrls.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-xs truncate max-w-[200px]">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-indigo-300">
                      {item.platform}
                    </span>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] truncate flex items-center gap-1.5"
                    title={item.url}
                  >
                    <span className="truncate">{item.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">{item.createdAt}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(item.url, item.id)}
                      className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-sans">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="font-sans">Copy</span>
                        </>
                      )}
                    </button>

                    {onNavigateToOrder && (
                      <button
                        onClick={() => onNavigateToOrder(item.url)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Autofill this link in New Order"
                      >
                        <span>Use in Order</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteSavedUrl(item.id)}
                      className="p-1.5 rounded-md bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete saved URL"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
