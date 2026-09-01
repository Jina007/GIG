import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  Award,
  FileCheck2,
  Zap,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Star,
} from 'lucide-react';
import { TrustBadge } from '../common/TrustBadge';

export const WorkerVerificationTable: React.FC = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchWorkers = async () => {
    const coopId = user?.cooperative_id || 'coop-cbe-1';
    try {
      const data = await api.cooperatives.getWorkers(coopId, filter !== 'all' ? filter : undefined);
      setWorkers(data.workers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [filter, user]);

  const handleToggleVerification = async (
    workerId: string,
    field: 'isIdentityVerified' | 'isMembershipVerified' | 'isSkillVerified' | 'isCertVerified' | 'isEmergencyReady',
    currentVal: number
  ) => {
    setUpdatingId(workerId);
    try {
      await api.cooperatives.verifyWorker({
        workerId,
        [field]: currentVal === 1 ? false : true,
      });
      await fetchWorkers();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.skills?.some((s: any) => s.skill_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Worker Verification Panel
            </h1>
            <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
              Cooperative Governance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Labour Cooperative Societies must directly verify worker identity, society membership, trade skills, and certificates.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search worker or skill..."
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full sm:w-48"
          />

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
            {(['all', 'pending', 'verified'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filter === f ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Workers Verification Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-semibold">Loading worker database...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No workers found matching your query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Craftsman Details</th>
                  <th className="p-4">Trade Skills</th>
                  <th className="p-4 text-center">Identity (KYC)</th>
                  <th className="p-4 text-center">Coop Member</th>
                  <th className="p-4 text-center">Skill Vetted</th>
                  <th className="p-4 text-center">Cert Vetted</th>
                  <th className="p-4 text-center">Emergency Ready</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((w) => {
                  const isFullyVerified =
                    w.is_identity_verified === 1 &&
                    w.is_membership_verified === 1 &&
                    w.is_skill_verified === 1 &&
                    w.is_cert_verified === 1;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              w.avatar ||
                              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
                            }
                            alt={w.name}
                            className="w-10 h-10 rounded-xl object-cover border border-emerald-500 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{w.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {w.community_name || 'Peelamedu'} • {w.experience_years} yrs exp
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px] mt-0.5">
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span>{w.rating?.toFixed(1) || '4.9'}</span>
                              <span className="text-slate-400">({w.total_jobs || 0} jobs)</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Primary Skills */}
                      <td className="p-4">
                        <div className="space-y-1 max-w-xs">
                          {w.skills?.slice(0, 2).map((s: any) => (
                            <span
                              key={s.id}
                              className="inline-block bg-slate-100 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded mr-1"
                            >
                              {s.skill_name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Identity Verified Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleVerification(w.id, 'isIdentityVerified', w.is_identity_verified)}
                          disabled={updatingId === w.id}
                          className={`p-1.5 rounded-lg font-bold transition-transform active:scale-95 ${
                            w.is_identity_verified === 1
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title="Click to toggle identity KYC verification"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Cooperative Membership Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleVerification(w.id, 'isMembershipVerified', w.is_membership_verified)}
                          disabled={updatingId === w.id}
                          className={`p-1.5 rounded-lg font-bold transition-transform active:scale-95 ${
                            w.is_membership_verified === 1
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title="Click to toggle cooperative membership"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Skill Verified Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleVerification(w.id, 'isSkillVerified', w.is_skill_verified)}
                          disabled={updatingId === w.id}
                          className={`p-1.5 rounded-lg font-bold transition-transform active:scale-95 ${
                            w.is_skill_verified === 1
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title="Click to toggle trade skill accreditation"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Cert Verified Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleVerification(w.id, 'isCertVerified', w.is_cert_verified)}
                          disabled={updatingId === w.id}
                          className={`p-1.5 rounded-lg font-bold transition-transform active:scale-95 ${
                            w.is_cert_verified === 1
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title="Click to toggle certificate approval"
                        >
                          <FileCheck2 className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Emergency Ready Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleVerification(w.id, 'isEmergencyReady', w.is_emergency_ready)}
                          disabled={updatingId === w.id}
                          className={`p-1.5 rounded-lg font-bold transition-transform active:scale-95 ${
                            w.is_emergency_ready === 1
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title="Click to toggle emergency rapid responder authorization"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Overall Status Badge */}
                      <td className="p-4 text-right">
                        {isFullyVerified ? (
                          <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">
                            Pending Vetting
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
