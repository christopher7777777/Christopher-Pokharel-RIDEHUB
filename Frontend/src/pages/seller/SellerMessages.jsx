import React, { useState, useEffect } from 'react';
import SellerLayout from '../../components/layout/SellerLayout';
import api from '../../utils/api';
import {
    MessageSquare,
    Mail,
    Phone,
    Calendar,
    Search,
    Loader2,
    MessageCircle,
    ExternalLink,
    User
} from 'lucide-react';

const SellerMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/api/messages');
            setMessages(response.data.data);
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = messages
        .filter(msg =>
            (msg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (msg.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (msg.message || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOrder === 'desc') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

    return (
        <SellerLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* List */}
                    <div className={`${selectedMessage ? 'hidden lg:block lg:w-1/3' : 'w-full'}`}>
                        <div className="mb-6">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Inquiries</h1>
                            <p className="text-gray-500 text-sm italic">Direct customer inquiries from your contact form.</p>
                        </div>

                        <div className="sticky top-24 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-[24px] border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                                {loading ? (
                                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div>
                                ) : filteredMessages.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400 italic text-sm">No messages found.</div>
                                ) : (
                                    <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                                        {filteredMessages.map((msg) => (
                                            <button
                                                key={msg._id}
                                                onClick={() => setSelectedMessage(msg)}
                                                className={`w-full p-5 text-left transition-all hover:bg-orange-50/50 flex gap-4 ${selectedMessage?._id === msg._id ? 'bg-orange-50 border-l-4 border-l-orange-600' : ''}`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black flex-shrink-0 ${selectedMessage?._id === msg._id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    {(msg.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-gray-900 truncate pr-2">{msg.name}</h4>
                                                        <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                                                            {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detail */}
                    <div className={`flex-1 ${!selectedMessage ? 'hidden lg:flex' : 'flex'} flex-col`}>
                        {selectedMessage ? (
                            <div className="animate-fadeIn space-y-6">
                                {/* Header */}
                                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="lg:hidden mb-6 text-orange-600 font-bold text-sm flex items-center gap-1"
                                    >
                                        ← BACK TO LIST
                                    </button>

                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex gap-6">
                                            <div className="w-20 h-20 bg-orange-100 rounded-[30px] flex items-center justify-center text-orange-600 text-3xl font-black">
                                                {(selectedMessage.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-3xl font-black text-gray-900 mb-2 truncate">{selectedMessage.name}</h2>
                                                <div className="flex flex-wrap gap-2 sm:gap-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-xl">
                                                        <Mail size={16} /> <span className="truncate">{selectedMessage.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-xl">
                                                        <Phone size={16} /> {selectedMessage.phone}
                                                    </div>
                                                    <span className="flex items-center gap-2 text-sm text-gray-400 font-medium bg-gray-50 px-3 py-1.5 rounded-xl">
                                                        <Calendar size={16} /> {new Date(selectedMessage.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
                                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <MessageCircle size={20} className="text-orange-600" /> Customer Message
                                    </h3>
                                    <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 relative min-h-[200px] mb-8">
                                        <span className="absolute top-4 left-4 text-4xl text-orange-200 opacity-50 font-serif">"</span>
                                        <p className="text-gray-700 text-lg leading-relaxed italic relative z-10 whitespace-pre-wrap">
                                            {selectedMessage.message}
                                        </p>
                                    </div>

                                    <div className="flex justify-center">
                                        <a
                                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedMessage.email}&su=Regarding your inquiry on RIDEHUB&body=Hi ${selectedMessage.name},`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full max-w-2xl bg-orange-600 text-white px-8 py-5 rounded-[24px] font-black text-center hover:bg-orange-700 shadow-xl shadow-orange-900/40 transition-all flex items-center justify-center gap-3 text-lg"
                                        >
                                            REPLY VIA GMAIL <ExternalLink size={20} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border border-dashed border-gray-200">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <MessageSquare size={40} className="text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Select an inquiry to view</h3>
                                <p className="text-gray-400 italic max-w-sm">Choose a message from the list to see full details and reply.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerMessages;
