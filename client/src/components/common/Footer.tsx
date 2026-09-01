import React from 'react';
import { ShieldCheck, HeartHandshake, PhoneCall, Award, Landmark, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-slate-800">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Cooperative-Owned Model</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero private venture commission extraction. 88% goes directly to workers, 7% to member healthcare & welfare funds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">4-Tier Verified Workers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Identity, Cooperative Membership, Trade Skills, and Safety Certifications vetted directly by Labour Cooperative Societies.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Worker Social Security</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive health cover, accident insurance (PMSBY), tool subsidies, and NSDC skill upskilling for all gig members.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base">Sahakari Gig</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              SIH26089 — Cooperative Gig Services Platform for Household & Community Services.
            </p>
            <span className="inline-block text-[11px] font-semibold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
              Tamil Nadu State Labour Apex
            </span>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Cooperative Societies</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Coimbatore Labour Co-op (TN-CBE-1994)</li>
              <li>Chennai Labour Service Co-op (TN-CHN-1988)</li>
              <li>Madurai Labour Co-op (TN-MDU-2002)</li>
              <li>State Labour Welfare Board</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Core Services</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Emergency Plumbing & Burst Pipe</li>
              <li>MCB & Electrical Short Circuit</li>
              <li>Certified Caregiver & Elder Companion</li>
              <li>Community Drain & Sanitation</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Emergency & Mediation</h5>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-semibold">Toll-Free: 1800-425-COOP (2667)</span>
              </div>
              <p className="text-[11px]">24x7 Rapid Dispatch for community emergencies and dispute arbitration.</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Sahakari Gig (SIH26089). Prototype for Smart India Hackathon.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Transparency Report</span>
            <span className="hover:text-slate-400 cursor-pointer">Welfare Fund Charter</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy & Data Protection</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
