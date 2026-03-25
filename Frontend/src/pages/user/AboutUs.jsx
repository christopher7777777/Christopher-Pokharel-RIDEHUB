import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Target, Users, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Header />

            <main>
                {/* Modern Hero Section */}
                <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-20 bg-slate-50 overflow-hidden">
                    <div className="absolute top-0 right-0 w-2/5 h-full bg-orange-500/5 -skew-x-12 translate-x-1/4 -z-0"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100/80 rounded-full border border-orange-200">
                                    <Zap className="text-orange-600" size={12} fill="currentColor" />
                                    <span className="text-orange-600 text-[10px] font-bold uppercase tracking-widest">Our Legacy</span>
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 uppercase tracking-tighter leading-[0.9] mb-4">
                                    Ride To <br />
                                    <span className="text-orange-500 italic">Inspire.</span>
                                </h1>
                                <p className="text-gray-500 text-base font-medium max-w-lg leading-relaxed">
                                    RIDEHUB is a premier motorcycle ecosystem designed for the modern rider. We combine engineering excellence with digital innovation to create the ultimate marketplace.
                                </p>

                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-orange-500/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <img
                                    src="/image 7.png"
                                    alt="RIDEHUB Excellence"
                                    className="w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-700 drop-shadow-xl"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-16 lg:py-24 px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 space-y-3">
                            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tighter">Why Choose <span className="text-orange-500">RideHub?</span></h2>
                            <p className="text-gray-400 text-base font-medium max-w-2xl mx-auto">We aren&apos;t just selling bikes; we&apos;re building the future of riding culture.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { 
                                    icon: <Target className="text-orange-500" size={28} />, 
                                    title: "Perfect Accuracy", 
                                    desc: "Our verification process ensures that every detail of the motorcycle is accurately represented.",
                                    img: "/image4.png"
                                },
                                { 
                                    icon: <Users className="text-orange-500" size={28} />, 
                                    title: "Biker Community", 
                                    desc: "Join a network of thousands of enthusiasts sharing tips, routes, and experiences.",
                                    img: "/image3.png"
                                },
                                { 
                                    icon: <CheckCircle2 className="text-orange-500" size={28} />, 
                                    title: "Verified Sellers", 
                                    desc: "Every seller on our platform undergoes a rigorous background check for your safety.",
                                    img: "/image2.png"
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="group bg-slate-50 p-8 rounded-[2.5rem] border border-transparent hover:border-orange-100 hover:bg-white hover:shadow-xl transition-all h-full">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-orange-50 transition-colors">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-tight">{item.title}</h3>
                                    <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6">{item.desc}</p>
                                    <div className="relative h-32 overflow-hidden rounded-2xl">
                                        <img src={item.img} alt={item.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission Statement */}
                <section className="py-16 lg:py-24 bg-slate-50 px-6 overflow-hidden relative border-t border-slate-100">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div className="relative order-2 lg:order-1">
                                <img src="/image1.png" alt="Mission" className="w-full max-w-sm mx-auto transform hover:-rotate-3 transition-transform duration-700 drop-shadow-xl" />
                            </div>
                            <div className="space-y-6 order-1 lg:order-2">
                                <h3 className="text-3xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tighter leading-none">
                                    Our <span className="text-orange-500">Mission.</span>
                                </h3>
                                <p className="text-gray-500 text-base lg:text-lg font-medium leading-relaxed">
                                    To revolutionize the motorcycle marketplace by providing a transparent, efficient, and user-friendly platform. We empower riders to find their dream machines without the hassle.
                                </p>
                                <ul className="space-y-3">
                                    {["Premium Quality Control", "Secure Global Payments", "24/7 Expert Support"].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-800 font-bold text-[10px] uppercase tracking-[0.2em]">
                                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
