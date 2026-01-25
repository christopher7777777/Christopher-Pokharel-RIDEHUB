import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Save, AlertCircle, Info, Settings } from 'lucide-react';

const ValuationRules = () => {
    const [rules, setRules] = useState({
        baseMultiplier: 0.85,
        depreciationPerYear: 0.05,
        conditionMultipliers: {
            excellent: 1.1,
            good: 1.0,
            fair: 0.9,
            poor: 0.7
        },
        serviceHistoryBonus: 0.05
    });

    const handleSave = () => {
        // Implementation for saving rules to backend will go here
        alert('Rules updated successfully!');
    };

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-4xl">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Valuation Rules</h1>
                        <p className="text-slate-500">Configure the algorithms used for automatic bike valuation.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-600/20"
                    >
                        <Save size={18} />
                        SAVE CHANGES
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* General Settings */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-4">
                            <Settings size={20} className="text-orange-600" />
                            General Algorithm Variables
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Base Market Multiplier</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all text-slate-800 font-medium"
                                        value={rules.baseMultiplier}
                                        onChange={(e) => setRules({ ...rules, baseMultiplier: parseFloat(e.target.value) })}
                                    />
                                    <Info size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                                <p className="text-xs text-slate-400 mt-2 italic">Standard multiplier applied to bluebook value.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Annual Depreciation Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all text-slate-800 font-medium"
                                    value={rules.depreciationPerYear}
                                    onChange={(e) => setRules({ ...rules, depreciationPerYear: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Condition Multipliers */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-4">
                            <AlertCircle size={20} className="text-orange-600" />
                            Condition Multipliers
                        </div>

                        <div className="space-y-4">
                            {Object.entries(rules.conditionMultipliers).map(([condition, value]) => (
                                <div key={condition} className="flex items-center justify-between gap-4">
                                    <label className="text-sm font-semibold text-slate-700 capitalize">{condition}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all text-slate-800 font-medium text-right"
                                        value={value}
                                        onChange={(e) => setRules({
                                            ...rules,
                                            conditionMultipliers: {
                                                ...rules.conditionMultipliers,
                                                [condition]: parseFloat(e.target.value)
                                            }
                                        })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl flex gap-4 items-start">
                    <Info className="text-orange-600 shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-orange-900 mb-1">How it works</h4>
                        <p className="text-orange-800/80 text-sm leading-relaxed">
                            The final valuation is calculated as: <br />
                            <code className="bg-white/50 px-2 py-0.5 rounded font-mono text-orange-600 font-bold">
                                (Bluebook Value × Rules.BaseMultiplier) × Rules.ConditionFactor - (Age × Rules.Depreciation)
                            </code>
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ValuationRules;
