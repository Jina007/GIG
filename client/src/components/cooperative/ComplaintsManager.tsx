import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  User,
  Phone,
  Calendar,
  MessageSquare,
} from 'lucide-react';

export const ComplaintsManager: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [status, setStatus] = useState<string>('RESOLVED');
  const [escalate, setEscalate] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchComplaints = async () => {
    try {
      const data = await api.complaints.getAll();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSubmitting(true);
    try {
      await api.complaints.updateStatus(
        selectedComplaint.id,
        escalate ? 'ESCALATED' : status,
        resolutionNotes,
        escalate
      );
      setSelectedComplaint(null);
      setResolutionNotes('');
      await fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cooperative Mediation & Dispute Resolution Desk
          </h1>
          <span className="bg-red-100 text-red-800 text-xs font-black px-2.5 py-0.5 rounded-full">
            Elected Committee Panel
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review customer complaints, mediate between households and cooperative workers, record resolution outcomes, or escalate to Federation Apex.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Complaints Queue List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-semibold">Loading complaint records...</div>
          ) : complaints.length === 0 ? (
            <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              No active dispute tickets found.
            </div>
          ) : (
            complaints.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedComplaint(c);
                  setResolutionNotes(c.resolution_notes || '');
                  setStatus(c.status === 'OPEN' ? 'UNDER_REVIEW' : c.status);
                  setEscalate(c.escalated_to_federation === 1);
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                  selectedComplaint?.id === c.id
                    ? 'border-emerald-600 shadow-md ring-1 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-mono text-[11px] text-slate-400 font-bold block">
                      Ticket #{c.ticket_no}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {c.title}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      c.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'ESCALATED'
                        ? 'bg-purple-100 text-purple-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {c.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 gap-2">
                  <span>Customer: <strong>{c.customer_name}</strong></span>
                  <span>Worker: <strong>{c.worker_name || 'Assigned Member'}</strong></span>
                  <span>Category: <strong>{c.category}</strong></span>
                  <span className="font-bold text-rose-700">Priority: {c.priority}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action / Resolution Form Card */}
        <div>
          {selectedComplaint ? (
            <form
              onSubmit={handleUpdateStatus}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4 sticky top-20"
            >
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mediation Action</span>
                <h4 className="font-extrabold text-base text-slate-900">
                  Case #{selectedComplaint.ticket_no}
                </h4>
                <p className="text-xs text-slate-500">{selectedComplaint.title}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Update Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="OPEN">OPEN (Under Investigation)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Contacting Parties)</option>
                  <option value="RESOLVED">RESOLVED (Settlement Reached)</option>
                  <option value="CLOSED">CLOSED (Archived)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mediator Investigation & Resolution Notes
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record discussions with customer & worker, agreed refunds, or re-work commitments..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                <label className="flex items-center gap-2 text-xs font-bold text-purple-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={escalate}
                    onChange={(e) => setEscalate(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>Escalate to State Federation Apex Desk</span>
                </label>
                <p className="text-[10px] text-purple-700">
                  Use when disputes involve cross-cooperative jurisdictions or policy revisions.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                {submitting ? 'Saving Resolution...' : 'Save & Notify Parties'}
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Select any dispute ticket from the list to investigate and enter mediation records.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
