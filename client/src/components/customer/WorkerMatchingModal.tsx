import React, { useState, useEffect } from 'react';
import { ServiceCategory, Worker } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldCheck,
  Zap,
  Star,
  MapPin,
  CheckCircle2,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { TrustBadge } from '../common/TrustBadge';

interface WorkerMatchingModalProps {
  category: ServiceCategory | null;
  initialIsEmergency?: boolean;
  preselectedWorker?: Worker | null;
  onClose: () => void;
  onBookingSuccess: (bookingId: string) => void;
  onViewTrustProfile: (worker: Worker) => void;
}

export const WorkerMatchingModal: React.FC<WorkerMatchingModalProps> = ({
  category,
  initialIsEmergency = false,
  preselectedWorker = null,
  onClose,
  onBookingSuccess,
  onViewTrustProfile,
}) => {
  const { user, selectedRegionId, selectedCommunityId } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [problemTitle, setProblemTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isEmergency, setIsEmergency] = useState<boolean>(initialIsEmergency);

  const [matchedWorkers, setMatchedWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(preselectedWorker);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (category?.services && category.services.length > 0) {
      setSelectedServiceId(category.services[0].id);
      setProblemTitle(category.services[0].name);
    }
  }, [category]);

  const handleFetchMatches = async () => {
    if (!category) return;
    setLoadingMatches(true);
    try {
      const response = await api.bookings.matchWorkers({
        categoryId: category.id,
        serviceId: selectedServiceId,
        isEmergency,
        regionId: selectedRegionId,
        communityId: selectedCommunityId,
      });
      setMatchedWorkers(response.workers || []);
      if (response.workers && response.workers.length > 0 && !selectedWorker) {
        setSelectedWorker(response.workers[0]);
      }
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedServiceId || !selectedWorker) return;
    setSubmitting(true);
    try {
      const payload = {
        workerId: selectedWorker.id,
        serviceId: selectedServiceId,
        categoryId: category?.id,
        cooperativeId: selectedWorker.cooperative_id,
        isEmergency,
        problemTitle: problemTitle || `${category?.name} Service`,
        description,
        scheduledAt: new Date().toISOString(),
        customerAddress: user?.address || 'Peelamedu, Coimbatore',
        customerPhone: user?.phone || '+91 98421 77301',
        matchScore: selectedWorker.match_score || 96.0,
        matchFactors: selectedWorker.match_factors || [],
      };

      const response = await api.bookings.create(payload);
      onBookingSuccess(response.booking.id);
    } catch (err: any) {
      alert(err.message || 'Failed to confirm booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (!category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isEmergency ? 'bg-red-600' : 'bg-slate-900'
        }`}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-90">
              {isEmergency ? '⚡ Emergency Dispatch' : 'Cooperative Booking'} • Step {step} of 2
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">{category.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {step === 1 ? (
            <div className="space-y-4">
              
              {/* Emergency Switch */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-white">
                    <Zap className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-amber-950 block">
                      Emergency Rapid Response?
                    </span>
                    <span className="text-[11px] text-amber-800">
                      15-30 min response time
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              {/* Specific Task Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Select Specific Task
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    const s = category.services?.find((x) => x.id === e.target.value);
                    if (s) setProblemTitle(s.name);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {category.services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ₹{isEmergency ? Math.round(s.base_price * s.emergency_multiplier) : s.base_price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Notes for Worker (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Tap leaking in kitchen, please bring spare valve"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Address */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Destination: <strong>{user?.address || 'Peelamedu, Coimbatore'}</strong></span>
              </div>

            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Choose Recommended Worker ({matchedWorkers.length} found)
              </span>

              {matchedWorkers.map((w) => {
                const isSelected = selectedWorker?.id === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWorker(w)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={w.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                          alt={w.name}
                          className="w-11 h-11 rounded-xl object-cover border border-emerald-500"
                        />
                        <div>
                          <div className="font-bold text-sm text-slate-900">{w.name}</div>
                          <div className="text-xs text-slate-500">{w.cooperative_name}</div>
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 mt-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{w.rating?.toFixed(1) || '4.9'}</span>
                            <span className="text-slate-400 font-normal">({w.distance_km || 1.8} km away)</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-700">{w.match_score || 96}% Match</span>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    {w.match_factors && w.match_factors.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        {w.match_factors.slice(0, 3).map((f, i) => (
                          <span key={i} className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
            >
              Cancel
            </button>
          )}

          {step === 1 ? (
            <button
              onClick={handleFetchMatches}
              disabled={loadingMatches}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              <span>{loadingMatches ? 'Finding...' : 'Find Verified Workers'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirmBooking}
              disabled={submitting || !selectedWorker}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              {submitting ? 'Confirming...' : `Confirm & Dispatch`}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
