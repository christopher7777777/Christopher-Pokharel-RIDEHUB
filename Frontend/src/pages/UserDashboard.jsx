import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const UserDashboard = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <Header />

            <main>
                {/* Hero Section */}
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
                                <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-orange-200 transition-transform active:scale-95">
                                    View Ride Now
                                </button>
                                <button className="bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-800 hover:text-slate-900 px-8 py-4 rounded-xl font-bold transition-all active:scale-95">
                                    Sell Bike
                                </button>
                            </div>
                        </div>

                        <div className="relative animate-slideInRight lg:translate-x-10">
                            {/* Background Shape */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-100/50 to-blue-50/50 rounded-full blur-3xl -z-10"></div>

                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                                <img
                                    src="/image1.png"
                                    alt="Motorcycle"
                                    className="w-full h-auto object-cover transform hover:scale-105 transition-duration-700"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Motorcycles */}
                <section className="bg-slate-50 py-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Motorcycles</h2>
                            <p className="text-gray-500">Find the best deals on standard and premium bikes.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { name: "Yamaha MT-15", price: "Rs 130,000", image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
                                { name: "Honda Shine 100", price: "Rs 70,000", image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", featured: true },
                                { name: "Kawasaki Ninja 400", price: "Rs 175,000", image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }
                            ].map((bike, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-gray-100">
                                        <img src={bike.image} alt={bike.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900">
                                            For Sale
                                        </div>
                                    </div>
                                    <div className="px-2 pb-2">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{bike.name}</h3>
                                        <div className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wide">2023 Model • Used</div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-black text-orange-500">{bike.price}</span>
                                            <button className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${bike.featured ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                                                View Deal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                            <p className="text-gray-500">Get started in three simple steps</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {/* Connecting Line (Desktop) */}
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
        </div>
    );
};

export default UserDashboard;