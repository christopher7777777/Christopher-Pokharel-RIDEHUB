import {
    Bike,
    Loader2
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import api from '../../utils/api';
import SupportChat from '../../components/chat/SupportChat';

const UserDashboard = () => {
    const navigate = useNavigate();
    useAuth();
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBikes = async () => {
            try {
                const response = await api.get('/api/bikes');
                // Limit featured units
                setBikes(response.data.data.slice(0, 3));
            } catch (err) {
                console.error('Failed to fetch bikes', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBikes();
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <Header />

            <main className="pt-32">

                {/* Hero section */}
                <section className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-slideInLeft">
                            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-gray-900">
                                Your Ultimate Marketplace <br />
                                <span className="text-orange-500">Motorcycle</span>
                            </h1>
                            <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                                Ride Your Way. Discover outstanding bikes, find the perfect ride for your next adventure.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link to="/browse" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-orange-200 transition-transform active:scale-95 inline-block text-center">
                                    View Ride Now
                                </Link>
                                <Link to="/sell" className="bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-800 hover:text-slate-900 px-8 py-4 rounded-xl font-bold transition-all active:scale-95 inline-block text-center">
                                    Sell Bike
                                </Link>
                            </div>
                        </div>

                        <div className="relative animate-slideInRight lg:translate-x-10">
                            {/* Background shape */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-100/50 to-blue-50/50 rounded-full blur-3xl -z-10"></div>

                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                                <img
                                    src="/image1.png"
                                    alt="Motorcycle"
                                    className="w-full h-auto object-cover transform hover:scale-105 transition-duration-700"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured motorcycles */}
                <section className="bg-slate-50 py-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Motorcycles</h2>
                            <p className="text-gray-500">Find the best deals on standard and premium bikes.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {loading ? (
                                <div className="col-span-3 flex flex-col items-center justify-center py-20">
                                    <Loader2 size={40} className="text-orange-500 animate-spin mb-4" />
                                    <p className="text-gray-400 font-bold italic">Discovery in progress...</p>
                                </div>
                            ) : bikes.length === 0 ? (
                                <div className="col-span-3 bg-white p-20 rounded-[40px] text-center border border-gray-100 italic text-gray-400">
                                    <Bike className="mx-auto mb-4 text-gray-200" size={48} />
                                    No featured motorcycles at the moment.
                                </div>
                            ) : (
                                bikes.map((bike, idx) => (
                                    <div key={bike._id} className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
                                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-gray-100">
                                            <img
                                                src={bike.images[0] || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                                                alt={bike.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm border border-white/50">
                                                For {bike.listingType}
                                            </div>
                                        </div>
                                        <div className="px-2 pb-2">
                                            <h3 className="text-xl font-black text-gray-900 mb-1 truncate">{bike.name}</h3>
                                            <div className="text-[10px] text-gray-400 mb-4 font-black uppercase tracking-widest flex items-center gap-2">
                                                <span>{bike.modelYear} MODEL</span>
                                                <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                                                <span>{bike.condition}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Investment</span>
                                                    <span className="text-lg font-black text-orange-500">
                                                        Rs {bike.price.toLocaleString()}
                                                        {bike.listingType === 'Rental' && <span className="text-[10px] font-normal text-gray-400 ml-1">/day</span>}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/bike/${bike._id}`)}
                                                    className="px-5 py-3 bg-orange-50 text-orange-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                >
                                                    View Deal
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                            <p className="text-gray-500">Get started in three simple steps</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {/* Desktop connecting line */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 -z-10"></div>

                            {[
                                { step: "1", title: "Browse Bikes", desc: "Search through verified listings and select your perfect ride." },
                                { step: "2", title: "Connect & Buy", desc: "Chat with sellers directly and set up a meeting." },
                                { step: "3", title: "Complete Ride", desc: "Finalize the deal safely and start your journey." }
                            ].map((item, idx) => (
                                <div key={idx} className="relative text-center group">
                                    <div className="w-24 h-24 mx-auto bg-orange-50 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-3xl font-black text-orange-500">{item.step}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto leading-relaxed text-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <SupportChat />
        </div>
    );
};

export default UserDashboard;
