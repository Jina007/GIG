import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Worker, Booking } from '../../types';
import { Users, Briefcase, Zap, Star, ShieldCheck, CheckCircle2, Clock, MapPin } from 'lucide-react';

export const JobAllocationMonitor: React.FC = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const coopId = user?.cooperative_id || 'coop-cbe-1';
    try {
      const [workersRes, bookingsRes] = await Promise.all([
        api.cooperatives.getWorkers(coopId),
        api.bookings.getAll({ limit: 30 }),
      ]);
      setWorkers(workersRes.workers || []);
      setActiveBookings(
        bookingsRes.bookings?.filter((b: Booking) =>
          ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
        ) || []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Workforce Allocation & Live Capacity Monitor
          </h1>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
            Real-Time Society Dispatch
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor real-time worker capacity, dispatch queues, and prevent worker burnout across Coimbatore wards.
        </p>
      </div>

      {/* Grid: Capacity Overview & Active Dispatches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workers Capacity Roster */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">
              Cooperative Workforce Roster ({workers.length} Members)
            </h3>
            <span className="text-xs text-emerald-700 font-bold">
              {workers.filter((w) => w.is_available === 1).length} Online for Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
            {workers.map((w) => (
              <div
                key={w.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={w.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                      alt={w.name}
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900 leading-tight">{w.name}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">{w.skills?.[0]?.skill_name || 'Craftsman'}</div>
                    </div>
                  </div>

                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      w.is_available === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                    }`}
                    title={w.is_available === 1 ? 'Available' : 'Off duty'}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{w.rating?.toFixed(1) || '4.9'}</span>
                  </div>
                  <span>{w.total_jobs || 0} jobs done</span>
                  <span
                    className={`font-bold ${
                      w.active_workload === 0
                        ? 'text-emerald-700'
                        : w.active_workload >= 2
                        ? 'text-amber-700'
                        : 'text-blue-700'
                    }`}
                  >
                    Queue: {w.active_workload} tasks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Active Field Dispatches */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900">
              Live Field Dispatches ({activeBookings.length})
            </h3>
            <p className="text-xs text-slate-500">Ongoing citizen service jobs</p>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto">
            {activeBookings.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No live dispatches in progress</div>
            ) : (
              activeBookings.map((b) => (
                <div key={b.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[160px]">
                      {b.problem_title || b.service_name}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Craftsman: <strong>{b.worker_name || 'Pending'}</strong> • ₹{b.total_amount}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Destination: {b.customer_address}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
