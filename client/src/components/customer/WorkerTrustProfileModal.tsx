import React, { useEffect, useState } from 'react';
import { Worker } from '../../types';
import { api } from '../../services/api';
import {
  ShieldCheck,
  Star,
  UserCheck,
  Award,
  FileCheck2,
  HeartHandshake,
  CheckCircle2,
  X,
  MapPin,
  Briefcase,
  CreditCard,
} from 'lucide-react';
import { TrustBadge } from '../common/TrustBadge';
import { MembershipCardModal } from '../common/MembershipCardModal';

interface WorkerTrustProfileModalProps {
  workerId: string | null;
  onClose: () => void;
  onBookNow?: (worker: Worker) => void;
}

export const WorkerTrustProfileModal: React.FC<WorkerTrustProfileModalProps> = ({
  workerId,
  onClose,
  onBookNow,
}) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMemberCardModal, setShowMemberCardModal] = useState(false);

  useEffect(() => {
    if (!workerId) return;
    setLoading(true);
    api.workers
      .getTrustProfile(workerId)
      .then((data) => setProfileData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [workerId]);

  if (!workerId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {!loading && profileData && (
            <div className="flex items-center gap-4">
              <img
                src={profileData.worker.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                alt={profileData.worker.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400"
              />
              <div>
                <h3 className="text-xl font-extrabold">{profileData.worker.name}</h3>
                <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  {profileData.worker.cooperative_name}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {profileData.worker.rating.toFixed(1)} ({profileData.worker.review_count} reviews)
                  </span>
                  <span>• {profileData.worker.experience_years} Yrs Exp</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        {!loading && profileData ? (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            
            {/* 4 Cooperative Verification Checks */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-2">
              <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide block">
                ✓ Cooperative Trust Credentials
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-800">
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-emerald-100 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Identity KYC Verified</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-emerald-100 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cooperative Member</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-emerald-100 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Trade Skill Certified</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-emerald-100 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Safety Trained (2026)</span>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xl font-black text-slate-900">{profileData.worker.total_jobs}</div>
                <div className="text-[11px] text-slate-500 font-medium">Jobs in Ward</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xl font-black text-purple-700">{profileData.worker.repeat_customers_count}</div>
                <div className="text-[11px] text-slate-500 font-medium">Repeat Customers</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xl font-black text-emerald-700">0</div>
                <div className="text-[11px] text-slate-500 font-medium">Complaints</div>
              </div>
            </div>

            {/* Social Security & Insurance */}
            <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-purple-950 font-bold">
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                <span>Active Health & Accident Insurance Cover</span>
              </div>
              <span className="font-extrabold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                ₹3,00,000 Active
              </span>
            </div>

            {/* Bio */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase mb-1 block">Craftsman Background</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {profileData.worker.bio}
              </p>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold text-xs hover:text-slate-900">
              Close
            </button>
            {profileData && (
              <button
                onClick={() => setShowMemberCardModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>View Cooperative ID Card</span>
              </button>
            )}
          </div>

          {onBookNow && profileData && (
            <button
              onClick={() => {
                onClose();
                onBookNow(profileData.worker);
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              Book {profileData.worker.name.split(' ')[0]}
            </button>
          )}
        </div>

      </div>

      {showMemberCardModal && profileData && (
        <MembershipCardModal
          isOpen={showMemberCardModal}
          onClose={() => setShowMemberCardModal(false)}
          targetUser={{
            id: profileData.worker.id,
            name: profileData.worker.name,
            role: 'worker',
            avatar: profileData.worker.avatar,
            cooperative_name: profileData.worker.cooperative_name,
            community_name: profileData.worker.community_name,
            cooperative_reg_no: profileData.worker.cooperative_reg_no,
          }}
        />
      )}

    </div>
  );
};
