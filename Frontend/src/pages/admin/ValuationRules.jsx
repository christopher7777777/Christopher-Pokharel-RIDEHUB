import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
    Save, Info, ChevronDown, Trash2, Edit2, Plus, 
    Calculator, Settings, Bike, CheckCircle2, 
    ThumbsUp, AlertCircle, Calendar, LayoutGrid, RotateCcw
} from 'lucide-react';
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
    
    // Refs for one-click focus
    const inputA = useRef(null);
    const inputB = useRef(null);
    const inputC = useRef(null);
    const inputY = useRef(null);

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
            resetForm();
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
            <div className="bg-[#eff1f5] min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section - Reduced Gap */}
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shadow-sm">
                            <Calculator className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[#111827] tracking-tight">Valuation Rules</h1>
                            <p className="text-[#6b7280] text-[13px] font-medium mt-0.5">Configure pricing and depreciation rules for motorcycles</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Form Section */}
                        <div className="lg:col-span-5 space-y-5">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-[#e5e7eb] p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <Settings className="text-orange-600" size={18} />
                                    <div>
                                        <h2 className="text-lg font-black text-[#111827]">
                                            {editingId ? 'Edit Rule' : 'Add New Rule'}
                                        </h2>
                                        <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-widest">Set up a new valuation rule</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    {/* CC Range Field */}
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-[#374151] ml-1">Engine CC Range *</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center pointer-events-none">
                                                <Bike className="text-orange-600" size={16} />
                                            </div>
                                            <select
                                                className="w-full h-12 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl pl-16 pr-10 focus:border-orange-500 focus:bg-white outline-none transition-all text-[#111827] font-bold appearance-none cursor-pointer text-sm"
                                                value={formData.ccRange}
                                                onChange={(e) => setFormData({ ...formData, ccRange: e.target.value })}
                                                required
                                            >
                                                <option value="" disabled>Select CC Range</option>
                                                <option value="below-125">Below 125 CC</option>
                                                <option value="125-200">125 200 CC</option>
                                                <option value="200-400">200 400 CC</option>
                                                <option value="above-400">Above 400 CC</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" size={16} />
                                        </div>
                                    </div>

                                    {/* Base Price Field - RS icon instead of $ */}
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-[#374151] ml-1">Base Price *</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center pointer-events-none">
                                                <span className="text-orange-600 font-black text-[10px]">RS</span>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full h-12 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl pl-16 pr-12 focus:border-orange-500 focus:bg-white outline-none transition-all text-[#111827] font-bold text-sm"
                                                value={formData.basePrice}
                                                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                                required
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9ca3af] font-black text-[10px]">RS</span>
                                        </div>
                                        <p className="text-[10px] text-[#9ca3af] font-bold px-1 uppercase tracking-tighter">Initial price for this CC range</p>
                                    </div>

                                    {/* Penalties Section */}
                                    <div className="pt-2">
                                        <div className="bg-[#eff2ff] px-6 py-2 rounded-xl mb-5">
                                            <h3 className="text-xs font-black text-[#4338ca] tracking-widest text-center uppercase">Depreciation Penalties (%)</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Excellent */}
                                            <div 
                                                className="space-y-2 cursor-pointer group"
                                                onClick={() => inputA.current?.focus()}
                                            >
                                                <label className="text-[10px] font-bold text-[#6b7280] block text-center uppercase tracking-tighter">Excellent</label>
                                                <div className="relative">
                                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#10b981]">
                                                        <CheckCircle2 size={14} />
                                                    </div>
                                                    <input
                                                        ref={inputA}
                                                        type="number"
                                                        className="w-full h-10 bg-[#ecfdf5] border border-[#d1fae5] rounded-lg pl-8 pr-5 text-center text-[#065f46] font-black text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                                                        value={formData.conditionA}
                                                        onChange={(e) => setFormData({ ...formData, conditionA: e.target.value })}
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6366f1] text-[9px] font-bold">%</span>
                                                </div>
                                            </div>
                                            {/* Good */}
                                            <div 
                                                className="space-y-2 cursor-pointer group"
                                                onClick={() => inputB.current?.focus()}
                                            >
                                                <label className="text-[10px] font-bold text-[#6b7280] block text-center uppercase tracking-tighter">Good</label>
                                                <div className="relative">
                                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#3b82f6]">
                                                        <ThumbsUp size={14} />
                                                    </div>
                                                    <input
                                                        ref={inputB}
                                                        type="number"
                                                        className="w-full h-10 bg-[#eff6ff] border border-[#dbeafe] rounded-lg pl-8 pr-5 text-center text-[#1e40af] font-black text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                                                        value={formData.conditionB}
                                                        onChange={(e) => setFormData({ ...formData, conditionB: e.target.value })}
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6366f1] text-[9px] font-bold">%</span>
                                                </div>
                                            </div>
                                            {/* Fair */}
                                            <div 
                                                className="space-y-2 cursor-pointer group"
                                                onClick={() => inputC.current?.focus()}
                                            >
                                                <label className="text-[10px] font-bold text-[#6b7280] block text-center uppercase tracking-tighter">Fair</label>
                                                <div className="relative">
                                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#f59e0b]">
                                                        <AlertCircle size={14} />
                                                    </div>
                                                    <input
                                                        ref={inputC}
                                                        type="number"
                                                        className="w-full h-10 bg-[#fffbeb] border border-[#fef3c7] rounded-lg pl-8 pr-5 text-center text-[#92400e] font-black text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all"
                                                        value={formData.conditionC}
                                                        onChange={(e) => setFormData({ ...formData, conditionC: e.target.value })}
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6366f1] text-[9px] font-bold">%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Yearly Depreciation Field - Click to fill behavior */}
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-[#374151] ml-1">Yearly Depreciation *</label>
                                        <div 
                                            className="relative cursor-pointer"
                                            onClick={() => inputY.current?.focus()}
                                        >
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center pointer-events-none">
                                                <Calendar className="text-blue-600" size={16} />
                                            </div>
                                            <input
                                                ref={inputY}
                                                type="number"
                                                className="w-full h-12 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl pl-16 pr-24 focus:border-blue-500 focus:bg-white outline-none transition-all text-[#111827] font-bold text-sm"
                                                value={formData.yearlyDepreciation}
                                                onChange={(e) => setFormData({ ...formData, yearlyDepreciation: e.target.value })}
                                                required
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9ca3af] font-black text-[9px] uppercase tracking-tighter">% per Year</span>
                                        </div>
                                        <p className="text-[10px] text-[#9ca3af] font-bold px-1 uppercase tracking-tighter">Annual depreciation rate applied to the base price</p>
                                    </div>

                                    {/* Buttons Section */}
                                    <div className="flex items-center gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex-1 h-12 bg-white border border-[#e5e7eb] text-[#374151] font-black rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw size={14} />
                                            Reset
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-[2] h-12 bg-gradient-to-r from-[#f97316] to-[#ef4444] text-white font-black rounded-xl shadow-lg shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    {editingId ? 'Save Changes' : 'Save Rule'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Matrix & Info */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-[#e5e7eb] p-6 md:p-8 min-h-[450px]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <LayoutGrid className="text-blue-600" size={18} />
                                        <div>
                                            <h3 className="text-lg font-black text-[#111827]">Valuation Matrix</h3>
                                            <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-widest mt-0.5">Live active rules</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-tighter border border-blue-100">
                                        {rules.length} Rules
                                    </span>
                                </div>

                                <div className="space-y-5">
                                    {loading ? (
                                        <div className="py-20 flex items-center justify-center">
                                            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : rules.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <Plus className="text-gray-200 mx-auto mb-3" size={40} />
                                            <p className="text-[#9ca3af] font-black text-xs uppercase tracking-widest">No segments defined</p>
                                        </div>
                                    ) : (
                                        rules.map((rule, index) => (
                                            <div key={rule._id} className="relative group bg-[#f8fafc] rounded-2xl p-6 border border-[#e5e7eb] hover:border-orange-200 transition-all overflow-hidden shadow-sm hover:shadow-md">
                                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${index % 2 === 0 ? 'bg-[#10b981]' : 'bg-[#3b82f6]'}`}></div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-4 flex-1">
                                                        <h4 className="text-xl font-black text-[#111827] uppercase tracking-tight">
                                                            {rule.ccRange.replace('-', ' ')} CC
                                                        </h4>
                                                        
                                                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black text-[#f97316] uppercase tracking-[0.1em]">Base Price</p>
                                                                <div className="text-lg font-black text-[#111827]">
                                                                    <span className="text-xs font-bold mr-1 opacity-40">RS</span>
                                                                    {rule.basePrice.toLocaleString()}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black text-[#6b7280] uppercase tracking-[0.1em]">Penalties</p>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] font-bold text-[#10b981]">E: {rule.conditionA}%</span>
                                                                    <span className="text-[10px] font-bold text-[#3b82f6]">G: {rule.conditionB}%</span>
                                                                    <span className="text-[10px] font-bold text-[#6b7280]">F: {rule.conditionC}%</span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black text-[#6b7280] uppercase tracking-[0.1em]">Yearly</p>
                                                                <div className="bg-[#eef2ff] px-2 py-0.5 rounded-md">
                                                                    <span className="text-xs font-black text-[#4338ca]">{rule.yearlyDepreciation}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button 
                                                            onClick={() => handleEdit(rule)}
                                                            className="w-9 h-9 bg-white border border-[#e5e7eb] text-[#9ca3af] hover:text-orange-600 rounded-lg flex items-center justify-center shadow-sm transition-all"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(rule._id)}
                                                            className="w-9 h-9 bg-white border border-[#e5e7eb] text-[#9ca3af] hover:text-red-600 rounded-lg flex items-center justify-center shadow-sm transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#f0f6ff] border border-[#dbeafe] rounded-2xl p-6 flex items-start gap-5">
                                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                    <Info className="text-blue-600" size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[13px] font-black text-[#111827] uppercase tracking-tight">System Notice</h4>
                                    <p className="text-[#64748b] text-[11px] font-bold leading-relaxed uppercase tracking-tighter">
                                        Valuation rules are applied globally and affect all listed motorcycle appraisals instantly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ValuationRules;
