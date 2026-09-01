import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  HeartHandshake,
  ShieldCheck,
  Award,
  FileCheck2,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  Building,
  GraduationCap,
} from 'lucide-react';

export const WorkerWelfareView: React.FC = () => {
  const { user, worker } = useAuth();
  const [welfareData, setWelfareData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!worker?.id && !user?.id) return;
    api.welfare
      .getWorkerWelfare(worker?.id || user?.id || 'wrk-ravi-001')
      .then((data) => setWelfareData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [worker, user]);

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-700/40">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30 mb-3">
          <HeartHandshake className="w-4 h-4" />
          <span>Labour Cooperative Social Security Mission</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Worker Welfare & Social Security Dashboard
        </h1>
        <p className="text-sm text-purple-200 max-w-2xl mt-1">
          Unlike private venture platforms, our Labour Cooperative Society directly provides comprehensive health insurance, accident cover, tool subsidies, and NSDC certified skill training.
        </p>
      </div>

      {/* Social Security Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Insurance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Health Insurance</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            Active Cover
          </div>
          <div className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            ₹3,00,000 Cashless Hospitalization
          </div>
        </div>

        {/* Welfare Fund */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Welfare Fund Status</span>
            <HeartHandshake className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            Enrolled Member
          </div>
          <div className="text-xs text-purple-700 font-bold bg-purple-50 p-2 rounded-lg border border-purple-200">
            ₹21,000 Disbursed to Date
          </div>
        </div>

        {/* Training */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-bold tracking-wider">Certified Courses</span>
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            3 Courses Completed
          </div>
          <div className="text-xs text-blue-700 font-bold bg-blue-50 p-2 rounded-lg border border-blue-200">
            NSDC & Safety Vetted
          </div>
        </div>

      </div>

      {/* Active Welfare & Insurance Policies List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Active Social Security Schemes</h3>
            <p className="text-xs text-slate-500">
              Maintained and renewed by Coimbatore Labour Cooperative Society Ltd.
            </p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full">
            All Verified Active
          </span>
        </div>

        <div className="space-y-3">
          {welfareData?.welfareRecords?.map((rec: any) => (
            <div
              key={rec.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{rec.scheme_name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Policy / Grant No: {rec.policy_no}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Valid Till: {rec.validity_date || '2027-12-31'}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block font-medium">Coverage / Grant</span>
                <span className="font-black text-base text-purple-800">
                  ₹{rec.coverage_amount ? rec.coverage_amount.toLocaleString('en-IN') : '2,00,000'}
                </span>
                {rec.benefits_disbursed > 0 && (
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    (₹{rec.benefits_disbursed} claimed/disbursed)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Certifications & Safety Training */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Training & Skill Upgradation Records</h3>
            <p className="text-xs text-slate-500">
              National Skill Development Corporation (NSDC) and Government accredited safety courses
            </p>
          </div>
          <Award className="w-5 h-5 text-amber-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {welfareData?.trainingRecords?.map((tr: any) => (
            <div key={tr.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Certified Completed</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">{tr.training_name}</h4>
              <p className="text-xs text-slate-600">{tr.institution}</p>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-amber-200/60 flex justify-between">
                <span>Cert: {tr.certificate_no}</span>
                <span>{tr.completed_date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
