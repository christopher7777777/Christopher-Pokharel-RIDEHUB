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
            <div className="space-y-8 max-w-5xl mx-auto py-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Valuation Rules</h1>
                        <p className="text-sm font-medium text-slate-500 italic">Configure pricing and depreciation rules for motorcycles</p>
                    </div>
                    {editingId && (
                        <button
                            onClick={resetForm}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                        >
                            <Plus size={18} />
                            ADD NEW RULE
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Config form */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-200/60 overflow-hidden sticky top-8">
                            <div className="px-8 py-6 border-b border-slate-100">
                                <h2 className="text-lg font-black text-slate-800">
                                    {editingId ? 'Edit Rule' : 'Add New Rule'}
                                </h2>
                                <p className="text-sm font-medium text-slate-400">Set parameters for the valuation engine</p>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700">Engine CC Range *</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 focus:border-orange-500 transition-all text-slate-800 font-bold appearance-none cursor-pointer"
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
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700">Base Price *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:border-orange-500 text-slate-800 font-bold"
                                            value={formData.basePrice}
                                            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Condition Depreciation (%)</h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        {['Excellent', 'Good', 'Fair'].map((cond, idx) => {
                                            const field = idx === 0 ? 'conditionA' : idx === 1 ? 'conditionB' : 'conditionC';
                                            return (
                                                <div key={cond} className="space-y-1.5">
                                                    <label className="text-[11px] font-black text-slate-500 uppercase">{cond}</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:border-orange-500 text-slate-800 font-bold"
                                                            value={formData[field]}
                                                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                                            required
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700">Yearly Depreciation (%) *</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3.5 focus:border-orange-500 text-slate-800 font-bold"
                                            value={formData.yearlyDepreciation}
                                            onChange={(e) => setFormData({ ...formData, yearlyDepreciation: e.target.value })}
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? 'PROCESSING...' : (
                                        <>
                                            <Save size={20} />
                                            {editingId ? 'UPDATE RULE' : 'SAVE RULE'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Saved rules */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-200/60 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Stored Valuation Matrix</h3>
                                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">
                                    {rules.length} Active Rules
                                </span>
                            </div>

                            <div className="divide-y divide-slate-100 font-medium italic">
                                {loading ? (
                                    <div className="p-12 text-center text-slate-400 font-bold">Loading matrix...</div>
                                ) : rules.length === 0 ? (
                                    <div className="p-12 text-center text-slate-300 italic font-medium">
                                        No rules configured yet.
                                    </div>
                                ) : (
                                    rules.map((rule) => (
                                        <div key={rule._id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-xl font-black text-slate-900 capitalize tracking-tight not-italic">
                                                            {rule.ccRange.replace('-', ' ')}
                                                        </h4>
                                                        <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md not-italic">
                                                            ${rule.basePrice}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-bold uppercase tracking-tighter">
                                                        <span>E: {rule.conditionA}%</span>
                                                        <span>G: {rule.conditionB}%</span>
                                                        <span>F: {rule.conditionC}%</span>
                                                        <span className="text-slate-400">|</span>
                                                        <span>Yearly: {rule.yearlyDepreciation}%</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(rule)}
                                                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:shadow-sm rounded-xl transition-all"
                                                        title="Edit Rule"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(rule._id)}
                                                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:shadow-sm rounded-xl transition-all"
                                                        title="Delete Rule"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
                            <div className="p-2 bg-emerald-100/50 rounded-xl">
                                <Info className="text-emerald-600" size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-emerald-800 mb-0.5">Automated Systems</h4>
                                <p className="text-xs font-medium text-emerald-700/80 leading-relaxed">
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
