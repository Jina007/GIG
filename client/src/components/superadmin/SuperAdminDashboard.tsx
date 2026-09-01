import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ServiceCategory } from '../../types';
import { Sparkles, Plus, Settings, ShieldCheck, Database, Wrench, CheckCircle2 } from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Wrench');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(350);
  const [isEmergency, setIsEmergency] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCats = () => {
    api.services.getCategories().then((data) => setCategories(data.categories || []));
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    try {
      await api.services.createCategory({
        name,
        icon,
        description,
        base_price: basePrice,
        is_emergency_supported: isEmergency,
      });
      setShowAddCatModal(false);
      setName('');
      setDescription('');
      fetchCats();
    } catch (err: any) {
      alert(err.message || 'Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30 mb-2">
            <Settings className="w-4 h-4" />
            <span>State Apex Trade Registry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">Master Service Categories Registry</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            State-level service trades, base pricing controls, and emergency SOS classification across Tamil Nadu cooperatives.
          </p>
        </div>

        <button
          onClick={() => setShowAddCatModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service Category</span>
        </button>
      </div>

      {/* Service Categories Manager */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Active Service Categories ({categories.length})</h3>
            <p className="text-xs text-slate-500">Service trades approved across Tamil Nadu Labour Cooperatives</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{c.name}</span>
                  {c.is_emergency_supported === 1 && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      ⚡ SOS
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mt-1">{c.description}</p>
                <span className="font-bold text-xs text-emerald-700 mt-2 block">Base: ₹{c.base_price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">Add Service Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Solar Panel Servicing"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="emg-check"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <label htmlFor="emg-check" className="font-bold text-slate-700">
                  Allow Rapid Emergency Dispatch for this trade
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold"
                >
                  {submitting ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
