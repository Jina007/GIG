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
  CreditCard,
  UserPlus,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEmergencyClick: () => void;
  onOpenMemberCard?: () => void;
  onOpenAddWorker?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onEmergencyClick,
  onOpenMemberCard,
  onOpenAddWorker,
}) => {
  const {
    user,
    selectedRegionId,
    setSelectedRegionId,
    notifications,
    unreadNotifsCount,
    markAllNotifsRead,
  } = useAuth();
  const { t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        { id: 'member-card', label: 'Member Card', icon: CreditCard },
      ];
    }
    if (user.role === 'worker') {
      return [
        { id: 'worker-dashboard', label: 'Jobs & Live Queue', icon: Briefcase },
        { id: 'worker-welfare', label: 'Welfare & Insurance', icon: HeartHandshake },
        { id: 'announcements', label: 'Society Notices', icon: Megaphone },
        { id: 'member-card', label: 'Member Card', icon: CreditCard },
      ];
    }
    if (user.role === 'cooperative_admin') {
      return [
        { id: 'coop-dashboard', label: 'Dashboard', icon: Building2 },
        { id: 'coop-verification', label: 'Verify Workers', icon: ShieldCheck },
        { id: 'coop-add-worker', label: '+ Onboard Worker', icon: UserPlus },
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

  const handleLinkClick = (linkId: string) => {
    if (linkId === 'member-card') {
      if (onOpenMemberCard) onOpenMemberCard();
    } else if (linkId === 'coop-add-worker') {
      if (onOpenAddWorker) onOpenAddWorker();
    } else {
      setActiveTab(linkId);
    }
    setMobileMenuOpen(false);
  };

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
                  onClick={() => handleLinkClick(link.id)}
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
          <div className="flex items-center gap-2">
            
            {/* Direct Member Card Button for Customers and Workers */}
            {(!user || user.role === 'customer' || user.role === 'worker') && (
              <button
                onClick={onOpenMemberCard}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95 shrink-0"
                title="View Official Cooperative Member Identity Card"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Member Card</span>
              </button>
            )}

            {/* Quick Onboard Worker Button for Cooperative Admins */}
            {user?.role === 'cooperative_admin' && (
              <button
                onClick={onOpenAddWorker}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
                title="Onboard New Society Worker"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Onboard Worker</span>
              </button>
            )}

            {/* Region Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
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
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">SOS</span>
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

              {/* Notification dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-extrabold text-xs text-slate-900">Notifications</span>
                    <button
                      onClick={markAllNotifsRead}
                      className="text-[10px] font-bold text-emerald-700 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto mt-2 text-xs">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-400">No notifications</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="py-2 space-y-0.5">
                          <p className="font-bold text-slate-900">{n.title}</p>
                          <p className="text-slate-500 text-[11px] leading-tight">{n.message}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                alt={user?.name}
                className="w-8 h-8 rounded-xl object-cover border border-emerald-500 shrink-0"
              />
              <span className="text-xs font-extrabold text-slate-800 hidden xl:inline">
                {user?.name.split(' ')[0]}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
