import React, { useState } from 'react';
import { api } from '../../services/api';
import { ShieldAlert, X, AlertTriangle, Upload, CheckCircle2 } from 'lucide-react';

interface ComplaintModalProps {
  bookingId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ bookingId, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'QUALITY' | 'OVERCHARGING' | 'DELAY' | 'MISBEHAVIOR' | 'NO_SHOW' | 'OTHER'>('QUALITY');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);
    try {
      const res = await api.complaints.create({
        bookingId: bookingId || null,
        title,
        description,
        category,
        priority,
      });
      setSubmittedTicket(res.complaint.ticket_no);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-rose-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Cooperative Mediation & Dispute</h3>
              <p className="text-xs text-rose-200">File a complaint for cooperative society review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedTicket ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900">Complaint Registered Successfully</h4>
              <p className="text-xs text-slate-500 font-mono mt-1">Ticket Number: <span className="font-bold text-slate-800">{submittedTicket}</span></p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your complaint has been forwarded to the <strong>Coimbatore Labour Cooperative Society Mediation Desk</strong>. A cooperative administrator will contact you within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="QUALITY">Service Quality Defect / Incomplete Work</option>
                <option value="OVERCHARGING">Pricing or Spare Parts Billing Discrepancy</option>
                <option value="DELAY">Unreasonable Delay / Late Arrival</option>
                <option value="MISBEHAVIOR">Staff Unprofessionalism or Misbehavior</option>
                <option value="NO_SHOW">Worker No-Show without Prior Notice</option>
                <option value="OTHER">General Grievance / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Complaint Subject
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Incident Description
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, time of arrival, damages, or discrepancies..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setPriority(lvl)}
                    className={`py-2 rounded-lg border text-center transition-all ${
                      priority === lvl
                        ? 'bg-rose-50 border-rose-600 text-rose-700 ring-1 ring-rose-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Unlike corporate apps where complaints are automated by bots, complaints on Sahakari Gig are assigned to an elected Cooperative Mediation Committee member for fair bilateral resolution.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md shadow-rose-700/20 active:scale-95 transition-all"
              >
                {submitting ? 'Filing Ticket...' : 'Submit to Cooperative'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
