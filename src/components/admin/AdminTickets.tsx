import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import { Ticket, TicketStatus } from '../../types/smm';
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  ShieldCheck,
  User,
  Clock,
  MessageSquare
} from 'lucide-react';

export const AdminTickets: React.FC = () => {
  const { tickets, replyTicket, updateTicketStatus } = useSMM();

  const [filter, setFilter] = useState<'all' | 'open' | 'answered' | 'closed'>('open');
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(() => {
    return tickets[0] || null;
  });
  const [adminReply, setAdminReply] = useState('');

  const filteredTickets = tickets.filter(t => filter === 'all' || t.status === filter);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !adminReply.trim()) return;

    replyTicket(activeTicket.id, adminReply);
    setAdminReply('');

    setTimeout(() => {
      const updated = tickets.find(t => t.id === activeTicket.id);
      if (updated) setActiveTicket(updated);
    }, 50);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-purple-400" />
          Admin Helpdesk & Ticket Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review customer inquiries, investigate stalled orders, and send official staff responses.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
        {(['open', 'answered', 'closed', 'all'] as const).map(st => {
          const count = st === 'all' ? tickets.length : tickets.filter(t => t.status === st).length;
          const isActive = filter === st;
          return (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 uppercase ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <span>{st}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
            Ticket Inquiries ({filteredTickets.length})
          </span>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No tickets matching this status.
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto">
              {filteredTickets.map(t => {
                const isSelected = activeTicket?.id === t.id;
                let badgeClass = 'bg-slate-800 text-slate-300';
                if (t.status === 'open') badgeClass = 'bg-amber-950 text-amber-300 border border-amber-800/50';
                if (t.status === 'answered') badgeClass = 'bg-emerald-950 text-emerald-300 border border-emerald-800/50';

                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicket(t)}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'bg-slate-800 border-purple-500'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white truncate max-w-[140px]">
                        #{t.id} - {t.subject}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold capitalize ${badgeClass}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-purple-300">{t.username}</span>
                      <span>{t.updatedAt.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat / Reply Thread */}
        <div className="md:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between min-h-[520px]">
          {activeTicket ? (
            <>
              {/* Header */}
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">#{activeTicket.id}: {activeTicket.subject}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono capitalize">
                      {activeTicket.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Client: <span className="text-white font-semibold">{activeTicket.username}</span>
                    {activeTicket.orderId && ` · Order #${activeTicket.orderId}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeTicket.status}
                    onChange={e => {
                      const newStatus = e.target.value as TicketStatus;
                      updateTicketStatus(activeTicket.id, newStatus);
                      setActiveTicket(prev => prev ? { ...prev, status: newStatus } : null);
                    }}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="open">Open</option>
                    <option value="answered">Answered</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[360px]">
                {activeTicket.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.isAdmin ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                      {msg.isAdmin ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-semibold text-purple-300">Staff Support</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-300">{msg.userName}</span>
                        </>
                      )}
                      <span>·</span>
                      <span className="text-[10px] font-mono">{msg.createdAt}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed ${
                        msg.isAdmin
                          ? 'bg-purple-950/60 border border-purple-800/70 text-purple-100 rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Staff Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={adminReply}
                  onChange={e => setAdminReply(e.target.value)}
                  placeholder="Type an official staff reply to the customer..."
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={!adminReply.trim()}
                  className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-20">
              <MessageSquare className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No ticket selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
