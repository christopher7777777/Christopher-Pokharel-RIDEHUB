import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { Star, MessageSquare, ArrowLeft, Loader2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RateService = () => {
    const { bikeId } = useParams();
    const navigate = useNavigate();
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchBike = async () => {
            try {
                const response = await api.get(`/api/bikes/${bikeId}`);
                setBike(response.data.data);
            } catch (err) {
                toast.error('Failed to load bike details');
                navigate('/my-purchases');
            } finally {
                setLoading(false);
            }
        };
        fetchBike();
    }, [bikeId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return toast.error('Please select a rating');
        if (!comment.trim()) return toast.error('Please add a comment');

        try {
            setSubmitting(true);
            await api.post('/api/reviews', {
                bikeId,
                rating,
                comment
            });
            toast.success('Thank you for your review!');
            navigate('/my-purchases');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-orange-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-24">
            <Header />
            <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 sm:p-12 text-center border-b border-gray-50">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star size={40} className="text-orange-600 fill-orange-600" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Rate Your Experience</h1>
                        <p className="text-gray-500 italic">Tell us how was your experience with ${bike?.name}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
                        {/* Star Rating */}
                        <div className="space-y-4 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Select Rating</p>
                            <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-transform active:scale-90"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <Star
                                            size={48}
                                            className={`transition-all duration-300 ${
                                                (hover || rating) >= star 
                                                    ? 'fill-orange-500 text-orange-500 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]' 
                                                    : 'text-gray-200 fill-gray-100'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block ml-4">Detailed Feedback</label>
                            <div className="relative">
                                <MessageSquare className="absolute top-6 left-6 text-gray-300" size={20} />
                                <textarea
                                    className="w-full bg-gray-50 border-none rounded-[32px] p-6 pl-14 text-sm font-medium focus:ring-2 focus:ring-orange-500 transition-all min-h-[160px] resize-none shadow-inner"
                                    placeholder="Write your honest review here..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>SUBMIT REVIEW <Send size={18} /></>
                            )}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RateService;
