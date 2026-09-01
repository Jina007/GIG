import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const EscalatedDisputesDesk: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEscalated = async () => {
    try {
      const data = await api.complaints.getAll({ escalated_only: 'true' });
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalated();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSubmitting(true);
    try {
      await api.complaints.updateStatus(selectedTicket.id, 'RESOLVED', resolutionNotes, false);
      setSelectedTicket(null);
      setResolutionNotes('');
      await fetchEscalated();
    } catch (err: any) {
      alert(err.message || 'Arbitration update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            State Federation Dispute Arbitration Desk
          </h1>
          <span className="bg-purple-100 text-purple-800 text-xs font-black px-2.5 py-0.5 rounded-full">
            Statewide Jurisdiction
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Arbitrate inter-cooperative cross-district disputes and policy grievances escalated from primary societies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Escalated list */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-semibold">Loading escalated cases...</div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs shadow-xs">
              No escalated disputes pending statewide arbitration.
            </div>
          ) : (
            complaints.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedTicket(c);
                  setResolutionNotes(c.resolution_notes || '');
                }}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer bg-white ${
                  selectedTicket?.id === c.id ? 'border-purple-600 shadow-md' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">#{c.ticket_no}</span>
                    <h3 className="font-extrabold text-base text-slate-900">{c.title}</h3>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                    Escalated to Apex
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-2">
                  {c.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Society: <strong>{c.cooperative_name}</strong></span>
                  <span>Customer: <strong>{c.customer_name}</strong></span>
                  <span className="text-purple-700 font-bold">Priority: {c.priority}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Arbitration Action Panel */}
        <div>
          {selectedTicket ? (
            <form onSubmit={handleResolve} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Statewide Arbitration</span>
              <h4 className="font-extrabold text-base text-slate-900">Case #{selectedTicket.ticket_no}</h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Apex Mediation Binding Decision
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record binding arbitration order, jurisdictional boundary settlement..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                {submitting ? 'Issuing Ruling...' : 'Issue Final Arbitration Ruling'}
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-400">
              Select an escalated ticket to review and issue an arbitration ruling.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
