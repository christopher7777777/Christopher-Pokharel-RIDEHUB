import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { Send, CheckCircle2, Loader2, Phone, Mail, MapPin, MessageSquare, ArrowRight, User, Globe } from 'lucide-react';

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
        <div className="min-h-screen bg-white font-sans text-slate-800 relative overflow-hidden">
            <Header />
            
            <main className="max-w-7xl mx-auto px-6 pt-40 pb-20 relative z-10">
                <div className="grid lg:grid-cols-2 lg:gap-20 items-stretch bg-white shadow-2xl rounded-sm overflow-hidden min-h-[700px]">
                    
                    {/* Left: Contact Form */}
                    <div className="p-8 lg:p-16 space-y-10">
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                CONTACT <span className="text-orange-500">US</span>
                            </h1>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] max-w-md">
                                Feel free to contact us any time. We will get back to you as soon as we can!
                            </p>
                        </div>

                        {submitted ? (
                            <div className="py-12 animate-fadeIn text-center lg:text-left">
                                <div className="w-20 h-20 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-green-100 mx-auto lg:mx-0">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-3 uppercase tracking-tighter">Received!</h3>
                                <p className="text-gray-500 text-lg font-medium mb-10 max-w-sm">We&apos;ve received your message. Our team will verify and respond shortly.</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="px-10 py-4 bg-slate-900 text-white rounded-none font-bold text-xs uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-lg"
                                >
                                    New Message
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                                        <div className="relative">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Full Name"
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none text-xs font-bold transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Handset Contact</label>
                                        <div className="relative">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                placeholder="Phone Number"
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none text-xs font-bold transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Digital Mail</label>
                                        <div className="relative">
                                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="Email Address"
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none text-xs font-bold transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Message Field */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">The Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="4"
                                            placeholder="What's on your mind? (Address or specifics)..."
                                            className="w-full px-8 py-4 bg-slate-50 border border-transparent rounded-[2rem] focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none text-xs font-bold transition-all resize-none shadow-sm"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full lg:w-auto px-16 py-5 bg-slate-900 text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-orange-600 disabled:bg-slate-300 transition-all flex items-center justify-center gap-4 group"
                                    >
                                        {loading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            "SEND"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right: Info Card */}
                    <div className="bg-slate-900 p-8 lg:p-16 text-white relative flex flex-col justify-center">
                        {/* Decorative Orange Square */}
                        <div className="absolute top-0 left-0 w-12 h-12 bg-orange-500 -translate-x-1/2 -translate-y-1/2 lg:block hidden"></div>
                        
                        <div className="space-y-12 relative z-10">
                            <h2 className="text-5xl font-black uppercase tracking-tighter">Info</h2>
                            
                            <div className="space-y-10">
                                <div className="flex items-center gap-8 group">
                                    <div className="text-orange-500 transition-transform group-hover:scale-110">
                                        <Mail size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digital Hub</p>
                                        <p className="text-lg font-bold">support@ridehub.com</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 group">
                                    <div className="text-orange-500 transition-transform group-hover:scale-110">
                                        <Phone size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connect Directly</p>
                                        <p className="text-lg font-bold">+977 9800098234</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 group">
                                    <div className="text-orange-500 transition-transform group-hover:scale-110">
                                        <MapPin size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Headquarters</p>
                                        <p className="text-lg font-bold leading-none">Inaruwa-06, Nepal</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 group">
                                    <div className="text-orange-500 transition-transform group-hover:scale-110">
                                        <ArrowRight size={32} className="rotate-45" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Hours</p>
                                        <p className="text-lg font-bold">09:00 - 18:00 (NPT)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
