import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, FileText, User, MapPin, Briefcase, Phone } from 'lucide-react';
import api from '../../utils/api';

const FinanceModal = ({ isOpen, onClose, bike, loanDetails }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [personalDetails, setPersonalDetails] = useState({
        fullName: '',
        occupation: '',
        monthlyIncome: '',
        contactNumber: '',
        currentAddress: ''
    });

    const [documents, setDocuments] = useState({
        citizenship: null,
        salarySlip: null,
        lalPurja: null
    });

    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPersonalDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setDocuments(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!disclaimerAccepted) {
            setError('Please accept the legal disclaimer to proceed.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append('bikeId', bike._id);
            formData.append('loanDetails', JSON.stringify(loanDetails));
            formData.append('personalDetails', JSON.stringify(personalDetails));

            if (documents.citizenship) formData.append('citizenship', documents.citizenship);
            if (documents.salarySlip) formData.append('salarySlip', documents.salarySlip);
            if (documents.lalPurja) formData.append('lalPurja', documents.lalPurja);

            await api.post('/api/emi/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                window.location.reload(); // Refresh to show FinancePending status
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Finance Application</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{bike.name} • RS {loanDetails.monthlyEMI.toLocaleString()}/mo</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 border border-gray-100 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {success ? (
                    <div className="p-16 text-center">
                        <div className="w-24 h-24 bg-green-50 rounded-[30px] flex items-center justify-center mx-auto mb-8 border border-green-100">
                            <CheckCircle2 size={48} className="text-green-500 animate-bounce" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">Application Sent!</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Your finance application has been received. Our team will review your documents and forward them to our partner banks.
                            The bike status has been set to <span className="text-orange-600 font-bold">FinancePending</span>.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-100">
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-700">
                                <AlertTriangle size={20} />
                                <p className="text-xs font-black uppercase tracking-tight">{error}</p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Personal Details Section */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <User size={14} /> Part 1: Personal Details
                                </h4>

                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Full Name (As per Citizenship)</label>
                                        <div className="relative">
                                            <input
                                                type="text" name="fullName" required
                                                value={personalDetails.fullName} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-semibold text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                                placeholder="e.g. Christopher Pokharel"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Occupation</label>
                                            <input
                                                type="text" name="occupation" required
                                                value={personalDetails.occupation} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-semibold text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                                placeholder="Software Engineer"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Monthly Income (RS)</label>
                                            <input
                                                type="number" name="monthlyIncome" required
                                                value={personalDetails.monthlyIncome} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border-none rounded-2xl p-4 font-semibold text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                                placeholder="50000"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Contact Number</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-4 font-black text-sm text-orange-600">+977</span>
                                            <input
                                                type="tel" name="contactNumber" required
                                                value={personalDetails.contactNumber} onChange={handleInputChange}
                                                className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-14 font-semibold text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                                placeholder="98XXXXXXXX"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Current Address</label>
                                        <input
                                            type="text" name="currentAddress" required
                                            value={personalDetails.currentAddress} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-semibold text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                            placeholder="Kathmandu, Nepal"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Document Upload Section */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Upload size={14} /> Part 2: Required Documents
                                </h4>

                                <div className="space-y-4">
                                    {[
                                        { id: 'citizenship', label: 'Citizenship (Front/Back)', required: true },
                                        { id: 'salarySlip', label: 'Salary Slip / Bank Statemant', required: true },
                                        { id: 'lalPurja', label: 'Lal Purja (Optional)', required: false }
                                    ].map((doc) => (
                                        <div key={doc.id} className="relative group">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">
                                                {doc.label} {doc.required && <span className="text-red-500">*</span>}
                                            </label>
                                            <label className={`flex flex-col items-center justify-center w-full min-h-[80px] border-2 border-dashed rounded-[20px] cursor-pointer transition-all ${documents[doc.id] ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100 hover:border-orange-200 hover:bg-orange-50/10'}`}>
                                                <div className="p-4 flex flex-col items-center">
                                                    {documents[doc.id] ? (
                                                        <>
                                                            <CheckCircle2 size={24} className="text-green-500 mb-1" />
                                                            <p className="text-xs font-black text-green-600 uppercase truncate max-w-[150px]">{documents[doc.id].name.slice(0, 15)}...</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={18} className="text-gray-400 mb-1 group-hover:text-orange-500 group-hover:scale-110 transition-all" />
                                                            <p className="text-xs font-black text-gray-400 uppercase group-hover:text-orange-600">Click To Upload</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input type="file" name={doc.id} accept="image/*,.pdf" onChange={handleFileChange} hidden required={doc.required} />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-12 bg-gray-50 rounded-[30px] p-6 border border-gray-100">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <input
                                        type="checkbox" required
                                        checked={disclaimerAccepted}
                                        onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                                        className="w-5 h-5 rounded-md text-orange-600 focus:ring-orange-500 cursor-pointer"
                                    />
                                </div>
                                <div className="text-sm text-gray-500 leading-relaxed">
                                    <p className="font-black text-gray-900 mb-2 uppercase tracking-widest">Legal Disclaimer & Agreement</p>
                                    <p>
                                        I understand that RideHub is not a financial institution and does not provide loans directly.
                                        This application serves to facilitate communication with licensed third-party banks in Nepal.
                                        I authorize RideHub to forward my details and documents to its partner financial institutions for verification and processing.
                                        Loan approval and final terms are subject to the bank's policies and NRB regulations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 flex items-center justify-between gap-6">
                            <div className="hidden md:block">
                                <p className="text-base font-black text-gray-900">RS {loanDetails.monthlyEMI.toLocaleString()} <span className="text-xs text-gray-400 uppercase">/ month</span></p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{loanDetails.tenure} Months • {loanDetails.interestRate}% Interest</p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !disclaimerAccepted}
                                className="flex-1 md:flex-none md:min-w-[250px] bg-orange-600 text-white py-5 rounded-[22px] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-900/10 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>Processing Application...</>
                                ) : (
                                    <>Confirm & Submit <CheckCircle2 size={18} /></>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FinanceModal;
