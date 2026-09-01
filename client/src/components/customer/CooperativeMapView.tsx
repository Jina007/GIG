import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Worker, Cooperative } from '../../types';
import { MapView } from '../map/MapView';
import { MapPin, ShieldCheck, Filter, Users, Building2, Star } from 'lucide-react';
import { TrustBadge } from '../common/TrustBadge';

interface CooperativeMapViewProps {
  onSelectWorkerForBooking: (worker: Worker) => void;
  onViewTrustProfile: (worker: Worker) => void;
}

export const CooperativeMapView: React.FC<CooperativeMapViewProps> = ({
  onSelectWorkerForBooking,
  onViewTrustProfile,
}) => {
  const { selectedRegionId } = useAuth();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const regionCoordinates: Record<string, [number, number]> = {
    'reg-cbe': [11.0168, 76.9558], // Coimbatore
    'reg-chn': [13.0827, 80.2707], // Chennai
    'reg-mdu': [9.9252, 78.1198], // Madurai
  };

  const center = regionCoordinates[selectedRegionId] || [11.0168, 76.9558];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.geo.getNearbyWorkers({
        lat: center[0],
        lng: center[1],
        radius_km: 25,
        category_id: selectedCategory || undefined,
      }),
      api.cooperatives.getAll(selectedRegionId),
    ])
      .then(([geoRes, coopRes]) => {
        setWorkers(geoRes.workers || []);
        setCooperatives(coopRes.cooperatives || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedRegionId, selectedCategory]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Interactive Cooperative Geo-Spatial Map
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              OpenStreetMap
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover registered Labour Cooperative Societies, verified worker locations, and coverage radii. Off-duty worker locations are privacy-protected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Trade Skills</option>
            <option value="cat-plumbing">Plumbing</option>
            <option value="cat-electrical">Electrical</option>
            <option value="cat-carpentry">Carpentry</option>
            <option value="cat-cleaning">Deep Cleaning</option>
            <option value="cat-elder-care">Elder Care</option>
            <option value="cat-ac-repair">AC Repair</option>
          </select>
        </div>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-md">
        <MapView
          center={center}
          zoom={13}
          workers={workers}
          cooperatives={cooperatives}
          customerLocation={center}
          serviceRadiusKm={15}
          onSelectWorker={onSelectWorkerForBooking}
          onViewTrustProfile={onViewTrustProfile}
          height="580px"
        />
      </div>

      {/* Map Legend & Cooperative Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            🔧
          </div>
          <div>
            <span className="font-bold text-slate-900 block">Verified Cooperative Worker</span>
            <span className="text-slate-500 text-[11px]">Active & ready for dispatch in your ward</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            🏛️
          </div>
          <div>
            <span className="font-bold text-slate-900 block">Cooperative Society HQ</span>
            <span className="text-slate-500 text-[11px]">Elected society grievance & welfare office</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            👤
          </div>
          <div>
            <span className="font-bold text-slate-900 block">Your Service Destination</span>
            <span className="text-slate-500 text-[11px]">Radius shows official 15km service zone</span>
          </div>
        </div>
      </div>

    </div>
  );
};
