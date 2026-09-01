import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Users,
  ShieldCheck,
  Briefcase,
  DollarSign,
  HeartHandshake,
  Star,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface CooperativeDashboardProps {
  onNavigateToVerification?: () => void;
  onNavigateToComplaints?: () => void;
  onNavigateToForecast?: () => void;
}

const COLORS = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#dc2626', '#0891b2'];

export const CooperativeDashboard: React.FC<CooperativeDashboardProps> = ({
  onNavigateToVerification,
  onNavigateToComplaints,
  onNavigateToForecast,
}) => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const coopId = user?.cooperative_id || 'coop-cbe-1';
    api.cooperatives
      .getStats(coopId)
      .then((data) => setStatsData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading || !statsData) {
    return <div className="py-20 text-center text-slate-400 font-semibold">Loading Cooperative Society Dashboard...</div>;
  }

  const { cooperative, kpis, charts } = statsData;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* Society Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{cooperative.name}</h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                Active Society
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Registration No: <strong>{cooperative.registration_no}</strong> • Est. {cooperative.established_year}
            </p>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex items-center gap-2">
          {kpis.pendingVerifications > 0 && onNavigateToVerification && (
            <button
              onClick={onNavigateToVerification}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Verify Workers ({kpis.pendingVerifications})</span>
            </button>
          )}

          {onNavigateToForecast && (
            <button
              onClick={onNavigateToForecast}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Demand Forecast</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Workers</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{kpis.totalWorkers}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">{kpis.activeWorkers} active today</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Pending Vetting</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{kpis.pendingVerifications}</div>
          <span className="text-[10px] text-amber-700 font-semibold">Requires review</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Completed Jobs</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{kpis.completedJobs}</div>
          <span className="text-[10px] text-blue-700 font-semibold">This cycle</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Coop Welfare Pool</span>
          <div className="text-2xl font-black text-purple-700 mt-1">₹{kpis.cooperativeFund}</div>
          <span className="text-[10px] text-purple-700 font-semibold">7% Member Welfare</span>
        </div>
      </div>

      {/* Clean Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Jobs by Category Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">Jobs by Trade Category</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.jobsByCategory}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs by Community Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">Jobs by Community Density</h3>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.jobsByCommunity} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count">
                  {charts.jobsByCommunity.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
