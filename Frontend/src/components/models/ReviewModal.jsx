import React, { useState } from 'react';
import { Star, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

const ReviewModal = ({ isOpen, onClose, bikeId, bikeName, sellerId, serviceType = 'Buy' }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }
        if (!comment.trim()) {
            setError('Please add a comment');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post('/api/reviews', {
                bikeId,
                rating,
                comment,
                serviceType
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setRating(0);
                setComment('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-zoomIn border border-gray-100">
                {/* Header */}
                <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Rate Our Service</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{bikeName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-8">
                    {success ? (
                        <div className="text-center py-10 animate-fadeIn">
                            <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-green-100 mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Thank You!</h3>
                            <p className="text-gray-500 font-medium italic">Your review has been shared.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold animate-shake">
                                    {error}
                                </div>
                            )}

                            {/* Rating Stars */}
                            <div className="space-y-3 text-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-left ml-2">How was your experience?</label>
                                <div className="flex items-center justify-center gap-2 py-4 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="transition-all transform hover:scale-125 focus:outline-none"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                        >
                                            <Star
                                                size={36}
                                                className={`transition-colors duration-200 ${star <= (hover || rating)
                                                        ? 'fill-orange-500 text-orange-500'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                                    {rating === 1 && "Terrible"}
                                    {rating === 2 && "Poor"}
                                    {rating === 3 && "Average"}
                                    {rating === 4 && "Very Good"}
                                    {rating === 5 && "Excellent"}
                                </p>
                            </div>

                            {/* Comment Textarea */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Write your comments</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us what you liked or how we can improve..."
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-[25px] text-sm font-bold transition-all outline-none min-h-[120px] resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        Submit My Review
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
