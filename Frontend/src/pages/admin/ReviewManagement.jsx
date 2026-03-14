import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Star, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/reviews');
            setReviews(res.data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch reviews');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            await api.delete(`/api/admin/reviews/${id}`);
            toast.success('Review deleted');
            setReviews(reviews.filter(r => r._id !== id));
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Service Reviews</h1>
                        <p className="text-slate-500 font-medium">Manage all customer feedback and ratings across the platform.</p>
                    </div>
                    <div className="bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100 flex items-center gap-3">
                        <Star className="text-orange-500 fill-orange-500" size={20} />
                        <span className="text-orange-700 font-black tracking-tight">{reviews.length} Total Feedback</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={40} />
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Fetching Reviews...</p>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="grid gap-6">
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reviewer Info</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bike & Service</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating Given</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Comment Details</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reviews.map((review) => (
                                            <tr key={review._id} className="hover:bg-slate-50/30 transition-all duration-300 group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black text-sm uppercase">
                                                            {review.reviewer?.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-sm tracking-tight">{review.reviewer?.name || 'Deleted User'}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium italic">{review.reviewer?.email || 'No email'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-slate-800 text-sm tracking-tight">{review.bike?.name || 'N/A'}</p>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${review.serviceType === 'Rental'
                                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                            : 'bg-orange-50 text-orange-600 border-orange-100'
                                                        }`}>
                                                        {review.serviceType}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex gap-0.5 text-orange-500">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <Star key={i} size={14} className={i <= review.rating ? 'fill-orange-500' : 'text-slate-100'} />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 max-w-xs">
                                                    <p className="text-slate-600 text-xs leading-relaxed italic line-clamp-2">
                                                        "{review.comment}"
                                                    </p>
                                                    <p className="text-[9px] text-slate-300 font-bold mt-2 uppercase tracking-tighter">
                                                        {new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleDelete(review._id)}
                                                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-24 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[35px] flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                            <MessageSquare size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 uppercase">Silence Echoes...</h3>
                        <p className="text-slate-400 font-medium max-w-sm italic">
                            There are no service reviews recorded yet. Once users complete transactions and share feedback, they will appear here.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ReviewManagement;
