import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ServiceCategory } from '../../types';
import {
  X,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles,
  MapPin,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerAdded: () => void;
}

export const AddWorkerModal: React.FC<AddWorkerModalProps> = ({
  isOpen,
  onClose,
  onWorkerAdded,
}) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [categoryId, setCategoryId] = useState('');
  const [skillName, setSkillName] = useState('');
  const [experienceYears, setExperienceYears] = useState(4);
  const [bio, setBio] = useState('');
  const [communityId, setCommunityId] = useState('comm-cbe-2');
  const [isEmergencyReady, setIsEmergencyReady] = useState(true);
  const [isIdentityVerified, setIsIdentityVerified] = useState(true);
  const [isMembershipVerified, setIsMembershipVerified] = useState(true);
  const [isSkillVerified, setIsSkillVerified] = useState(true);
  const [isCertVerified, setIsCertVerified] = useState(true);

  useEffect(() => {
    if (isOpen) {
      api.services
        .getCategories()
        .then((res) => {
          const cats = res.categories || [];
          setCategories(cats);
          if (cats.length > 0 && !categoryId) {
            setCategoryId(cats[0].id);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingCats(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.cooperatives.addWorker({
        name,
        email,
        phone,
        categoryId,
        skillName,
        experienceYears,
        bio,
        communityId,
        isEmergencyReady,
        isIdentityVerified,
        isMembershipVerified,
        isSkillVerified,
        isCertVerified,
      });

      confetti({ particleCount: 70, spread: 60 });
      onWorkerAdded();
      onClose();
      // Reset
      setName('');
      setEmail('');
      setPhone('+91 ');
      setSkillName('');
      setBio('');
    } catch (err: any) {
      setError(err.message || 'Failed to onboard worker');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black">Onboard Cooperative Worker</h3>
              <p className="text-xs text-slate-400">
                Register verified tradesperson into society roster with social security enrollment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kannan Sundaram"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. kannan@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94432 18902"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Primary Trade Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Base: ₹{c.base_price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Sub-Skill / Trade Title
              </label>
              <input
                type="text"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. Master Inverter & 3-Phase Specialist"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Community Ward & Dispatch Base
            </label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="comm-cbe-2">Ward 38 — Peelamedu, Coimbatore</option>
              <option value="comm-cbe-1">Ward 23 — RS Puram, Coimbatore</option>
              <option value="comm-cbe-3">Ward 45 — Gandhipuram, Coimbatore</option>
              <option value="comm-chn-1">Ward 102 — Anna Nagar, Chennai</option>
              <option value="comm-mdu-1">Ward 18 — KK Nagar, Madurai</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Artisan Profile & Background Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of craftsman technical background and tools mastered..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* 4-Tier Verification Checklist */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="text-xs font-extrabold text-slate-800 uppercase block">
              Cooperative Compliance & Verification Checklist
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isIdentityVerified}
                  onChange={(e) => setIsIdentityVerified(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-semibold text-slate-700">Aadhaar & Police Verification</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMembershipVerified}
                  onChange={(e) => setIsMembershipVerified(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-semibold text-slate-700">Society Membership Certificate</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSkillVerified}
                  onChange={(e) => setIsSkillVerified(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-semibold text-slate-700">Trade Skill Competency Practical</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmergencyReady}
                  onChange={(e) => setIsEmergencyReady(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-semibold text-slate-700">⚡ 24x7 Emergency SOS Ready</span>
              </label>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium pt-1">
              ✓ Upon onboarding, worker will automatically be enrolled in the ₹3,00,000 Cooperative Hospitalization Shield.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Onboarding...' : 'Confirm & Onboard Worker'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
