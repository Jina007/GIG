import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';
import {
  User,
  Wrench,
  Building,
  Globe,
  Sparkles,
  Users,
  X,
  MapPin,
  ChevronDown,
} from 'lucide-react';

interface MemberPersona {
  id: string;
  name: string;
  email: string;
  role: string;
  category: 'customers' | 'workers' | 'coop_admins' | 'fed_admins';
  title: string;
  location: string;
  avatar: string;
}

export const PersonaBanner: React.FC = () => {
  const { user, demoLogin, isLoading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'customers' | 'workers' | 'coop_admins' | 'fed_admins'>('all');

  const primaryPersonas = [
    { id: 'priya', name: 'Priya', role: 'Customer', icon: User, email: 'priya@example.com' },
    { id: 'ravi', name: 'Ravi', role: 'Plumber', icon: Wrench, email: 'ravi@example.com' },
    { id: 'meena', name: 'Meena', role: 'Coop Admin', icon: Building, email: 'meena@example.com' },
    { id: 'arumugam', name: 'Arumugam', role: 'Federation Apex', icon: Globe, email: 'arumugam@example.com' },
  ];

  const allMembers: MemberPersona[] = [
    // CUSTOMERS
    {
      id: 'priya',
      name: 'Priya Raman',
      email: 'priya@example.com',
      role: 'Customer',
      category: 'customers',
      title: 'Peelamedu Resident',
      location: 'Peelamedu, Coimbatore',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
    {
      id: 'karthik',
      name: 'Karthik Sundar',
      email: 'karthik@example.com',
      role: 'Customer',
      category: 'customers',
      title: 'Anna Nagar Resident',
      location: 'Anna Nagar, Chennai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      id: 'deepa',
      name: 'Deepa Venkatesh',
      email: 'deepa@example.com',
      role: 'Customer',
      category: 'customers',
      title: 'KK Nagar Resident',
      location: 'KK Nagar, Madurai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      id: 'vikram',
      name: 'Vikram Chandran',
      email: 'vikram@example.com',
      role: 'Customer',
      category: 'customers',
      title: 'RS Puram Resident',
      location: 'RS Puram, Coimbatore',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },

    // WORKERS (TRADES)
    {
      id: 'ravi',
      name: 'Ravi Kumar',
      email: 'ravi@example.com',
      role: 'Worker',
      category: 'workers',
      title: 'Master Plumber (4.9⭐, 342 jobs)',
      location: 'Coimbatore Labour Cooperative',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    },
    {
      id: 'suresh',
      name: 'Suresh Babu',
      email: 'suresh@example.com',
      role: 'Worker',
      category: 'workers',
      title: 'Master Electrician (4.8⭐, 280 jobs)',
      location: 'Coimbatore Labour Cooperative',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    },
    {
      id: 'anitha',
      name: 'Anitha Mary',
      email: 'anitha@example.com',
      role: 'Worker',
      category: 'workers',
      title: 'Elder Care Specialist & Nurse (4.95⭐)',
      location: 'Chennai Labour Service Cooperative',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
    },
    {
      id: 'murugan',
      name: 'Murugan K.',
      email: 'murugan@example.com',
      role: 'Worker',
      category: 'workers',
      title: 'Carpenter & Locksmith (4.85⭐, 210 jobs)',
      location: 'Madurai Labour Cooperative Society',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    },
    {
      id: 'lakshmi',
      name: 'Lakshmi Priya',
      email: 'lakshmi@example.com',
      role: 'Worker',
      category: 'workers',
      title: 'Deep Cleaning & Sanitization (4.9⭐)',
      location: 'Coimbatore Labour Cooperative',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
    },

    // COOPERATIVE ADMINS
    {
      id: 'meena',
      name: 'Meena Sundaram',
      email: 'meena@example.com',
      role: 'Cooperative Admin',
      category: 'coop_admins',
      title: 'Coimbatore Labour Cooperative Society Ltd.',
      location: 'Coimbatore District',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
    {
      id: 'senthil',
      name: 'Senthil Nathan',
      email: 'senthil@example.com',
      role: 'Cooperative Admin',
      category: 'coop_admins',
      title: 'Chennai Labour Service Cooperative Ltd.',
      location: 'Chennai Metropolitan District',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
    {
      id: 'balaji',
      name: 'Balaji Krishnan',
      email: 'balaji@example.com',
      role: 'Cooperative Admin',
      category: 'coop_admins',
      title: 'Madurai Labour Cooperative Society Ltd.',
      location: 'Madurai Heritage District',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },

    // FEDERATION ADMINS (APEX GOVERNANCE & PLATFORM REGISTRY)
    {
      id: 'arumugam',
      name: 'Arumugam P.',
      email: 'arumugam@example.com',
      role: 'Federation Admin',
      category: 'fed_admins',
      title: 'State Apex Director & Platform Governance',
      location: 'Tamil Nadu Labour Federation',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    {
      id: 'kavitha',
      name: 'Kavitha Rajan',
      email: 'kavitha@example.com',
      role: 'Federation Admin',
      category: 'fed_admins',
      title: 'State Social Security & Welfare Auditor',
      location: 'Tamil Nadu Labour Federation',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  ];

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  const filteredMembers = allMembers.filter((m) => {
    if (selectedCategoryTab === 'all') return true;
    return m.category === selectedCategoryTab;
  });

  return (
    <>
      <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          
          {/* Quick Role Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Switch Role:
            </span>

            {primaryPersonas.map((p) => {
              const Icon = p.icon;
              const isCurrent = user?.email === p.email;

              return (
                <button
                  key={p.id}
                  onClick={() => demoLogin(p.id)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{p.name}</span>
                  <span className="text-[10px] opacity-75 hidden md:inline">({p.role})</span>
                </button>
              );
            })}

            {/* "All Members" button */}
            <button
              onClick={() => setShowMemberModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-colors"
            >
              <Users className="w-3 h-3 text-indigo-300" />
              <span>All Members ({allMembers.length})</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1">
            <div className="flex bg-slate-800 p-0.5 rounded-full">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                    language === l.code
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ALL MEMBERS MODAL */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold">Select Demo Persona & Role</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    {allMembers.length} Members Available
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Switch across customers, trade workers, cooperative admins, and state federation apex authorities.
                </p>
              </div>

              <button
                onClick={() => setShowMemberModal(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
              {[
                { id: 'all', label: `All Roles (${allMembers.length})` },
                { id: 'customers', label: '👥 Customers (4)' },
                { id: 'workers', label: '🔧 Workers / Trades (5)' },
                { id: 'coop_admins', label: '🏛️ Coop Admins (3)' },
                { id: 'fed_admins', label: '🌐 Federation Apex (2)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategoryTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    selectedCategoryTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Member Cards Grid */}
            <div className="p-6 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMembers.map((member) => {
                const isCurrent = user?.email === member.email;
                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      demoLogin(member.id);
                      setShowMemberModal(false);
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-xl object-cover border border-emerald-500 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900">{member.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-emerald-700 leading-tight">
                          {member.title}
                        </p>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {member.location}
                        </span>
                      </div>
                    </div>

                    <button
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      {isCurrent ? 'Current' : 'Switch'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Switching instantly updates all views, permissions, and location context.</span>
              <button
                onClick={() => setShowMemberModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
