import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
                <h1 className="text-4xl font-black text-slate-900 mb-16 uppercase tracking-tight">About Us</h1>

                {/* Section 1 */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-24">
                    <div className="order-2 lg:order-1">
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Description</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                RIDEHUB is your premier destination for premium motorcycles. We combine cutting-edge technology with a passion for riding.
                                Our platform ensures a seamless experience for buying, selling, and renting motorcycles, connecting riders with the best machines on the market.
                                We verify every listing to ensure quality and trust in our community.
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">Verified Listings</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">Secure Payments</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <img
                            src="/image2.png"
                            alt="About RideHub"
                            className="w-full mix-blend-multiply object-contain hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>

                {/* Section 2 */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-24">
                    <div className="order-1">
                        <img
                            src="/image4.png"
                            alt="Our Mission"
                            className="w-full mix-blend-multiply object-contain hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="order-2">
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Our Mission</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                To revolutionize the motorcycle marketplace by providing a transparent, efficient, and user-friendly platform.
                                We empower riders to find their dream bikes without the hassle of traditional dealerships.
                                Whether you are a casual rider or a track enthusiast, RIDEHUB has something for everyone.
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">Community Driven</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">Expert Reviews</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">Global Reach</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3 (Optional / Extra Content to match layout flow) */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Join The Ride</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Start your journey with us today. RIDEHUB is more than just a marketplace; it's a community of passionate riders.
                                Share your experiences, find riding buddies, and discover new routes.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">Events & Meetups</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <img
                            src="/image3.png"
                            alt="Community"
                            className="w-full mix-blend-multiply object-contain hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
