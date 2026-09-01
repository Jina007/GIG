import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ShieldCheck,
  Award,
  Sparkles,
  QrCode,
  Download,
  CheckCircle2,
  Building,
  MapPin,
  Calendar,
  Zap,
  Wrench,
  Hammer,
  HeartHandshake,
  Wind,
  Paintbrush,
  Star,
  Shield,
  Phone,
} from 'lucide-react';

interface MembershipCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: {
    id?: string;
    name: string;
    role?: string;
    avatar?: string;
    cooperative_name?: string;
    community_name?: string;
    cooperative_reg_no?: string;
    experience_years?: number;
    skills?: any[];
    primary_trade?: string;
    rating?: number;
    review_count?: number;
    is_emergency_ready?: number;
    phone?: string;
  } | null;
}

interface TradeDetails {
  designation: string;
  passion: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: React.ReactNode;
}

const getTradeDetails = (skillName?: string, primaryTrade?: string): TradeDetails => {
  const text = ((skillName || '') + ' ' + (primaryTrade || '')).toLowerCase();

  if (
    text.includes('plumb') ||
    text.includes('drain') ||
    text.includes('pipe') ||
    text.includes('tap') ||
    text.includes('water') ||
    text.includes('leak')
  ) {
    return {
      designation: 'CERTIFIED MASTER PLUMBER',
      passion: 'Sanitary Engineering, Leak Mitigation & Clean Water Security',
      badgeBg: 'bg-sky-950/80',
      badgeBorder: 'border-sky-400/50',
      badgeText: 'text-sky-300',
      icon: <Wrench className="w-4 h-4 text-sky-400" />,
    };
  }

  if (
    text.includes('electr') ||
    text.includes('wire') ||
    text.includes('phase') ||
    text.includes('inverter') ||
    text.includes('power') ||
    text.includes('circuit')
  ) {
    return {
      designation: 'LICENSED MASTER ELECTRICIAN',
      passion: 'Precision Power Distribution, Circuit Safety & Smart Inverter Systems',
      badgeBg: 'bg-amber-950/80',
      badgeBorder: 'border-amber-400/50',
      badgeText: 'text-amber-300',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
    };
  }

  if (
    text.includes('carpent') ||
    text.includes('wood') ||
    text.includes('furnitur') ||
    text.includes('lock') ||
    text.includes('door')
  ) {
    return {
      designation: 'MASTER ARTISAN & CARPENTER',
      passion: 'Architectural Woodcraft, Custom Cabinetry & Structural Joinery',
      badgeBg: 'bg-amber-950/80',
      badgeBorder: 'border-amber-500/50',
      badgeText: 'text-amber-200',
      icon: <Hammer className="w-4 h-4 text-amber-400" />,
    };
  }

  if (
    text.includes('care') ||
    text.includes('elder') ||
    text.includes('nurse') ||
    text.includes('baby') ||
    text.includes('health')
  ) {
    return {
      designation: 'CERTIFIED COMPASSIONATE CAREGIVER',
      passion: 'Patient Dignity, Mobility Assistance & Holistic Elderly Wellness',
      badgeBg: 'bg-rose-950/80',
      badgeBorder: 'border-rose-400/50',
      badgeText: 'text-rose-300',
      icon: <HeartHandshake className="w-4 h-4 text-rose-400" />,
    };
  }

  if (
    text.includes('clean') ||
    text.includes('sanit') ||
    text.includes('hygiene') ||
    text.includes('pest')
  ) {
    return {
      designation: 'HYGIENE & DEEP SANITIZATION SPECIALIST',
      passion: 'Microbiological Disinfection, Eco Sanitization & Healthy Living Environments',
      badgeBg: 'bg-teal-950/80',
      badgeBorder: 'border-teal-400/50',
      badgeText: 'text-teal-300',
      icon: <Sparkles className="w-4 h-4 text-teal-400" />,
    };
  }

  if (
    text.includes('ac') ||
    text.includes('appliance') ||
    text.includes('cool') ||
    text.includes('refrigerat') ||
    text.includes('hvac')
  ) {
    return {
      designation: 'HVAC & DOMESTIC APPLIANCE SYSTEMS SPECIALIST',
      passion: 'Thermal Energy Optimization, Refrigeration Diagnostics & Eco Cooling',
      badgeBg: 'bg-cyan-950/80',
      badgeBorder: 'border-cyan-400/50',
      badgeText: 'text-cyan-300',
      icon: <Wind className="w-4 h-4 text-cyan-400" />,
    };
  }

  if (text.includes('paint')) {
    return {
      designation: 'MASTER FINISHER & WALL COATING EXPERT',
      passion: 'Surface Restoration, Weatherproof Coating & Premium Aesthetic Finishing',
      badgeBg: 'bg-purple-950/80',
      badgeBorder: 'border-purple-400/50',
      badgeText: 'text-purple-300',
      icon: <Paintbrush className="w-4 h-4 text-purple-400" />,
    };
  }

  return {
    designation: 'CERTIFIED COOPERATIVE CRAFTSMAN',
    passion: 'Artisan Precision, Fair Labour Ethics & Community Infrastructure Maintenance',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-400/50',
    badgeText: 'text-emerald-300',
    icon: <Wrench className="w-4 h-4 text-emerald-400" />,
  };
};

export const MembershipCardModal: React.FC<MembershipCardModalProps> = ({
  isOpen,
  onClose,
  targetUser,
}) => {
  const { user, worker } = useAuth();

  if (!isOpen) return null;

  // Derive worker info either from targetUser (if customer is viewing a worker) or from currently logged-in worker
  const activeWorkerData = targetUser || worker;
  const activeUserData = targetUser || user;

  const workerName = activeWorkerData?.name || activeUserData?.name || 'Ravi Kumar';
  const workerAvatar =
    activeWorkerData?.avatar ||
    activeUserData?.avatar ||
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150';
  const cooperativeName =
    activeWorkerData?.cooperative_name ||
    'Coimbatore Labour & Household Services Cooperative Society Ltd.';
  const cooperativeRegNo = activeWorkerData?.cooperative_reg_no || 'TN-CBE-LCS-1994';
  const communityName = activeWorkerData?.community_name || 'Ward 38 — Peelamedu, Coimbatore';
  const experienceYears = activeWorkerData?.experience_years || 5;

  const skillsList = activeWorkerData?.skills || [];
  const primarySkill =
    skillsList[0]?.skill_name ||
    activeWorkerData?.primary_trade ||
    (workerName.toLowerCase().includes('ravi')
      ? 'Electrician'
      : workerName.toLowerCase().includes('suresh')
      ? 'Plumber'
      : workerName.toLowerCase().includes('murugan')
      ? 'Carpenter'
      : workerName.toLowerCase().includes('anitha')
      ? 'Elder Care'
      : 'Electrician');

  const tradeInfo = getTradeDetails(primarySkill, activeWorkerData?.primary_trade);

  const cardMemberId = activeWorkerData?.id
    ? `TN-COOP-CRAFT-${activeWorkerData.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`
    : 'TN-COOP-CRAFT-948123';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm sm:text-base">
              Official Cooperative Craftsman Identity Card
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
          
          {/* THE OFFICIAL WORKER TRADE MEMBERSHIP CARD */}
          <div className="relative mx-auto w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-400/70 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 transition-all">
            
            {/* Background Emblem Watermark */}
            <div className="absolute right-[-25px] bottom-[-25px] opacity-10 pointer-events-none">
              <Building className="w-64 h-64 text-white" />
            </div>

            {/* Top State Cooperative Header */}
            <div className="flex items-start justify-between border-b border-amber-400/30 pb-3">
              <div>
                <span className="text-[9px] tracking-widest uppercase font-extrabold text-amber-400 block">
                  GOVERNMENT OF TAMIL NADU • DEPT. OF COOPERATION
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-100 tracking-tight">
                  {cooperativeName}
                </h4>
                <span className="text-[9px] text-slate-400 font-mono">
                  Registration No: {cooperativeRegNo} • Apex: TN-FED-01
                </span>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* Worker Avatar + Core Trade Designation */}
            <div className="py-4 space-y-3">
              
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={workerAvatar}
                    alt={workerName}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-white shadow-xs">
                    ✓
                  </span>
                </div>

                <div className="space-y-1">
                  {/* WORKER'S PASSIONATE TRADE DESIGNATION */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide shadow-xs ${tradeInfo.badgeBg} ${tradeInfo.badgeBorder} ${tradeInfo.badgeText}`}
                  >
                    {tradeInfo.icon}
                    <span>{tradeInfo.designation}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {workerName}
                  </h3>

                  <div className="text-[11px] text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{communityName}</span>
                  </div>

                  <div className="text-[10px] font-mono text-amber-300 font-bold">
                    ID: {cardMemberId} • {experienceYears} Yrs Experience
                  </div>
                </div>
              </div>

              {/* Craftsman Passion & Trade Ethos Callout */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px] uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Artisan Craft & Passion:</span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed font-medium italic">
                  "{tradeInfo.passion}"
                </p>
              </div>

            </div>

            {/* Verified Credentials & Social Security Shield */}
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 text-[10px] space-y-1.5 text-slate-200">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Cooperative Protections & Social Security:
                </span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-300 pt-0.5">
                <div>✓ ₹3,00,000 Group Medical Shield</div>
                <div>✓ 88% Direct Payout Fair Wage Guarantee</div>
                <div>✓ Aadhaar & Police Clearance Verified</div>
                <div>✓ 24x7 Emergency SOS Authorized</div>
              </div>
            </div>

            {/* Card Footer with QR Code */}
            <div className="flex items-center justify-between pt-3 border-t border-amber-400/20 mt-3 text-[10px]">
              <div className="space-y-0.5">
                <span className="text-slate-400 block text-[9px]">ISSUED: 15-JAN-2024</span>
                <span className="text-amber-400 font-bold text-[9px]">VALID THRU: 31-DEC-2029</span>
              </div>

              <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 shadow-xs">
                <QrCode className="w-4 h-4 text-amber-300" />
                <span className="font-mono text-[9px] text-slate-200 font-bold tracking-wider">
                  SCAN TO AUTHENTICATE
                </span>
              </div>
            </div>

          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500 font-medium">
              Statutory labour identity card registered under Tamil Nadu Co-operative Societies Act.
            </span>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Download ID</span>
            </button>
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
