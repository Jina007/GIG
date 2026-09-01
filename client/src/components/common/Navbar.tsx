import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldCheck,
  Bell,
  MapPin,
  Menu,
  X,
  Briefcase,
  Clock,
  Map,
  FileText,
  HeartHandshake,
  Sparkles,
  Building2,
  Globe2,
  Zap,
  Users,
  Megaphone,
  Heart,
  Scale,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEmergencyClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onEmergencyClick }) => {
  const {
    user,
    selectedRegionId,
    setSelectedRegionId,
    notifications,
    unreadNotifsCount,
    markAllNotifsRead,
  } = useAuth();
  const { t } = useLanguage();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const regions = [
    { id: 'reg-cbe', name: 'Coimbatore' },
    { id: 'reg-chn', name: 'Chennai' },
    { id: 'reg-mdu', name: 'Madurai' },
  ];

  const getNavLinks = () => {
    if (!user || user.role === 'customer') {
      return [
        { id: 'services', label: 'Services', icon: Briefcase },
        { id: 'bookings', label: 'My Bookings', icon: Clock },
        { id: 'map', label: 'Explore Map', icon: Map },
        { id: 'favorites', label: 'Favorite Workers', icon: Heart },
        { id: 'complaints', label: 'Support & Disputes', icon: FileText },
      ];
    }
    if (user.role === 'worker') {
      return [
        { id: 'worker-dashboard', label: 'Jobs & Live Queue', icon: Briefcase },
        { id: 'worker-welfare', label: 'Welfare & Insurance', icon: HeartHandshake },
        { id: 'announcements', label: 'Society Notices', icon: Megaphone },
      ];
    }
    if (user.role === 'cooperative_admin') {
      return [
        { id: 'coop-dashboard', label: 'Dashboard', icon: Building2 },
        { id: 'coop-verification', label: 'Verify Workers', icon: ShieldCheck },
        { id: 'coop-allocation', label: 'Workforce Capacity', icon: Users },
        { id: 'ai-forecast', label: 'AI Demand Forecast', icon: Sparkles },
        { id: 'coop-complaints', label: 'Complaints Mediation', icon: FileText },
        { id: 'coop-announcements', label: 'Broadcast Notices', icon: Megaphone },
      ];
    }
    // Federation Admin (State Apex & Platform Governance)
    return [
      { id: 'federation-dashboard', label: 'State Federation', icon: Globe2 },
      { id: 'federation-rebalancing', label: 'Workforce Reallocation', icon: Sparkles },
      { id: 'federation-disputes', label: 'Escalated Disputes', icon: Scale },
      { id: 'federation-categories', label: 'Service Categories', icon: Building2 },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-7 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab(navLinks[0].id)}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  Sahakari Gig
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded uppercase">
                  {user?.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* Region Selector */}
            <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-hidden cursor-pointer text-xs"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Emergency SOS Button (for customers) */}
            {(!user || user.role === 'customer') && (
              <button
                onClick={onEmergencyClick}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span className="hidden sm:inline">Emergency SOS</span>
                <span className="sm:hidden">SOS</span>
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  if (!showNotifs && unreadNotifsCount > 0) markAllNotifsRead();
                }}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-600" />
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Notifications</span>
                    <button onClick={markAllNotifsRead} className="text-emerald-600 font-semibold hover:underline">
                      Mark read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">No notifications</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="p-3 hover:bg-slate-50">
                          <div className="font-bold text-slate-900">{n.title}</div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile avatar */}
            <div className="flex items-center gap-2 pl-1">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-emerald-500"
              />
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
