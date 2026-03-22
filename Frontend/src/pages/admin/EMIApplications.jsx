import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../utils/api';
import {
    Loader2,
    FileText,
    User,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
    Search,
    Filter,
    Download,
    ExternalLink,
    Upload,
    AlertTriangle,
    ShieldCheck,
    Calculator
} from 'lucide-react';

const AdminEMIApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApp, setSelectedApp] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/emi/all');
            setApplications(response.data.data);
        } catch (err) {
            console.error('EMI fetch error:', err);
            setError(err.response?.data?.message || 'Failed to fetch applications. Power up your backend or check your permissions.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            setActionLoading(true);
            await api.put(`/api/emi/${id}/status`, { status, remarks });
            await fetchApplications();
            setSelectedApp(null);
            setRemarks('');
        } catch (err) {
            alert('Failed to update status: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'document';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed, opening in new tab', error);
            window.open(url, '_blank');
        }
    };


    const getStatusColor = (status) => {
        if (!status) return 'text-gray-600 bg-gray-50 border-gray-100';
        const s = status.toUpperCase();
        switch (s) {
            case 'COMPLETED':
            case 'APPROVED': case 'VERIFIED': return 'text-green-600 bg-green-50 border-green-100';
            case 'REJECTED': return 'text-red-600 bg-red-50 border-red-100';
            case 'REVIEWING': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'FORWARDED': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'PENDING': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'CONTACTED': return 'text-slate-600 bg-slate-100 border-slate-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">EMI Lead Management</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 italic">Review and manage loan applications from users</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search applicants..."
                                className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none w-64 shadow-sm"
                            />
                        </div>
                        <button className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-400 hover:text-orange-600 shadow-sm transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-[30px] flex items-center gap-4 text-red-700 animate-fadeIn">
                        <AlertTriangle size={24} />
                        <div>
                            <p className="font-black uppercase tracking-tight text-sm">System Error</p>
                            <p className="text-xs font-medium italic">{error}</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="h-[50vh] flex flex-col items-center justify-center">
                        <Loader2 size={48} className="text-orange-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic animate-pulse">Synchronizing Data...</p>
                    </div>
                ) : applications.length > 0 ? (
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Target</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loan Structure</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">EMI Pay</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quick Docs</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Review</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {applications.map((app) => (
                                        <tr key={app._id} className="hover:bg-slate-50/30 transition-all duration-300 group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 tracking-tight">
                                                            {app.personalDetails?.fullName || app.user?.name || 'Anonymous Applicant'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold italic">{app.personalDetails?.contactNumber || app.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-slate-900 tracking-tight">{app.bike?.name || 'Unknown Bike'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase italic tracking-tighter">{app.bike?.brand} • {app.bike?.modelYear}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-black text-slate-900 italic">{app.loanDetails?.tenure || '?'} Months</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{app.loanDetails?.interestRate || '?'}% APR</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-orange-600">Rs {app.loanDetails?.monthlyEMI?.toLocaleString() || '0'}</p>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(app.status)}`}>
                                                    {app.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center font-black">
                                                <div className="flex items-center justify-center gap-2">
                                                    {app.documents?.citizenship && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDownload(app.documents.citizenship, `${app.personalDetails?.fullName || 'Applicant'}_Citizenship`); }} 
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" 
                                                            title="Download Citizenship"
                                                        >
                                                            <Download size={14} />
                                                        </button>
                                                    )}
                                                    {app.documents?.salarySlip && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDownload(app.documents.salarySlip, `${app.personalDetails?.fullName || 'Applicant'}_SalarySlip`); }} 
                                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm" 
                                                            title="Download Salary Slip"
                                                        >
                                                            <Download size={14} />
                                                        </button>
                                                    )}
                                                    {app.documents?.lalpurja && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDownload(app.documents.lalpurja, `${app.personalDetails?.fullName || 'Applicant'}_Lalpurja`); }} 
                                                            className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all shadow-sm" 
                                                            title="Download Lalpurja"
                                                        >
                                                            <Download size={14} />
                                                        </button>
                                                    )}
                                                    {(!app.documents || (!app.documents.citizenship && !app.documents.salarySlip && !app.documents.lalpurja)) && (
                                                        <span className="text-[9px] text-slate-300 italic uppercase">No Docs</span>
                                                    )}
                                                </div>

                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    className="inline-flex items-center justify-center w-10 h-10 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-orange-600 hover:-translate-y-1 transition-all"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-24 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[35px] flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                            <FileText size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 uppercase">No Applications Found</h3>
                        <p className="text-slate-400 font-medium max-w-sm italic">
                            There are no EMI applications in the system yet. Once users apply for financing, their documents will appear here.
                        </p>
                    </div>
                )}

                {/* Application Detail Modal */}
                {selectedApp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></div>
                        <div className="relative bg-white w-full max-w-5xl rounded-[50px] shadow-2xl overflow-hidden animate-zoomIn flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-900 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-slate-200">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Lead Dossier</h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} /> Received: {new Date(selectedApp.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedApp(null)} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 hover:bg-red-50 hover:border-red-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 bg-slate-50/30">
                                {/* 1. Personal Identity */}
                                <section className="bg-white rounded-[32px] p-8 lg:p-10 border border-slate-100 shadow-sm">
                                    <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                        <User size={16} className="text-orange-600" /> Personal Identity
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-12">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Applicant Name</p>
                                            <p className="text-lg font-black text-slate-900 italic underline decoration-orange-100 decoration-4 underline-offset-4">{selectedApp.personalDetails?.fullName || selectedApp.user?.name || 'Anonymous'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Primary Contact</p>
                                            <p className="text-lg font-black text-slate-900 italic">{selectedApp.personalDetails?.contactNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Employment Status</p>
                                            <p className="text-lg font-black text-slate-900 italic">{selectedApp.personalDetails?.occupation || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Declared Monthly Income</p>
                                            <p className="text-lg font-black text-slate-900 italic">Rs {selectedApp.personalDetails?.monthlyIncome?.toLocaleString() || '0'}</p>
                                        </div>
                                        <div className="col-span-2 md:col-span-4">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Current Residential Address</p>
                                            <p className="text-lg font-black text-slate-900 italic">{selectedApp.personalDetails?.currentAddress || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* 2. Support Documents */}
                                <section className="bg-white rounded-[32px] p-8 lg:p-10 border border-slate-100 shadow-sm">
                                    <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                        <Upload size={16} className="text-orange-600" /> Support Documents
                                    </h4>
                                    <div className="flex flex-wrap gap-6">
                                        {selectedApp.documents && Object.entries(selectedApp.documents).length > 0 ? (
                                            Object.entries(selectedApp.documents).map(([key, url]) => url && (
                                                <div key={key} className="group flex flex-col items-center w-full sm:w-48">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 truncate text-center">{key}</p>
                                                    <div className="relative w-full aspect-square bg-slate-50 rounded-[30px] border border-slate-100 flex flex-col items-center justify-center p-4 hover:border-orange-500 hover:bg-orange-50 transition-all hover:shadow-xl hover:shadow-orange-500/10 overflow-hidden">
                                                        <FileText size={40} className="text-slate-200 group-hover:text-orange-500 transition-all" />
                                                        <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all gap-2 z-10 backdrop-blur-sm bg-white/30">
                                                            <a
                                                                href={url} target="_blank" rel="noopener noreferrer"
                                                                className="bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-md flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                                                            >
                                                                 <ExternalLink size={16} /> View
                                                            </a>
                                                            <button
                                                                onClick={() => handleDownload(url, `${selectedApp.personalDetails?.fullName || 'Applicant'}_${key}`)}
                                                                className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 shadow-md flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                                                            >
                                                                 <Download size={16} /> Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="w-full p-12 border-2 border-dashed border-slate-100 rounded-[30px] flex flex-col items-center justify-center text-slate-300">
                                                <FileText size={48} className="mb-4" />
                                                <p className="text-xs font-black uppercase tracking-widest">No Documents Uploaded</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* 3. Economic Forecast */}
                                <section className="bg-white rounded-[32px] p-8 lg:p-10 border border-slate-100 shadow-sm">
                                    <h4 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                        <Calculator size={16} className="text-orange-500" /> Economic Forecast
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                            <span className="text-slate-400 font-bold uppercase italic tracking-tighter mb-2">Installment / Mo</span>
                                            <span className="font-black text-orange-600 text-3xl">Rs {selectedApp.loanDetails?.monthlyEMI?.toLocaleString() || '0'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                            <span className="text-slate-400 font-bold uppercase italic tracking-tighter mb-2">Financed Volume</span>
                                            <span className="font-black text-slate-900 italic text-2xl">Rs {selectedApp.loanDetails?.loanAmount?.toLocaleString() || '0'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                            <span className="text-slate-400 font-bold uppercase italic tracking-tighter mb-2">Initial Downpayment</span>
                                            <span className="font-black text-slate-900 italic text-2xl">Rs {selectedApp.loanDetails?.downPayment?.toLocaleString() || '0'}</span>
                                        </div>
                                    </div>
                                </section>

                                {/* 4. Back-Office Verification */}
                                <section className="bg-slate-50/50 rounded-[40px] p-8 lg:p-10 border border-slate-100 shadow-sm">
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                        <ShieldCheck size={16} /> Back-Office Verification
                                    </h4>
                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 block px-2">Decision Remarks / Bank Details</label>
                                            <textarea
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-[28px] p-6 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none h-32 italic shadow-inner custom-scrollbar"
                                                placeholder="Enter verified bank details, reference numbers or specific rejection notes..."
                                            ></textarea>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-4">
                                            <button
                                                onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected')}
                                                disabled={actionLoading}
                                                className="flex-1 bg-white text-red-600 border border-red-100 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <XCircle size={18} /> Discard Lead
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedApp._id, 'Forwarded')}
                                                disabled={actionLoading}
                                                className="flex-1 bg-slate-900 text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                                            >
                                                Forward To Bank <ChevronRight size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedApp._id, 'Approved')}
                                                disabled={actionLoading}
                                                className="flex-[2] bg-green-600 text-white py-6 rounded-[28px] font-black text-[12px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-950/10 flex items-center justify-center gap-3"
                                            >
                                                <CheckCircle2 size={20} /> Finalize Approval
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminEMIApplications;
