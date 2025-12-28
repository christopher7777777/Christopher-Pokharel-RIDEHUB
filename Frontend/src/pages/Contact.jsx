import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Contact Form</h1>
                </div>

                {/* Contact Form Section */}
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 lg:p-12 mb-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Image */}
                        <div className="relative flex justify-center items-center p-8 bg-gray-50 rounded-3xl">
                            <img
                                src="/image2.png"
                                alt="Contact Us"
                                className="w-full h-auto object-contain mix-blend-multiply transform hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Right: Form */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-6 uppercase text-sm tracking-wide">Provide Detail For Contact With US</h2>
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter phone number"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Message</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Enter your complete address or message"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="button"
                                    className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 uppercase tracking-widest text-sm"
                                >
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* How To Contact Us Section */}
                <div className="text-center mb-16">
                    <h2 className="text-2xl font-black text-slate-900 mb-4">How To Contact Us ?</h2>
                    <p className="text-gray-500 text-sm">Get started in just three simple steps</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-orange-600">
                            1
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Contact Detail: 98000982340</h3>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                            Explore our extensive collection of motorcycles or use filters to find exactly what you need.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-orange-600">
                            2
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Email: Support@lic.edu.np</h3>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                            Contact sellers, schedule inspections, and verify all documents through our secure platform.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-orange-600">
                            3
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Find our nearest : Inaruwa-06</h3>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                            Finalize your transaction safely and start your motorcycle adventure with confidence.
                        </p>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default Contact;
