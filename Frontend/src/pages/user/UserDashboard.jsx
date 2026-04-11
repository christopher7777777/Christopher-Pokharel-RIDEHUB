import { Bike, Loader2, Key, ShoppingCart, HandCoins, ArrowRight, ShieldCheck, AlertCircle, Calendar, MapPin, Route } from 'lucide-react';
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

            <main className="pt-20 lg:pt-24">

                {/* Hero section - Refined for "Clean" look */}
                <section className="relative bg-slate-950 min-h-[500px] lg:h-[70vh] flex items-center overflow-hidden">
                    {/* Background Silhouette & Red Glow */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]"></div>
                    <div className="absolute -right-20 -top-20 w-[500px] h-[500px] bg-red-600 rounded-full blur-[120px] opacity-20 lg:opacity-30"></div>
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-600/5 to-transparent"></div>

                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 py-12 lg:py-0">
                        <div className="space-y-6 lg:space-y-8 animate-slideInLeft">
                            <h1 className="text-4xl lg:text-7xl text-white uppercase leading-[1.05] tracking-tight">
                                <span className="font-light block opacity-80 mb-1">Your Ultimate</span>
                                <span className="font-bold text-orange-500 italic block">Motorcycle</span>
                                <span className="font-bold block italic">Marketplace</span>
                            </h1>

                            <p className="text-slate-400 text-base lg:text-lg leading-relaxed max-w-md font-medium">
                                Ride Your Way. Discover outstanding bikes, find the perfect ride for your next adventure.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link to="/browse" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all active:scale-95 inline-block shadow-lg shadow-orange-600/20">
                                    View Ride Now
                                </Link>
                                <Link to="/sell" className="bg-white/5 border border-white/10 text-white hover:bg-white/10 px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all active:scale-95 inline-block">
                                    Sell Bike
                                </Link>
                            </div>
                        </div>

                        <div className="relative animate-slideInRight lg:translate-x-10 flex justify-center lg:justify-end">
                            <div className="relative w-full max-w-[600px] group">
                                {/* The Main Bike Showcase - Clean and Simple */}
                                <img
                                    src="/image 10.png"
                                    alt="RIDEHUB Luxury Collection"
                                    className="w-full h-auto object-contain z-10 relative drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:scale-[1.02] transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Exclusive Deals Carousel */}
                <section className="py-20 bg-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Exclusive <span className="text-orange-600">Deals</span></h2>
                            <p className="text-gray-500 font-medium italic">Discover our most premium collections at unbeatable prices.</p>
                        </div>

                        <div className="relative h-[400px] flex items-center justify-center">
                            {[
                                { name: 'Cruiser', rentPrice: 'Rs 1000/per day', purchasePrice: 'Rs 100000', img: '/image 8.png' },
                                { name: 'Scooter', rentPrice: 'Rs 1000/per day', purchasePrice: 'Rs 100000', img: '/image 9.png' },
                                { name: 'Sports', rentPrice: 'Rs 1000/per day', purchasePrice: 'Rs 100000', img: '/image 10.png' }
                            ].map((item, idx) => {
                                const pos = (idx - currentImage + 3) % 3;
                                let style = "";
                                if (pos === 0) style = "scale-110 z-20 opacity-100 translate-x-0";
                                if (pos === 1) style = "scale-90 z-10 opacity-40 translate-x-1/2 lg:translate-x-full";
                                if (pos === 2) style = "scale-90 z-10 opacity-40 -translate-x-1/2 lg:-translate-x-full";

                                return (
                                    <div
                                        key={idx}
                                        className={`absolute transition-all duration-700 ease-in-out flex flex-col items-center ${style}`}
                                    >
                                        <div className="w-[300px] lg:w-[450px] aspect-[16/10] bg-slate-50/50 rounded-[3rem] p-8 flex items-center justify-center">
                                            <img src={item.img} alt={item.name} className="w-full h-full object-contain hover:scale-105 transition-transform" />
                                        </div>
                                        <div className={`mt-8 text-center transition-opacity duration-300 ${pos === 0 ? 'opacity-100' : 'opacity-0'}`}>
                                            <h3 className="text-2xl font-black text-orange-600 uppercase tracking-tighter mb-2">{item.name}</h3>
                                            <p className="text-slate-400 font-bold text-sm tracking-widest leading-relaxed">Rent starting from {item.rentPrice}</p>
                                            <p className="text-slate-400 font-bold text-sm tracking-widest leading-relaxed">Purchase starting from {item.purchasePrice}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-3 mt-12">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    onClick={() => setCurrentImage(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentImage === i ? 'w-10 bg-orange-600' : 'w-2 bg-slate-200'}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Categories Section */}
                <section className="py-24 bg-orange-100/60 relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Our <span className="text-orange-600">Featured</span> Services</h2>
                            <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Discover the perfect way to get moving with our comprehensive motorcycle solutions tailored for your every need.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    tag: "FLEXIBLE",
                                    title: "RENT A BIKE",
                                    image: "/image 8.png",
                                    link: "/browse?type=Rental",
                                    icon: <Key className="text-orange-500" size={20} />
                                },
                                {
                                    tag: "PROFITABLE",
                                    title: "SELL YOUR BIKE",
                                    image: "/image 9.png",
                                    link: "/sell",
                                    icon: <HandCoins className="text-emerald-500" size={20} />
                                },
                                {
                                    tag: "PREMIUM",
                                    title: "PURCHASE BIKE",
                                    image: "/image 10.png",
                                    link: "/browse?type=Sale",
                                    icon: <ShoppingCart className="text-blue-500" size={20} />
                                }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-white rounded-[2.5rem] border border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer flex flex-col"
                                    onClick={() => navigate(item.link)}
                                >
                                    <div className="relative aspect-[16/10] bg-slate-50 p-6 overflow-hidden border-b border-slate-50">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-110 drop-shadow-xl"
                                        />
                                        <div className="absolute top-6 left-6 z-20">
                                            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase">
                                                    {item.tag}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow bg-white relative">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 border border-slate-100">
                                                {item.icon}
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-orange-600 transition-colors">
                                                {item.title}
                                            </h3>
                                        </div>

                                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                            Experience the best-in-class service for your motorcycling journey with our dedicated platform.
                                        </p>
                                        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
                                            <button className="px-6 py-3 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 uppercase shadow-md active:scale-95">
                                                Explore Now
                                            </button>
                                            <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-orange-600 group-hover:border-orange-200 group-hover:bg-orange-50 transition-all">
                                                <ArrowRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-1.5 bg-orange-600 transition-all duration-500 w-0 group-hover:w-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="py-12 pb-24 bg-orange-100/60 relative">
                    <div className="max-w-7xl mx-auto px-6">
                        
                        {/* Centered Heading like new sample */}
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                                Why choose <span className="text-orange-600">us?</span>
                            </h2>
                            <p className="text-orange-600 text-lg font-medium max-w-3xl mx-auto">
                                Rent, Buy, or Sell a Bike/Motorcycle/Scooty from RIDEHUB and enjoy the ultimate convenience in two-wheeler solutions.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            
                            {/* Left Side: Full Image */}
                            <div className="relative w-full flex justify-center lg:justify-start">
                                <img 
                                    src="/image 8.png" 
                                    alt="RIDEHUB Fleet Service" 
                                    className="w-full h-auto object-contain max-h-[500px]"
                                />
                                <div className="absolute bottom-0 text-center w-full">
                                    <h4 className="text-xl font-bold italic text-slate-800 tracking-tight mt-4">Your Ultimate Ride Partner..!!</h4>
                                    <div className="h-0.5 bg-orange-600 w-full mt-2"></div>
                                </div>
                            </div>

                            {/* Right Side: Stacked Horizontal Cards matching Ridehub Logic */}
                            <div className="space-y-6 lg:pl-8">
                                {[
                                    { 
                                        highlight: "Premium", title: " Bike Rentals", 
                                        desc: "At RIDEHUB you rent top-tier bikes with zero hassle. We provide well-maintained options for every journey.", 
                                        icon: <Key size={28} className="text-slate-700" />
                                    },
                                    { 
                                        highlight: "Profitable", title: " Selling", 
                                        desc: "List your two-wheeler on our platform and get the best market value with our secure, verified buyer network.", 
                                        icon: <HandCoins size={28} className="text-slate-700" /> 
                                    },
                                    { 
                                        highlight: "Verified", title: " Purchases", 
                                        desc: "Buy your dream bike with confidence. Every unit goes through a rigorous quality check and valuation process.", 
                                        icon: <ShoppingCart size={28} className="text-slate-700" /> 
                                    },
                                    { 
                                        highlight: "24/7", title: " Customer Support", 
                                        desc: "You can count on us! Our dedicated squad is ready whenever you need help, ensuring a smooth experience.", 
                                        icon: <AlertCircle size={28} className="text-slate-700" /> 
                                    }
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-6 bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-[0_5px_20px_rgba(0,0,0,0.02)] hover:border-orange-200 hover:shadow-lg transition-all group">
                                        <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 mb-2">
                                                <span className="text-orange-600">{feature.highlight}</span>{feature.title}
                                            </h4>
                                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured motorcycles (Top Inventory) */}
                <section className="bg-white py-24 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Discover <span className="text-orange-600">Top Inventory</span></h2>
                            <p className="text-gray-500 text-lg font-medium italic">Find the best deals on standard and premium bikes.</p>
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
                                    <div key={bike._id} className="bg-white p-4 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 group border border-slate-50 hover:border-orange-100 cursor-pointer" onClick={() => navigate(`/bike/${bike._id}`)}>
                                        <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 bg-slate-50">
                                            <img
                                                src={bike.images[0] || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                                                alt={bike.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-800 shadow-sm border border-white/50">
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
                <section className="py-24 bg-orange-600 relative overflow-hidden">
                    {/* Decorative slant */}
                    <div className="absolute top-0 left-0 w-full h-20 bg-white -translate-y-10 -skew-y-2"></div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-20 text-white">
                            <h2 className="text-4xl lg:text-5xl font-black mb-6">How it works?</h2>
                            <p className="text-lg lg:text-xl font-bold opacity-90 max-w-3xl mx-auto">
                                Embark on your dream adventure with affordable scooter and motorcycle rentals from RIDEHUB.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                            {[
                                {
                                    icon: <Calendar size={42} className="text-orange-600" />,
                                    text: "Set the date of your ride and then search for the bike that you want"
                                },
                                {
                                    icon: <Bike size={42} className="text-orange-600" />,
                                    text: "Choose out of various bikes that best suits the trip you're about to take."
                                },
                                {
                                    icon: <MapPin size={42} className="text-orange-600" />,
                                    text: "Get suited up and head to the pick-up location to get your ride."
                                },
                                {
                                    icon: <Route size={42} className="text-orange-600" />,
                                    text: "Get ready to roll and have a nice time tripping!"
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center group">
                                    <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-8 shadow-2xl transform transition-transform group-hover:scale-110 duration-500">
                                        <div className="p-4 rounded-full border-4 border-orange-50 flex items-center justify-center">
                                            {item.icon}
                                        </div>
                                    </div>
                                    <p className="text-white text-base lg:text-lg font-black leading-tight max-w-[240px] tracking-tight">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-20 bg-white translate-y-10 -skew-y-2"></div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default UserDashboard;
