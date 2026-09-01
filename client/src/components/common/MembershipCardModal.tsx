import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ShieldCheck,
  Award,
  Sparkles,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  Building,
  MapPin,
  Calendar,
  Zap,
} from 'lucide-react';

interface MembershipCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: {
    name: string;
    role: string;
    avatar?: string;
    cooperative_name?: string;
    community_name?: string;
    cooperative_reg_no?: string;
    id?: string;
  } | null;
}

export const MembershipCardModal: React.FC<MembershipCardModalProps> = ({
  isOpen,
  onClose,
  targetUser,
}) => {
  const { user, worker } = useAuth();
  const [flipped, setFlipped] = useState(false);

  if (!isOpen) return null;

  const displayUser = targetUser || user;
  const isWorker = displayUser?.role === 'worker';
  const memberIdNumber = displayUser?.id
    ? `TN-COOP-${displayUser.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`
    : 'TN-COOP-8492019';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm sm:text-base">
              Official Cooperative Membership Identity
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 bg-slate-100/70">
          
          {/* THE DIGITAL COOPERATIVE CARD */}
          <div className="relative mx-auto w-full max-w-md rounded-3xl shadow-xl overflow-hidden border-2 border-amber-400/60 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 transition-all">
            
            {/* Background Emblem Watermark */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
              <Building className="w-64 h-64 text-white" />
            </div>

            {/* Top Card Header */}
            <div className="flex items-start justify-between border-b border-amber-400/30 pb-3">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-extrabold text-amber-400 block">
                  GOVERNMENT OF TAMIL NADU • DEPT. OF COOPERATION
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-100 tracking-tight">
                  {displayUser?.cooperative_name || 'Coimbatore Labour Cooperative Society Ltd.'}
                </h4>
                <span className="text-[9px] text-slate-400 font-mono">
                  Reg No: {displayUser?.cooperative_reg_no || 'TN-CBE-LCS-1994'} • Apex: TN-FED-01
                </span>
              </div>

              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* Member Info Row */}
            <div className="flex items-center gap-4 py-4">
              <img
                src={displayUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                alt={displayUser?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
              />

              <div className="space-y-1">
                <div className="inline-block px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase">
                  {isWorker ? '★ Verified Cooperative Craftsman' : '★ Registered Community Patron Member'}
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {displayUser?.name}
                </h3>

                <div className="text-[11px] text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{displayUser?.community_name || 'Ward 38, Peelamedu, Coimbatore'}</span>
                </div>

                <div className="text-[11px] font-mono text-amber-300 font-bold">
                  ID: {memberIdNumber}
                </div>
              </div>
            </div>

            {/* Privileges / Security Badge */}
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 text-[10px] space-y-1 text-slate-300">
              <div className="flex items-center justify-between font-bold text-white">
                <span>Cooperative Benefits Active:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid Member
                </span>
              </div>
              <ul className="grid grid-cols-2 gap-1 pt-1 text-[9px] text-slate-200">
                <li>✓ Zero Surge Pricing Guarantee</li>
                <li>✓ Annual Patron Dividend Rights</li>
                <li>✓ Fair Pay Direct Worker Payout</li>
                <li>✓ 24x7 Emergency SOS Access</li>
              </ul>
            </div>

            {/* Card Footer with QR Code */}
            <div className="flex items-center justify-between pt-3 border-t border-amber-400/20 mt-3 text-[10px]">
              <div className="space-y-0.5">
                <span className="text-slate-400 block text-[9px]">ISSUED: 15-JAN-2024</span>
                <span className="text-amber-400 font-bold text-[9px]">EXPIRY: 31-DEC-2029</span>
              </div>

              <div className="flex items-center gap-2 bg-white/15 px-2.5 py-1 rounded-xl border border-white/20">
                <QrCode className="w-4 h-4 text-amber-300" />
                <span className="font-mono text-[9px] text-slate-200">SCAN TO VERIFY</span>
              </div>
            </div>

          </div>

          {/* Download & Print Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500 font-medium">
              Digital certificate backed by Tamil Nadu Cooperative Societies Act.
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save / Print</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Close */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
