import { Bike, Loader2, Key, ShoppingCart, HandCoins, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import api from '../../utils/api';

const UserDashboard = () => {
    const navigate = useNavigate();
    useAuth();
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
    const heroImages = ['/image1.png', '/image2.png', '/image3.png'];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % heroImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

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

            <main className="pt-24 lg:pt-32">

                {/* Hero section */}
                <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-slideInLeft">
                            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-gray-900">
                                Your Ultimate <br />
                                <span className="text-orange-500">Motorcycle</span> Marketplace
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
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-100/50 to-blue-50/50 rounded-full blur-3xl -z-10 animate-pulse"></div>

                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-gray-100">
                                {heroImages.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Motorcycle ${idx + 1}`}
                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${idx === currentImage ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                                            }`}
                                    />
                                ))}
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>

                                {/* Indicators */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {heroImages.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentImage ? 'w-8 bg-orange-500' : 'w-2 bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="py-12 lg:py-16 bg-white relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight text-center">Our <span className="text-orange-500">Featured</span> Services</h2>
                            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Discover the perfect way to get moving with our comprehensive motorcycle solutions tailored for your every need.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            {[
                                {
                                    title: "Rent a Bike",
                                    desc: "Explore the open road with our premium rental fleet. Perfect for weekend getaways and short trips.",
                                    icon: <Key className="text-orange-600" size={36} />,
                                    link: "/browse?type=Rental",
                                    bg: "bg-orange-100/50",
                                    accent: "border-orange-100"
                                },
                                {
                                    title: "Purchase Bike",
                                    desc: "Invest in your dream ride from our verified collection of pre-owned and new motorcycles.",
                                    icon: <ShoppingCart className="text-blue-600" size={36} />,
                                    link: "/browse?type=Sale",
                                    bg: "bg-blue-100/50",
                                    accent: "border-blue-100"
                                },
                                {
                                    title: "List & Sell",
                                    desc: "Connect with thousands of buyers. List your bike today and get the best value for your machine.",
                                    icon: <HandCoins className="text-emerald-600" size={36} />,
                                    link: "/sell",
                                    bg: "bg-emerald-100/50",
                                    accent: "border-emerald-100"
                                }
                            ].map((service, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => navigate(service.link)}
                                    className={`group cursor-pointer p-10 rounded-[40px] border-2 ${service.accent} bg-white hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 flex flex-col items-center text-center h-full relative overflow-hidden`}
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${service.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                    <div className={`${service.bg} w-24 h-24 rounded-[32px] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative z-10`}>
                                        {service.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight relative z-10">{service.title}</h3>
                                    <p className="text-gray-500 leading-relaxed mb-10 flex-grow relative z-10 font-medium">
                                        {service.desc}
                                    </p>
                                    <div className="flex items-center gap-3 text-orange-600 font-extrabold group-hover:gap-5 transition-all relative z-10 uppercase text-xs tracking-widest">
                                        Experience Now <ArrowRight size={20} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured motorcycles */}
                <section className="bg-slate-50 py-14 lg:py-18 border-y border-slate-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Inventory</h2>
                            <p className="text-gray-500 text-lg">Find the best deals on standard and premium bikes.</p>
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
                <section className="py-18 lg:py-22 bg-white relative overflow-hidden">
                    {/* Artistic gradient background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-slate-50 to-white -z-10"></div>

                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Proper Ride Flow</h2>
                            <p className="text-gray-500 text-lg">Getting started is effortless. We've streamlined the process down to three elite stages.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-16 lg:gap-20 relative">
                            {/* Desktop connecting path - decorative */}
                            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px border-t-2 border-dashed border-orange-200 -z-0"></div>

                            {[
                                { step: "01", title: "Browse Bikes", desc: "Search through our elite, verified listings and select your perfect companion for the road." },
                                { step: "02", title: "Connect & Buy", desc: "Engage with owners directly through our secure platform and finalize your interest." },
                                { step: "03", title: "Complete Ride", desc: "Seal the deal with confidence and embark on your next great journey with RIDEHUB." }
                            ].map((item, idx) => (
                                <div key={idx} className="relative text-center group z-10">
                                    <div className="w-32 h-32 mx-auto bg-white rounded-3xl flex items-center justify-center mb-10 border-2 border-slate-50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_60px_-15px_rgba(249,115,22,0.2)] group-hover:-translate-y-2 transition-all duration-500 relative">
                                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-4 border-white">
                                            {item.step}
                                        </div>
                                        {idx === 0 && <Bike className="text-orange-500" size={48} />}
                                        {idx === 1 && <ShoppingCart className="text-orange-500" size={48} />}
                                        {idx === 2 && <Key className="text-orange-500" size={48} />}
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase tracking-tighter">{item.title}</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default UserDashboard;
