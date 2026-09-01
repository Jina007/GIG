import React, { useState, useEffect } from 'react';
import { ServiceCategory, Worker } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Home,
  HeartHandshake,
  Baby,
  Car,
  Trees,
  Tv,
  Wind,
  Wrench,
  Trash2,
  Building2,
  Truck,
  Layers,
  Bug,
  KeyRound,
  ShieldAlert,
  Search,
  Star,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { TrustBadge } from '../common/TrustBadge';

const iconMap: Record<string, any> = {
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Home,
  HeartHandshake,
  Baby,
  Car,
  Trees,
  Tv,
  Wind,
  Wrench,
  Trash2,
  Building2,
  Truck,
  Layers,
  Bug,
  KeyRound,
  ShieldAlert,
};

interface ServiceGridProps {
  onSelectCategory: (category: ServiceCategory) => void;
  onEmergencyClick: () => void;
  onViewTrustProfile: (worker: Worker) => void;
  onSelectWorkerForBooking: (worker: Worker) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  onSelectCategory,
  onEmergencyClick,
  onViewTrustProfile,
  onSelectWorkerForBooking,
}) => {
  const { selectedRegionId } = useAuth();
  const { t } = useLanguage();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredWorkers, setFeaturedWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.services.getCategories(),
      api.workers.getAll({ region_id: selectedRegionId, available_only: 'true' }),
    ])
      .then(([catsData, workersData]) => {
        setCategories(catsData.categories || []);
        setFeaturedWorkers(workersData.workers?.slice(0, 4) || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedRegionId]);

  const filterTabs = [
    { key: 'ALL', label: 'All Services' },
    { key: 'POPULAR', label: '⭐ Popular' },
    { key: 'REPAIR', label: '🔧 Repairs & Electrical' },
    { key: 'CLEANING', label: '✨ Cleaning' },
    { key: 'CARE', label: '❤️ Care & Help' },
    { key: 'EMERGENCY', label: '⚡ Emergency SOS' },
  ];

  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'POPULAR') {
      return ['cat-plumbing', 'cat-electrical', 'cat-ac-repair', 'cat-cleaning', 'cat-carpentry'].includes(c.id);
    }
    if (selectedFilter === 'REPAIR') {
      return ['cat-plumbing', 'cat-electrical', 'cat-carpentry', 'cat-appliance-repair', 'cat-ac-repair', 'cat-technician', 'cat-locksmith'].includes(c.id);
    }
    if (selectedFilter === 'CLEANING') {
      return ['cat-cleaning', 'cat-community-cleaning', 'cat-pest-control', 'cat-water-proofing'].includes(c.id);
    }
    if (selectedFilter === 'CARE') {
      return ['cat-elder-care', 'cat-child-care', 'cat-domestic-help', 'cat-driving', 'cat-gardening'].includes(c.id);
    }
    if (selectedFilter === 'EMERGENCY') {
      return c.is_emergency_supported === 1;
    }
    return true;
  });

  return (
    <div className="space-y-10 pb-16">
      
      {/* Clean, Simple Hero Section */}
      <div className="text-center max-w-2xl mx-auto pt-4 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Local Labour Cooperative Societies</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          What help do you need at home?
        </h1>

        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Book trusted, background-verified local craftsmen. 88% goes directly to workers with guaranteed healthcare & accident insurance.
        </p>

        {/* Clean Search Bar */}
        <div className="pt-2 max-w-lg mx-auto">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plumber, electrician, cleaning, AC..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedFilter(tab.key)}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
              selectedFilter === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Service Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredCategories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Wrench;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="group bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-500 rounded-2xl p-4 transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  {cat.is_emergency_supported === 1 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      ⚡ SOS
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-900 transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-extrabold text-emerald-700">
                  From ₹{cat.base_price}
                </span>
                <span className="font-bold text-slate-400 group-hover:text-emerald-600 flex items-center text-[11px]">
                  Book <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Trusted Workers */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Verified Craftsmen in Your Area
            </h2>
            <p className="text-xs text-slate-500">
              Directly managed and insured by Coimbatore Labour Cooperative Society
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={worker.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                    alt={worker.name}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-500"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{worker.name}</h4>
                    <p className="text-xs font-semibold text-emerald-700">
                      {worker.skills?.[0]?.skill_name || 'Master Craftsman'}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{worker.rating?.toFixed(1) || '4.9'}</span>
                      <span className="text-slate-400 font-normal">({worker.total_jobs || 0} jobs)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  <TrustBadge type="coop" size="sm" label="Coop Member" />
                  <TrustBadge type="skill" size="sm" label="Skill Verified" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onViewTrustProfile(worker)}
                  className="flex-1 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Trust Sheet
                </button>
                <button
                  onClick={() => onSelectWorkerForBooking(worker)}
                  className="flex-1 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Book Worker
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
