import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronRight, HelpCircle, Shield, CreditCard, Bike, User, Home, Search, MessageSquare, Menu, Edit2, Mail, Volume2, ExternalLink, XCircle, ThumbsUp, Paperclip, Smile } from 'lucide-react';

const FAQ_DATA = [
    {
        id: 1,
        icon: <Bike size={18} />,
        question: "How do I list my bike?",
        answer: "To list your bike, go to the 'Sell Bike' section from your dashboard, fill in the details about your motorcycle, upload clear photos, and set your price. Once submitted, our team will review the listing.",
        category: "selling"
    },
    {
        id: 2,
        icon: <Shield size={18} />,
        question: "What is KYC verification?",
        answer: "KYC (Know Your Customer) is a mandatory safety process. You need to upload your citizenship/ID and a selfie. This ensures all buyers and sellers on RIDEHUB are verified and real.",
        category: "security"
    },
    {
        id: 3,
        icon: <CreditCard size={18} />,
        question: "Are payments secure?",
        answer: "Yes! RIDEHUB uses secure payment gateways. Funds are held in escrow and only released to the seller after the buyer confirms the bike's condition and delivery.",
        category: "payments"
    },
    {
        id: 4,
        icon: <User size={18} />,
        question: "Can I edit my profile?",
        answer: "Absolutely. Head over to the 'Profile' section where you can update your contact information, profile picture, and change your password.",
        category: "account"
    },
    {
        id: 5,
        icon: <HelpCircle size={18} />,
        question: "How do I contact a seller?",
        answer: "On any bike details page, you can use the 'Inquiry' button to send a message or see the seller's verified contact details to arrange a meeting.",
        category: "buying"
    },
    {
        id: 6,
        icon: <HelpCircle size={18} />,
        question: "How to promote my listing?",
        answer: "You can feature your bike on the homepage by selecting the 'Promote' option in your seller dashboard. This increases visibility by up to 3x.",
        category: "selling"
    },
    {
        id: 7,
        icon: <CreditCard size={18} />,
        question: "What are the selling fees?",
        answer: "RIDEHUB charges a flat 5% commission on successful sales. There are no listing fees for the first 3 bikes.",
        category: "payments"
    }
];

const SupportChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('home'); // 'home', 'chat', 'messages'
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const fileInputRef = useRef(null);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Namaste! 🙏 I am your RIDEHUB Assistant. How can I help you today?', time: new Date() }
    ]);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (view === 'chat') {
            scrollToBottom();
        }
    }, [messages, view]);

    const handleFaqClick = (faq) => {
        setMessages(prev => [...prev,
        { type: 'user', text: faq.question, time: new Date() },
        { type: 'bot', text: faq.answer, time: new Date() }
        ]);
        setView('chat');
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredFaqs = searchQuery
        ? FAQ_DATA.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()))
        : FAQ_DATA.slice(0, 3);

    const generateResponse = (message) => {
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.match(/\b(hi|hello|hey|namaste|greetings)\b/)) {
            return "Hello! 👋 How can I assist you with RIDEHUB today?";
        }
        if (lowerMsg.includes('sell') || lowerMsg.includes('list')) {
            return "To sell your bike, go to your Dashboard and click 'Sell Bike'. You'll need to upload photos and provide details.";
        }
        if (lowerMsg.includes('buy') || lowerMsg.includes('purchase')) {
            return "You can browse verified bikes in the 'Browse' section. Use filters to find your perfect ride!";
        }
        if (lowerMsg.includes('rent')) {
            return "To rent a bike, simply browse our listings, select the rental period you need, and send a request to the owner. It's that easy!";
        }
        if (lowerMsg.includes('kyc') || lowerMsg.includes('verify')) {
            return "KYC verification is mandatory for safety. Go to 'Profile' > 'KYC' to upload your documents.";
        }
        if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('fee')) {
            return "Listing is free for the first 3 bikes! We charge a small 5% commission only when your bike sells.";
        }
        if (lowerMsg.includes('contact') || lowerMsg.includes('support')) {
            return "You can email us at support@ridehub.com or call our helpline at +977-9800000000.";
        }

        return "I'm not sure about that. You can try searching our Help Center above, or a human agent will be with you shortly.";
    };

    const handleSendMessage = (text) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, { type: 'user', text, time: new Date() }]);

        setTimeout(() => {
            const response = generateResponse(text);
            setMessages(prev => [...prev, { type: 'bot', text: response, time: new Date() }]);
        }, 1000);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleSendMessage(`Sent an attachment: ${file.name} 📎`);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999] font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[380px] md:w-[400px] bg-gray-50 rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden animate-fadeInScale flex flex-col h-[650px] max-h-[80vh]">

                    {/* Header Background */}
                    <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-orange-600 to-orange-500 rounded-b-[40px] z-0"></div>

                    {/* Main Content */}
                    <div className="relative z-10 flex flex-col h-full">

                        {/* Top Bar */}
                        <div className="flex justify-end p-6">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* View Content */}
                        <div className="flex-1 overflow-hidden flex flex-col px-6">

                            {view === 'home' && (
                                <div className="flex flex-col h-full animate-fadeIn">
                                    <div className="text-white mb-6">
                                        <h2 className="text-3xl font-black tracking-tight mb-2">Hi there 👋</h2>
                                        <p className="text-orange-100 font-medium leading-relaxed opacity-90">
                                            Need help? Search our help center for answers or start a conversation.
                                        </p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 -mx-6 px-6 space-y-4">
                                        {/* Help Center Card */}
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <HelpCircle size={18} className="text-orange-600" />
                                                Help Center
                                            </h3>

                                            <div className="relative mb-6">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Search for answers"
                                                    value={searchQuery}
                                                    onChange={handleSearch}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                {filteredFaqs.map((faq) => (
                                                    <button
                                                        key={faq.id}
                                                        onClick={() => handleFaqClick(faq)}
                                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 text-left group transition-colors"
                                                    >
                                                        <span className="text-sm text-gray-600 group-hover:text-orange-700 font-medium">{faq.question}</span>
                                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-500" />
                                                    </button>
                                                ))}
                                                {filteredFaqs.length === 0 && (
                                                    <p className="text-sm text-gray-400 text-center py-2">No answers found</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* New Conversation Card */}
                                        <button
                                            onClick={() => setView('chat')}
                                            className="w-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all"
                                        >
                                            <div className="text-left">
                                                <h3 className="font-bold text-gray-900 mb-1">New Conversation</h3>
                                                <p className="text-xs text-gray-500">We typically reply in a few minutes</p>
                                            </div>
                                            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                                                <Send size={18} className="-ml-0.5" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {view === 'chat' && (
                                <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden animate-slideUp relative">
                                    <div className="bg-orange-600 p-4 shrink-0 flex items-center justify-between text-white shadow-sm z-20 relative">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setView('home')} className="p-1 hover:bg-white/10 rounded-lg">
                                                <ChevronRight className="rotate-180" size={20} />
                                            </button>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative">
                                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                        <MessageCircle size={18} fill="white" className="text-white" />
                                                    </div>
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg leading-none">RIDEHUB AI</h3>
                                                    <p className="text-[11px] opacity-90 font-medium">AI Assistant</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                                        {messages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                                {msg.type === 'bot' && (
                                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0 mr-2 self-end mb-1">
                                                        <MessageCircle size={16} fill="white" />
                                                    </div>
                                                )}
                                                <div className={`max-w-[75%] p-4 rounded-xl text-[15px] leading-relaxed shadow-sm ${msg.type === 'user'
                                                    ? 'bg-orange-600 text-white rounded-br-none'
                                                    : 'bg-indigo-600 text-white rounded-bl-none'
                                                    }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>

                                    <div className="p-4 bg-white border-t border-gray-100">
                                        {/* Hidden File Input */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-2 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
                                            <input
                                                type="text"
                                                placeholder="Type here and press enter.."
                                                id="chat-input-field"
                                                className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSendMessage(inputValue);
                                                        setInputValue('');
                                                    }
                                                }}
                                            />
                                            <div className="flex items-center gap-1 pr-1">
                                                <button
                                                    onClick={() => handleSendMessage('👍')}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors"
                                                    title="Send Thumbs Up"
                                                >
                                                    <ThumbsUp size={18} />
                                                </button>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors"
                                                    title="Attach File"
                                                >
                                                    <Paperclip size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setInputValue(prev => prev + '😊')}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors"
                                                    title="Add Emoji"
                                                >
                                                    <Smile size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Bottom Navigation */}
                        <div className="bg-white border-t border-gray-100 p-2 grid grid-cols-2 gap-2 mt-auto">
                            <button
                                onClick={() => setView('home')}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${view === 'home' ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:bg-gray-50'
                                    }`}
                            >
                                <Home size={22} className={view === 'home' ? 'fill-current' : ''} />
                            </button>
                            <button
                                onClick={() => setView('chat')}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${view === 'chat' ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:bg-gray-50'
                                    }`}
                            >
                                <MessageSquare size={22} className={view === 'chat' ? 'fill-current' : ''} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 p-4 rounded-full shadow-2xl transition-all duration-500 active:scale-95 group ${isOpen
                    ? 'bg-gray-900 text-white translate-y-2'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
            >
                <div className="relative">
                    {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                    {!isOpen && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-orange-500 rounded-full animate-pulse"></div>
                    )}
                </div>
                {!isOpen && <span className="font-black text-sm uppercase tracking-wider pr-2 hidden md:block">Help Center</span>}
            </button>
        </div>
    );
};

export default SupportChat;
