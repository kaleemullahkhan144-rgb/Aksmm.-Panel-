import React, { useState } from 'react';
import { useSMM } from '../../context/SMMContext';
import { Ticket, TicketStatus } from '../../types/smm';
import {
  LifeBuoy,
  PlusCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  User,
  ShieldCheck
} from 'lucide-react';

export const SupportTickets: React.FC = () => {
  const { currentUser, tickets, createTicket, replyTicket } = useSMM();

  const [activeTicket, setActiveTicket] = useState<Ticket | null>(() => {
    const userTickets = currentUser ? tickets.filter(t => t.userId === currentUser.id) : [];
    return userTickets[0] || null;
  });

  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<Ticket['category']>('order');
  const [orderId, setOrderId] = useState<string>('');
  const [priority, setPriority] = useState<Ticket['priority']>('medium');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const userTickets = currentUser ? tickets.filter(t => t.userId === currentUser.id) : [];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const res = createTicket({
      subject: subject.trim(),
      category,
      orderId: orderId ? parseInt(orderId, 10) : undefined,
      priority,
      message: message.trim()
    });

    if (res.success) {
      setFeedback('Ticket created successfully! Staff will respond within 15 minutes.');
      setIsCreatingModal(false);
      setSubject('');
      setMessage('');
      setOrderId('');
      // select new ticket
      const newT = tickets.find(t => t.id === res.ticketId);
      if (newT) setActiveTicket(newT);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    replyTicket(activeTicket.id, replyText);
    setReplyText('');

    // refresh active ticket
    setTimeout(() => {
      const updated = tickets.find(t => t.id === activeTicket.id);
      if (updated) setActiveTicket(updated);
    }, 50);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-indigo-400" />
            Support Ticket Helpdesk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            24/7 client support assistance for order delivery inquiries, payments, and custom requests.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingModal(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create Support Ticket
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {feedback}
        </div>
      )}

      {/* Ticket Grid Layout: List on Left, Active Chat on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              My Tickets ({userTickets.length})
            </span>
          </div>

          {userTickets.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No tickets submitted yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {userTickets.map(t => {
                const isSelected = activeTicket?.id === t.id;
                let badgeClass = 'bg-slate-800 text-slate-300';
                if (t.status === 'open') badgeClass = 'bg-amber-950 text-amber-300 border border-amber-800/50';
                if (t.status === 'answered') badgeClass = 'bg-emerald-950 text-emerald-300 border border-emerald-800/50';
                if (t.status === 'closed') badgeClass = 'bg-slate-800 text-slate-400';

                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicket(t)}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-sm'
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
                      <span className="capitalize">{t.category}</span>
                      <span>{t.updatedAt.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Ticket Chat Thread */}
        <div className="md:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between min-h-[500px]">
          {activeTicket ? (
            <>
              {/* Thread Header */}
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">#{activeTicket.id}: {activeTicket.subject}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono capitalize">
                      {activeTicket.category}
                    </span>
                  </div>
                  {activeTicket.orderId && (
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Referenced Order: #{activeTicket.orderId}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Status</span>
                  <span className="text-xs font-bold text-emerald-400 capitalize">
                    {activeTicket.status}
                  </span>
                </div>
              </div>

              {/* Messages Bubble Area */}
              <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[360px]">
                {activeTicket.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.isAdmin ? 'items-start' : 'items-end'
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
                          ? 'bg-purple-950/50 border border-purple-800/60 text-purple-100 rounded-tl-none'
                          : 'bg-indigo-900/60 border border-indigo-700/60 text-slate-100 rounded-tr-none'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {activeTicket.status !== 'closed' ? (
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type a response to support..."
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Reply
                  </button>
                </form>
              ) : (
                <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-500">
                  This ticket has been marked as closed. Open a new ticket if you require further assistance.
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-20">
              <MessageSquare className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No active conversation</p>
              <p className="text-xs mt-1">Select an existing ticket or open a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsCreatingModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-indigo-400" />
              Submit Support Ticket
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Order speed inquiry or Payment verification"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="order">Order Issue</option>
                    <option value="payment">Payment Verification</option>
                    <option value="service">Service Request</option>
                    <option value="api">API Help</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Order ID (Optional)</label>
                  <input
                    type="number"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    placeholder="e.g. 10043"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message *</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
