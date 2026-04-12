import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Star, ShoppingBag, Calendar } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ReviewModal from '../../components/models/ReviewModal';

const BookingSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const bikeId = searchParams.get('bikeId');
    const bikeName = searchParams.get('bikeName');
    const type = searchParams.get('type');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-6 pt-32 pb-20">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center animate-zoomIn border border-gray-100 relative overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

                    <div className="relative z-10 space-y-8">
                        <div className="w-24 h-24 bg-green-500 rounded-[35px] flex items-center justify-center mx-auto text-white shadow-2xl shadow-green-200 transform hover:scale-105 transition-transform duration-500">
                            <CheckCircle2 size={48} />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none">Booking Placed!</h2>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] bg-orange-50 py-1.5 px-4 rounded-full border border-orange-100 flex items-center gap-2">
                                    <ShoppingBag size={12} /> Cash On Delivery
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 text-left space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm border border-gray-100 flex-shrink-0">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Item Booked</p>
                                    <p className="font-black text-gray-900 truncate max-w-[200px]">{bikeName || 'Bike'}</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                Your booking for <span className="text-gray-900 font-bold">{bikeName}</span> has been successfully placed. Our team will contact you shortly for verification and delivery coordination.
                            </p>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button
                                onClick={() => setIsReviewModalOpen(true)}
                                className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Rate Our Service
                                    <Star size={18} className="group-hover:rotate-12 transition-transform" />
                                </span>
                            </button>

                            <button
                                onClick={() => navigate('/browse')}
                                className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 group"
                            >
                                Browse More Bikes
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Need help? <button onClick={() => navigate('/contact')} className="text-orange-600 hover:underline">Contact Support</button>
                        </p>
                    </div>
                </div>
            </main>
            <Footer />

            {bikeId && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    bikeId={bikeId}
                    bikeName={bikeName}
                    serviceType={type === 'Rental' ? 'Rental' : 'Buy'}
                />
            )}
        </div>
    );
};

export default BookingSuccess;
