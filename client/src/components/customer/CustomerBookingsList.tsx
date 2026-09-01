import React, { useEffect, useState } from 'react';
import { Booking } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, Star, Zap, ChevronRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CustomerBookingsListProps {
  onSelectBooking: (bookingId: string) => void;
  onNewBookingClick: () => void;
}

export const CustomerBookingsList: React.FC<CustomerBookingsListProps> = ({
  onSelectBooking,
  onNewBookingClick,
}) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const fetchBookings = () => {
    api.bookings
      .getAll()
      .then((data) => setBookings(data.bookings || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = bookings.filter((b) => {
    if (activeFilter === 'ACTIVE') {
      return ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status);
    }
    if (activeFilter === 'COMPLETED') return b.status === 'COMPLETED';
    if (activeFilter === 'EMERGENCY') return b.is_emergency === 1;
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Cooperative Service Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track live dispatch, download official invoices, and rate your local cooperative workers
          </p>
        </div>

        <button
          onClick={onNewBookingClick}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          + Request New Service
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { key: 'ALL', label: `All Bookings (${bookings.length})` },
          { key: 'ACTIVE', label: 'Active Dispatches' },
          { key: 'COMPLETED', label: 'Completed & Invoices' },
          { key: 'EMERGENCY', label: '⚡ Emergency SOS' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeFilter === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-semibold">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center space-y-3 p-6">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-800">No service bookings found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Book verified plumbers, electricians, deep cleaning, or elder care directly from your local Labour Cooperative Society.
          </p>
          <button
            onClick={onNewBookingClick}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((booking) => {
            const isLive = ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status);
            return (
              <div
                key={booking.id}
                onClick={() => onSelectBooking(booking.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white hover:shadow-md ${
                  isLive ? 'border-emerald-500/80 shadow-emerald-500/10' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 line-clamp-1">
                        {booking.problem_title || booking.service_name}
                      </span>
                      {booking.is_emergency === 1 && (
                        <span className="bg-red-100 text-red-700 text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase">
                          ⚡ SOS
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">#{booking.booking_code}</span>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      booking.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : isLive
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {t(booking.status, booking.status.replace(/_/g, ' '))}
                  </span>
                </div>

                {/* Worker Preview */}
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                  <img
                    src={
                      booking.worker_avatar ||
                      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
                    }
                    alt={booking.worker_name || 'Worker'}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-500 shrink-0"
                  />
                  <div className="text-xs flex-1">
                    <div className="font-bold text-slate-900">{booking.worker_name || 'Pending Assignment'}</div>
                    <p className="text-[11px] text-slate-500 truncate">{booking.cooperative_name}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 text-[10px] block">Bill Amount</span>
                    <span className="font-extrabold text-emerald-700 text-sm">₹{booking.total_amount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                  <span>{new Date(booking.scheduled_at).toLocaleDateString()}</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {isLive ? 'Track Live Dispatch' : 'View Bill & Details'} <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
