import React, { useEffect, useState } from 'react';
import { Booking, BookingStatus, Invoice } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldCheck,
  Zap,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  FileText,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { MapView } from '../map/MapView';
import { InvoiceModal } from './InvoiceModal';
import { ComplaintModal } from './ComplaintModal';
import confetti from 'canvas-confetti';

interface BookingDetailsViewProps {
  bookingId: string;
  onBack: () => void;
}

export const BookingDetailsView: React.FC<BookingDetailsViewProps> = ({ bookingId, onBack }) => {
  const { t } = useLanguage();
  const { demoLogin, user } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // Review Form
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('Extremely punctual, polite, and skilled craftsman! Proud to support our local cooperative.');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [paying, setPaying] = useState(false);

  const fetchBooking = async () => {
    try {
      const data = await api.bookings.getById(bookingId);
      setBooking(data.booking);
      setInvoice(data.invoice || null);
      if (data.review) setReviewSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // High-frequency polling (1.5s) for instant real-time status synchronization between customer & worker
    const interval = setInterval(fetchBooking, 1500);
    return () => clearInterval(interval);
  }, [bookingId]);

  const handleProcessPayment = async () => {
    setPaying(true);
    try {
      const res = await api.payments.process(bookingId, 'UPI_SANDBOX');
      setInvoice(res.invoice);
      confetti({ particleCount: 70, spread: 60 });
      await fetchBooking();
      setShowInvoiceModal(true);
    } catch (err: any) {
      alert(err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.reviews.submit({
        bookingId,
        rating,
        comment,
      });
      setReviewSubmitted(true);
      confetti({ particleCount: 50, spread: 50 });
      await fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Review failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !booking) {
    return <div className="py-20 text-center text-slate-400 font-semibold">Loading Booking...</div>;
  }

  const steps: { key: BookingStatus; label: string }[] = [
    { key: 'REQUESTED', label: '1. Requested' },
    { key: 'ACCEPTED', label: '2. Accepted' },
    { key: 'ON_THE_WAY', label: '3. On Way' },
    { key: 'ARRIVED', label: '4. Arrived' },
    { key: 'IN_PROGRESS', label: '5. In Progress' },
    { key: 'COMPLETED', label: '6. Done' },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === booking.status);

  // Helper to extract persona key from email (e.g. 'ravi@example.com' -> 'ravi')
  const workerPersonaKey = booking.worker_email ? booking.worker_email.split('@')[0] : 'ravi';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </button>

        <div className="flex items-center gap-2">
          {booking.is_emergency === 1 && (
            <span className="bg-red-100 text-red-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-red-600" />
              <span>Emergency SOS</span>
            </span>
          )}
          <span className="font-mono text-xs text-slate-400 font-bold">#{booking.booking_code}</span>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE ROLE HANDOFF BANNER (FOR EASY EVALUATION / MULTI-ROLE SWITCH)
          ========================================================================= */}
      {booking.status === 'REQUESTED' ? (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-amber-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase flex items-center gap-1.5 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Step 1: Request Dispatched — Waiting for {booking.worker_name}</span>
            </span>
            <span className="text-xs font-bold text-amber-900">Live Device Sync Active</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Your service request has reached <strong>{booking.worker_name}</strong>'s terminal. Switch to {booking.worker_name}'s profile to accept the job!
            </p>

            <button
              onClick={() => demoLogin(workerPersonaKey)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>👉 Switch to {booking.worker_name?.split(' ')[0]} to Accept</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      ) : booking.status !== 'COMPLETED' ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 animate-ping shrink-0" />
            <span className="font-bold text-emerald-950">
              Live Progress Synced: {booking.worker_name} is currently in <strong>{booking.status.replace(/_/g, ' ')}</strong> state.
            </span>
          </div>

          <button
            onClick={() => demoLogin(workerPersonaKey)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-all active:scale-95"
          >
            <span>Switch to {booking.worker_name?.split(' ')[0]}'s Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}

      {/* Progress Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Real-Time Dispatch Stepper</span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">
              {booking.status === 'REQUESTED'
                ? `Waiting for ${booking.worker_name?.split(' ')[0]} to Accept Request...`
                : booking.status === 'ACCEPTED'
                ? `Accepted by ${booking.worker_name}! Preparing Dispatch Route`
                : booking.status === 'ON_THE_WAY'
                ? `${booking.worker_name} is On The Way (Est. 8 mins)`
                : booking.status === 'ARRIVED'
                ? `${booking.worker_name} has Arrived at Your Location!`
                : booking.status === 'IN_PROGRESS'
                ? `Work in Progress by ${booking.worker_name}`
                : booking.status === 'COMPLETED'
                ? 'Service Completed! Settle Bill & Rate Craftsman'
                : booking.status.replace(/_/g, ' ')}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {new Date(booking.scheduled_at).toLocaleDateString()}
          </span>
        </div>

        {/* Progress Stepper Bar */}
        <div className="grid grid-cols-6 gap-1.5 pt-2">
          {steps.map((s, idx) => {
            const isDone = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            return (
              <div key={s.key} className="space-y-1 text-center">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 ring-2 ring-emerald-300 animate-pulse'
                      : isDone
                      ? 'bg-emerald-600'
                      : 'bg-slate-200'
                  }`}
                />
                <span className={`text-[10px] block font-bold truncate ${isCurrent ? 'text-emerald-700 font-extrabold' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Worker & Location Map Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Worker Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase block">Assigned Craftsman</span>
            
            <div className="flex items-center gap-3.5">
              <img
                src={booking.worker_avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                alt={booking.worker_name || 'Worker'}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shrink-0"
              />
              <div>
                <div className="font-extrabold text-base text-slate-900">{booking.worker_name}</div>
                <div className="text-xs font-semibold text-emerald-700">{booking.cooperative_name}</div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{booking.worker_rating?.toFixed(1) || '4.9'}</span>
                  <span className="text-slate-400 font-normal">({booking.worker_total_jobs || 0} jobs)</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">{booking.worker_phone || '+91 97890 12345'}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Verified Coop Line
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500">
            📍 Destination: <strong>{booking.customer_address}</strong>
          </div>
        </div>

        {/* Map Preview */}
        <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-xs h-64 overflow-hidden">
          <MapView
            center={[booking.customer_lat || 11.0264, booking.customer_lng || 76.9984]}
            zoom={14}
            customerLocation={[booking.customer_lat || 11.0264, booking.customer_lng || 76.9984]}
            workers={
              booking.worker_id
                ? [
                    {
                      id: booking.worker_id,
                      user_id: 'w-1',
                      name: booking.worker_name || 'Worker',
                      current_lat: (booking.customer_lat || 11.0264) + 0.005,
                      current_lng: (booking.customer_lng || 76.9984) + 0.004,
                      rating: booking.worker_rating || 4.9,
                      total_jobs: 100,
                      cooperative_name: booking.cooperative_name || '',
                      is_emergency_ready: booking.is_emergency,
                      is_available: 1,
                      experience_years: 5,
                      bio: '',
                      is_identity_verified: 1,
                      is_membership_verified: 1,
                      is_skill_verified: 1,
                      is_cert_verified: 1,
                      service_radius_km: 10,
                      review_count: 50,
                      repeat_customers_count: 30,
                      active_workload: 1,
                      phone: '',
                      cooperative_id: booking.cooperative_id,
                    },
                  ]
                : []
            }
            height="100%"
          />
        </div>

      </div>

      {/* Bill & Payment Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Service Bill</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">₹{booking.total_amount}</div>
          </div>

          {booking.payment_status === 'PAID' ? (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settled & Paid
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
              Payment Pending
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {invoice && (
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>View & Print Invoice</span>
              </button>
            )}

            <button
              onClick={() => setShowComplaintModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Need Help / File Dispute
            </button>
          </div>

          {booking.payment_status !== 'PAID' && (
            <button
              onClick={handleProcessPayment}
              disabled={paying || booking.status !== 'COMPLETED'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm shadow-md transition-all active:scale-95 ${
                booking.status === 'COMPLETED'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{paying ? 'Processing...' : `Pay ₹${booking.total_amount} via UPI`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {booking.status === 'COMPLETED' && !reviewSubmitted && (
        <form onSubmit={handleSubmitReview} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">
            Rate {booking.worker_name?.split(' ')[0]}'s Work
          </h3>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                />
              </button>
            ))}
            <span className="font-bold text-base text-amber-600 ml-2">{rating}.0 / 5.0</span>
          </div>

          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share brief feedback with your community..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={submittingReview}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
          >
            {submittingReview ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>
      )}

      {/* Invoice Modal */}
      <InvoiceModal invoice={invoice} onClose={() => setShowInvoiceModal(false)} />

      {/* Complaint Modal */}
      {showComplaintModal && (
        <ComplaintModal
          bookingId={bookingId}
          onClose={() => setShowComplaintModal(false)}
          onSuccess={() => fetchBooking()}
        />
      )}

    </div>
  );
};
