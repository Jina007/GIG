import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { ShieldAlert, CheckCircle2, Clock, AlertTriangle, Plus, FileText, ChevronRight } from 'lucide-react';
import { ComplaintModal } from './ComplaintModal';

export const CustomerComplaintsView: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Support & Cooperative Mediation
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Bilateral Resolution
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track grievances and mediation tickets. All disputes are reviewed directly by the local Labour Cooperative Society mediation committee.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>File New Grievance</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-semibold">Loading support tickets...</div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-800">No Active Dispute Tickets</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All your past cooperative services have been delivered with zero registered disputes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{c.ticket_no}</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.2 rounded">
                      {c.category}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">{c.title}</h3>
                </div>

                <span
                  className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    c.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.status === 'ESCALATED'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {c.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {c.description}
              </p>

              {c.resolution_notes && (
                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-1">
                  <span className="font-bold text-emerald-950 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Cooperative Mediator Resolution Outcome:
                  </span>
                  <p className="text-emerald-900 font-medium pl-5">{c.resolution_notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Society: <strong>{c.cooperative_name || 'Coimbatore Labour Cooperative'}</strong></span>
                <span>Date: {new Date(c.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ComplaintModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchComplaints();
          }}
        />
      )}

    </div>
  );
};
