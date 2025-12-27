import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-50 -z-10 rounded-bl-[100px] hidden lg:block"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="animate-slideInLeft">
                                <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-bold mb-6">
                                    Welcome back, {user?.name?.split(' ')[0]}! 🏍️
                                </span>
                                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
                                    Your Ultimate <span className="text-orange-600">Ride</span> is Waiting.
                                </h1>
                                <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl">
                                    Experience the thrill of the open road. Whether you're looking to buy, sell, or rent locally, RIDEHUB connects you with the best bikes and the riding community.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 transform hover:-translate-y-1 transition-all duration-300">
                                        Explore Listings
                                    </button>
                                    <button className="bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-4 rounded-2xl font-bold transform hover:-translate-y-1 transition-all duration-300">
                                        Sell Your Bike
                                    </button>
                                </div>
                            </div>

                            <div className="relative animate-slideInRight">
                                <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                    {/* Using a placeholder for now, but in a real case we'd use an image. I'll use a gradient with an icon for premium feel */}
                                    <div className="aspect-[4/5] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center p-12">
                                        <svg className="w-full text-white/20" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                        </svg>
                                        <div className="absolute inset-x-8 bottom-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                            <p className="text-white font-bold text-xl mb-1">2024 Super Sport</p>
                                            <p className="text-orange-100 text-sm">Recently Listed • New York</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-200 rounded-3xl -z-10 animate-pulse"></div>
                                <div className="absolute -top-6 -right-6 w-24 h-24 border-4 border-orange-500 rounded-full -z-10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories / Services Section */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4">What are you looking for?</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto italic">Explore our specialized services tailored for every rider's needs.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: 'Buy a Bike', desc: 'Browse through thousands of certified pre-owned and new motorcycles.', icon: '🛒', color: 'bg-blue-50', text: 'text-blue-600' },
                                { title: 'Sell Yours', desc: 'Get the best value for your motorcycle. List for free and reach thousands.', icon: '🏷️', color: 'bg-orange-50', text: 'text-orange-600' },
                                { title: 'Rent Nearby', desc: 'Perfect for weekend trips or trying out a new model before buying.', icon: '🔑', color: 'bg-green-50', text: 'text-green-600' },
                            ].map((item, idx) => (
                                <div key={idx} className="group bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                    <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transform group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {item.desc}
                                    </p>
                                    <button className={`${item.text} font-bold flex items-center gap-2 group-hover:gap-3 transition-all`}>
                                        Learn More
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gray-900 rounded-[50px] p-8 lg:p-20 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[120px] opacity-20"></div>
                            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                                <div className="text-center lg:text-left">
                                    <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">Ready to hit the road?</h2>
                                    <p className="text-gray-400 text-lg max-w-xl">Join our community today and get access to exclusive deals and riding routes nearby.</p>
                                </div>
                                <div className="flex gap-4">
                                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-2xl font-bold transition-all whitespace-nowrap">
                                        Get Started Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default UserDashboard;