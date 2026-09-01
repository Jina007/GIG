import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Worker } from '../../types';
import { Heart, Star, ShieldCheck, Wrench, ChevronRight } from 'lucide-react';
import { TrustBadge } from '../common/TrustBadge';

interface FavoriteWorkersViewProps {
  onSelectWorkerForBooking: (worker: Worker) => void;
  onViewTrustProfile: (worker: Worker) => void;
}

export const FavoriteWorkersView: React.FC<FavoriteWorkersViewProps> = ({
  onSelectWorkerForBooking,
  onViewTrustProfile,
}) => {
  const [favorites, setFavorites] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reviews
      .getFavorites()
      .then((data) => setFavorites(data.favorites || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Trusted Favorite Workers
          </h1>
          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
            Repeat Bookings
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quickly re-book craftsmen who previously delivered exceptional service at your residence.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-semibold">Loading favorite workers...</div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-800">No Favorite Workers Saved Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you complete a service, check "Add to trusted favorite workers" to easily rebook them anytime.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favorites.map((worker) => (
            <div key={worker.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={worker.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                    alt={worker.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{worker.name}</h3>
                    <p className="text-xs text-emerald-700 font-semibold">{worker.cooperative_name}</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{worker.rating?.toFixed(1) || '4.9'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  <TrustBadge type="coop" size="sm" label="Verified Member" />
                  <TrustBadge type="repeat" size="sm" label="Trusted Craftsman" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onViewTrustProfile(worker)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Trust Sheet
                </button>
                <button
                  onClick={() => onSelectWorkerForBooking(worker)}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Rebook
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
