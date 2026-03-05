import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/navigation/AdminSidebar';
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
    ExternalLink
} from 'lucide-react';

const AdminEMIApplications = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
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
            const response = await api.get('/api/emi/all');
            setApplications(response.data.data);
        } catch (err) {
            setError('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            setActionLoading(true);
            await api.put(`/api/emi/${id}/status`, { status, remarks });
            fetchApplications();
            setSelectedApp(null);
            setRemarks('');
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'text-green-600 bg-green-50';
            case 'Rejected': return 'text-red-600 bg-red-50';
            case 'Pending': return 'text-orange-600 bg-orange-50';
            case 'Forwarded': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <main className="flex-1 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">EMI Lead Management</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 italic">Review and forward loan applications</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search applicants..."
                                className="bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-6 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none w-64 shadow-sm"
                            />
                        </div>
                        <button className="bg-white p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm"><Filter size={18} /></button>
                    </div>
                </div>

                {loading ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center">
                        <Loader2 size={48} className="text-orange-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Fetching Applications</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[35px] shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bike Details</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loan Terms</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">EMI Amount</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app._id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-all">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{app.personalDetails.fullName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{app.personalDetails.contactNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-slate-900">{app.bike.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{app.bike.brand} • {app.bike.modelYear}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-black text-slate-900 italic">{app.loanDetails.tenure} Months</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{app.loanDetails.interestRate}% Interest</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-orange-600">Rs {app.loanDetails.monthlyEMI.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100 ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Application Detail Modal */}
                {selectedApp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></div>
                        <div className="relative bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Review Application</h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {selectedApp._id.toString().toUpperCase()}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedApp(null)} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 group transition-all">
                                    <XCircle size={24} className="group-hover:text-slate-900" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 grid md:grid-cols-2 gap-12">
                                <div className="space-y-10">
                                    <section>
                                        <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <User size={14} /> Personal Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Full Name</p>
                                                <p className="text-sm font-black text-slate-900 italic">{selectedApp.personalDetails.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Contact</p>
                                                <p className="text-sm font-black text-slate-900 italic">{selectedApp.personalDetails.contactNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Occupation</p>
                                                <p className="text-sm font-black text-slate-900 italic">{selectedApp.personalDetails.occupation}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Income</p>
                                                <p className="text-sm font-black text-slate-900 italic">Rs {selectedApp.personalDetails.monthlyIncome.toLocaleString()}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Address</p>
                                                <p className="text-sm font-black text-slate-900 italic">{selectedApp.personalDetails.currentAddress}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <Upload className="rotate-180" size={14} /> Document Verification
                                        </h4>
                                        <div className="flex gap-4">
                                            {Object.entries(selectedApp.documents).map(([key, url]) => url && (
                                                <div key={key} className="flex-1 group">
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-3 text-center">{key}</p>
                                                    <a
                                                        href={url} target="_blank" rel="noopener noreferrer"
                                                        className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-4 hover:border-orange-200 transition-all group overflow-hidden relative"
                                                    >
                                                        <FileText size={32} className="text-slate-300 group-hover:text-orange-600 transition-colors" />
                                                        <span className="text-[8px] font-black text-slate-400 mt-2 uppercase">View File</span>
                                                        <div className="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <ExternalLink size={20} className="text-white bg-orange-600 p-1 rounded-lg" />
                                                        </div>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-10 bg-slate-50 rounded-[35px] p-8 border border-white">
                                    <section>
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <CheckCircle2 size={14} /> Administrative Action
                                        </h4>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-3 block">Remarks / Bank Info</label>
                                                <textarea
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-slate-900 outline-none h-32 italic"
                                                    placeholder="Enter bank name, verification notes or rejection reasons..."
                                                ></textarea>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected')}
                                                    disabled={actionLoading}
                                                    className="bg-white text-red-600 border border-red-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <XCircle size={16} /> Reject Lead
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(selectedApp._id, 'Forwarded')}
                                                    disabled={actionLoading}
                                                    className="bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2"
                                                >
                                                    <ChevronRight size={16} /> Forward to Bank
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(selectedApp._id, 'Approved')}
                                                    disabled={actionLoading}
                                                    className="col-span-2 bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-900/10 flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 size={16} /> Mark As Approved
                                                </button>
                                            </div>
                                        </div>
                                    </section>

                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-4">Loan Breakdown</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-bold uppercase italic">Monthly EMI</span>
                                                <span className="font-black text-slate-900">Rs {selectedApp.loanDetails.monthlyEMI.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-bold uppercase italic">Loan Amount</span>
                                                <span className="font-black text-slate-900">Rs {selectedApp.loanDetails.loanAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-bold uppercase italic">Down Payment</span>
                                                <span className="font-black text-slate-900">Rs {selectedApp.loanDetails.downPayment.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminEMIApplications;
