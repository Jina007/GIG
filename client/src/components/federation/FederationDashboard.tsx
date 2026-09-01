import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Globe2,
  Building2,
  Users,
  Briefcase,
  DollarSign,
  HeartHandshake,
  Star,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const FederationDashboard: React.FC = () => {
  const [fedData, setFedData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [overviewRes, recRes] = await Promise.all([
        api.federation.getOverview(),
        api.federation.getRecommendations(),
      ]);
      setFedData(overviewRes);
      setRecommendations(recRes.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (recId: string, action: 'APPROVED' | 'REJECTED' | 'DEPLOYED') => {
    setActionLoading(recId);
    try {
      await api.federation.takeActionOnRecommendation(recId, action);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !fedData) {
    return <div className="py-20 text-center text-slate-400 font-semibold">Loading State Federation Hub...</div>;
  }

  const { federation, kpis, cooperativesComparison, categoryDemandChart } = fedData;

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      
      {/* Federation Apex Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
            <Globe2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black">{federation.name}</h1>
              <span className="bg-purple-500/20 text-purple-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-purple-400/30">
                State Apex Directorate
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-mono">
              Federation Code: {federation.code} • Contact: {federation.contact_email}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervising primary Labour Cooperative Societies across Coimbatore, Chennai, Madurai, and other regional districts.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-right shrink-0">
          <span className="text-[10px] text-purple-200 uppercase font-bold block">Regional Health Index</span>
          <span className="text-2xl font-black text-emerald-400">98.4% Compliance</span>
          <span className="text-[10px] text-slate-300 block">All Workers Insured</span>
        </div>
      </div>

      {/* Regional KPI Cards (Prompt Spec Section 16) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cooperatives Affiliated</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{kpis.totalCooperatives} Societies</div>
          <span className="text-[10px] text-purple-700 font-bold mt-1 block">Statewide Coverage</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered Workers</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{kpis.totalWorkers}</div>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">100% Social Security Enrolled</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Jobs Underway</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{kpis.activeJobs}</div>
          <span className="text-[10px] text-blue-700 font-bold mt-1 block">Real-Time Field Dispatch</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed This Month</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{kpis.completedJobsMonth}</div>
          <span className="text-[10px] text-slate-500 font-bold mt-1 block">₹{kpis.grossVolume.toLocaleString('en-IN')} Gross Volume</span>
        </div>

      </div>

      {/* Cross-Cooperative Comparison Performance Matrix (Prompt Section 16) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              Cross-Cooperative Performance Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Comparative metrics across Coimbatore, Chennai, and Madurai Labour Societies
            </p>
          </div>
          <span className="bg-purple-100 text-purple-900 font-bold text-xs px-3 py-1 rounded-full">
            State Federation Oversight
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Cooperative Society</th>
                <th className="p-3.5">District / Region</th>
                <th className="p-3.5 text-center">Total Workers</th>
                <th className="p-3.5 text-center">Active Now</th>
                <th className="p-3.5 text-center">Completed Jobs</th>
                <th className="p-3.5 text-center">Gross Revenue</th>
                <th className="p-3.5 text-center">Avg Rating</th>
                <th className="p-3.5 text-center">Welfare Policies</th>
                <th className="p-3.5 text-right">Disputes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cooperativesComparison.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-extrabold text-slate-900 text-sm">{c.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Reg: {c.registration_no}</div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-700">{c.district_name}</td>
                  <td className="p-3.5 text-center font-bold text-slate-900">{c.total_workers}</td>
                  <td className="p-3.5 text-center font-extrabold text-emerald-600">{c.active_workers}</td>
                  <td className="p-3.5 text-center font-bold text-blue-700">{c.completed_jobs}</td>
                  <td className="p-3.5 text-center font-black text-slate-900">₹{c.total_revenue.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center gap-1 font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-amber-500" /> {c.avg_rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-bold text-purple-700">{c.welfare_records_count} active</td>
                  <td className="p-3.5 text-right">
                    {c.complaints_count > 0 ? (
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold text-[10px]">
                        {c.complaints_count} open
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                        0 Clean
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Inter-Cooperative Workforce Allocation Decisions */}
      <div className="bg-white border-2 border-purple-400 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              Federation Workforce Deployment Approvals
            </h3>
            <p className="text-xs text-slate-500">
              State-level arbitration for inter-cooperative temporary worker shifts to meet seasonal surges
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>

        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-base text-purple-950">
                    Deployment to {rec.target_community_name} ({rec.category_name || 'Plumbing'})
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{rec.reason}</p>
                </div>
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                    rec.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {rec.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-purple-200/60 text-xs">
                <span className="text-purple-900 font-semibold">
                  Recommended Cross-Shift: +{rec.recommended_deployment_count} Workers
                </span>

                <div className="flex items-center gap-2">
                  {rec.status === 'PENDING' && (
                    <button
                      onClick={() => handleAction(rec.id, 'APPROVED')}
                      disabled={actionLoading === rec.id}
                      className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs"
                    >
                      Authorize Inter-Cooperative Shift
                    </button>
                  )}
                  {rec.status === 'APPROVED' && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Shift Authorized by State Federation
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
