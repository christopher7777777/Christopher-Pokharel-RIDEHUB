import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Save, Info, ChevronDown, Trash2, Edit2, Plus } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ValuationRules = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        ccRange: '',
        basePrice: '',
        conditionA: '5',
        conditionB: '15',
        conditionC: '30',
        yearlyDepreciation: '10'
    });

    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await api.get('/api/valuation');
            setRules(res.data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch valuation rules');
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.ccRange || !formData.basePrice) {
            return toast.error('Please fill required fields');
        }

        setSubmitting(true);
        try {
            await api.post('/api/valuation', formData);
            toast.success(editingId ? 'Rule updated successfully!' : 'Rule saved successfully!');
            setFormData({
                ccRange: '',
                basePrice: '',
                conditionA: '5',
                conditionB: '15',
                conditionC: '30',
                yearlyDepreciation: '10'
            });
            setEditingId(null);
            fetchRules();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save rule');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (rule) => {
        setFormData({
            ccRange: rule.ccRange,
            basePrice: rule.basePrice,
            conditionA: rule.conditionA,
            conditionB: rule.conditionB,
            conditionC: rule.conditionC,
            yearlyDepreciation: rule.yearlyDepreciation
        });
        setEditingId(rule._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this rule?')) return;

        try {
            await api.delete(`/api/valuation/${id}`);
            toast.success('Rule deleted successfully');
            fetchRules();
        } catch (error) {
            toast.error('Failed to delete rule');
        }
    };

    const resetForm = () => {
        setFormData({
            ccRange: '',
            basePrice: '',
            conditionA: '5',
            conditionB: '15',
            conditionC: '30',
            yearlyDepreciation: '10'
        });
        setEditingId(null);
    };

    return (
        <AdminLayout>
            <div className="py-8 px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-10 px-2 flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Valuation Rules</h1>
                        <p className="text-sm font-medium text-slate-500 italic mt-1">Configure pricing and depreciation rules for motorcycles</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Add New Rule Form */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50">
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                    {editingId ? 'Edit Rule' : 'Add New Rule'}
                                </h2>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Rule Configuration</p>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Engine CC Range *</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:border-orange-500 focus:bg-white transition-all text-slate-800 font-semibold appearance-none cursor-pointer outline-none shadow-sm"
                                            value={formData.ccRange}
                                            onChange={(e) => setFormData({ ...formData, ccRange: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled>Select CC Range</option>
                                            <option value="below-125">Below 125cc</option>
                                            <option value="125-200">125cc - 200cc</option>
                                            <option value="200-400">200cc - 400cc</option>
                                            <option value="above-400">Above 400cc</option>
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Base Price *</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold border-r border-slate-200 pr-4 mr-4">Rs</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-20 pr-5 py-4 focus:border-orange-500 focus:bg-white text-slate-800 font-semibold outline-none shadow-sm transition-all"
                                            value={formData.basePrice}
                                            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Depreciation Penalties (%)</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {['Excellent', 'Good', 'Fair'].map((cond, idx) => {
                                            const field = idx === 0 ? 'conditionA' : idx === 1 ? 'conditionB' : 'conditionC';
                                            return (
                                                <div key={cond} className="space-y-2">
                                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{cond} Condition</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:border-orange-500 focus:bg-white text-slate-800 font-semibold outline-none transition-all shadow-sm"
                                                            value={formData[field]}
                                                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                                            required
                                                        />
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Yearly Depreciation *</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:border-orange-500 focus:bg-white text-slate-800 font-semibold outline-none transition-all shadow-sm"
                                            value={formData.yearlyDepreciation}
                                            onChange={(e) => setFormData({ ...formData, yearlyDepreciation: e.target.value })}
                                            required
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">% / Year</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-orange-600/20"
                                >
                                    {submitting ? 'SAVING...' : (
                                        <>
                                            <Save size={20} />
                                            {editingId ? 'UPDATE RULE' : 'SAVE RULE'}
                                        </>
                                    )}
                                </button>
                                
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
                                    >
                                        CANCEL EDIT
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Right: Saved Matrix & Info */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                                <div>
                                    <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Stored Valuation Matrix</h3>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase mt-1">Live active rules</p>
                                </div>
                                <span className="text-[10px] font-bold bg-slate-900 text-white px-4 py-1.5 rounded-full shadow-sm">
                                    {rules.length} RULES
                                </span>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {loading ? (
                                    <div className="p-20 flex justify-center">
                                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : rules.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <p className="text-slate-400 font-bold italic">No pricing rules defined yet.</p>
                                    </div>
                                ) : (
                                    rules.map((rule) => (
                                        <div key={rule._id} className="p-10 hover:bg-slate-50/50 transition-all group relative">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <h4 className="text-3xl font-bold text-slate-900 capitalize tracking-tighter">
                                                            {rule.ccRange.replace('-', ' ')}
                                                        </h4>
                                                        <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl">
                                                            Rs {rule.basePrice.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> E: {rule.conditionA}%</span>
                                                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> G: {rule.conditionB}%</span>
                                                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-500 rounded-full"></div> F: {rule.conditionC}%</span>
                                                        <div className="h-4 w-[1px] bg-slate-200"></div>
                                                        <span className="text-slate-800">Yearly: {rule.yearlyDepreciation}%</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleEdit(rule)}
                                                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-orange-600 hover:shadow-lg rounded-2xl transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(rule._id)}
                                                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:shadow-lg rounded-2xl transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Info / Automated Systems */}
                        <div className="bg-[#f0f9ff] border-2 border-[#e0f2fe] rounded-3xl p-8 flex items-start gap-6 shadow-sm">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                                <Info size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1 uppercase tracking-tight">Automated Systems</h4>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                    Changes to these rules will immediately affect new bike listings. Current valuation calculations will be recalculated upon metadata updates.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ValuationRules;
