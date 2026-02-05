import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/api/messages', formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Header />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Contact Form</h1>
                </div>

                {/* Contact form */}
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 lg:p-12 mb-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Form image */}
                        <div className="relative flex justify-center items-center p-8 bg-gray-50 rounded-3xl">
                            <img
                                src="/image2.png"
                                alt="Contact Us"
                                className="w-full h-auto object-contain mix-blend-multiply transform hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Form fields */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-6 uppercase text-sm tracking-wide">Provide Detail For Contact With US</h2>

                            {submitted ? (
                                <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center animate-fadeIn">
                                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-900 mb-2">Message Sent!</h3>
                                    <p className="text-green-700 text-sm mb-6">Thank you for reaching out. We will get back to you shortly.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-green-600 font-bold text-sm hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
                                            {error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your full name"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your email address"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter phone number"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="4"
                                            placeholder="Enter your complete address or message"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 disabled:bg-gray-400 transition-all shadow-lg shadow-red-200 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Submit
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact steps */}
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
