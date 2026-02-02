import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Search, Check, X, Eye, FileText, MapPin, Phone, Mail, Calendar, Building2, Camera } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const KycVerification = () => {
    const [kycRequests, setKycRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKyc, setSelectedKyc] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        fetchKycs();
    }, []);

    const getFullImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${baseUrl}/${path}`;
    };

    const fetchKycs = async () => {
        try {
            const res = await api.get('/api/kyc');
            setKycRequests(res.data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch KYC requests');
            setLoading(false);
        }
    };

    const handleVerify = async (id, status, note = adminNote) => {
        try {
            await api.put(`/api/kyc/${id}`, {
                status,
                adminNote: note
            });
            toast.success(`KYC ${status === 'verified' ? 'verified' : 'rejected'} successfully`);
            setIsViewModalOpen(false);
            setAdminNote('');
            fetchKycs();
        } catch (error) {
            toast.error('Failed to update KYC status');
        }
    };

    const openViewModal = (kyc) => {
        setSelectedKyc(kyc);
        setAdminNote(kyc.adminNote || '');
        setIsViewModalOpen(true);
    };

    if (loading) return <AdminLayout><div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-slate-400">Loading requests...</p>
        </div>
    </div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">KYC Verification</h1>
                        <p className="text-slate-500 font-medium italic">Review and verify user and seller identity documents.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Submitted</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic font-medium">
                                {kycRequests.map((req) => (
                                    <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 overflow-hidden rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                    <img src={getFullImageUrl(req.userPhoto)} alt={req.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800">{req.name}</p>
                                                    <p className="text-xs text-slate-500">{req.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${req.user?.role === 'seller' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {req.user?.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(req.submittedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${req.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    req.status === 'verified' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                                {req.adminNote && (
                                                    <p className="text-[10px] text-slate-400 italic truncate max-w-[150px]">
                                                        Note: {req.adminNote}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openViewModal(req)}
                                                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:shadow-md rounded-2xl transition-all" title="View Details">
                                                    <Eye size={18} />
                                                </button>
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                handleVerify(req._id, 'verified', '');
                                                            }}
                                                            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-200 hover:shadow-md rounded-2xl transition-all" title="Quick Approve">
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => openViewModal(req)}
                                                            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:shadow-md rounded-2xl transition-all" title="Review & Reject">
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {kycRequests.length === 0 && (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                                <FileText size={64} className="mb-4 opacity-10" />
                                <p className="font-bold italic">No KYC requests found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View KYC Modal */}
            {isViewModalOpen && selectedKyc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
                    <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300 border border-white">
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-50 px-10 py-8 flex justify-between items-center z-20">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Review KYC <span className="text-orange-600">Verification</span></h3>
                                <p className="text-slate-500 font-medium italic">Comprehensive review for {selectedKyc.name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setAdminNote('');
                                }}
                                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"
                            >
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-10 space-y-12">
                            {/* Personal Details Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                        <FileText size={20} />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-widest text-sm">Personal Information</h4>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1">
                                        <div className="aspect-square rounded-[3rem] overflow-hidden border-8 border-slate-50 shadow-inner group">
                                            <img src={getFullImageUrl(selectedKyc.userPhoto)} alt="User" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { icon: Mail, label: 'Email Address', value: selectedKyc.email },
                                            { icon: Phone, label: 'Phone Number', value: selectedKyc.phoneNumber },
                                            { icon: Calendar, label: 'Date of Birth', value: selectedKyc.dob ? new Date(selectedKyc.dob).toLocaleDateString() : 'N/A' },
                                            { icon: MapPin, label: 'Permanent Address', value: selectedKyc.permanentAddress || 'N/A' },
                                            { icon: MapPin, label: 'Submitted Location', value: selectedKyc.location?.address || 'N/A' },
                                        ].map((item, i) => (
                                            <div key={i} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                    <item.icon size={12} /> {item.label}
                                                </p>
                                                <p className="text-slate-800 font-black italic">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Business Details Section (If Seller) */}
                            {selectedKyc.user?.role === 'seller' && (
                                <div className="space-y-8 pt-12 border-t border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                            <Building2 size={20} />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-widest text-sm">Business Operations</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Business Name', value: selectedKyc.businessName },
                                            { label: 'PAN Number', value: selectedKyc.panNumber },
                                            { label: 'Registration Number', value: selectedKyc.businessRegistrationNumber },
                                            { label: 'Business Contact', value: selectedKyc.businessContactNumber },
                                            { label: 'Shop Address', value: selectedKyc.location?.address },
                                        ].map((item, i) => (
                                            <div key={i} className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100/30">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">{item.label}</p>
                                                <p className="text-blue-900 font-black italic">{item.value || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Documents Section */}
                            <div className="space-y-8 pt-12 border-t border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                                        <Camera size={20} />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-widest text-sm">Identity & Legal Documents</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[
                                        { label: 'Citizenship (Front)', src: selectedKyc.nagriktaFront },
                                        { label: 'Citizenship (Back)', src: selectedKyc.nagriktaBack },
                                        { label: 'PAN Document', src: selectedKyc.panPhoto },
                                    ].map((doc, i) => doc.src && (
                                        <div key={i} className="space-y-3 group cursor-pointer" onClick={() => window.open(doc.src, '_blank')}>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{doc.label}</p>
                                            <div className="aspect-video bg-slate-50 rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-sm relative group">
                                                <img src={getFullImageUrl(doc.src)} alt={doc.label} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <Eye className="text-white" size={32} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Verification Actions */}
                            <div className="pt-12 border-t border-slate-100 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Admin Action Note</label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Explain the reason for approval or detailed reason for rejection..."
                                        className="w-full px-6 py-5 rounded-[2rem] bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none resize-none h-32 font-medium italic"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => handleVerify(selectedKyc._id, 'verified', adminNote)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <Check size={24} />
                                        APPROVE VERIFICATION
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!adminNote) return toast.error('Please provide a note for rejection');
                                            handleVerify(selectedKyc._id, 'rejected', adminNote)
                                        }}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <X size={24} />
                                        REJECT APPLICATION
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default KycVerification;
