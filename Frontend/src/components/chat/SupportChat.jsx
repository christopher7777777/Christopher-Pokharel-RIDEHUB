import { Bike, ChevronRight, CreditCard, HelpCircle, Home, Loader2, MessageCircle, MessageSquare, Send, Shield, User, X, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import socket from '../../utils/socket';

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
    }
];

const SupportChat = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const fileInputRef = useRef(null);

    // AI/Bot Messages
    const [botMessages, setBotMessages] = useState([
        { type: 'bot', text: 'Namaste!  I am your RIDEHUB Assistant. How can I help you today?', time: new Date() }
    ]);

    // Real-time Chat States
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [realMessages, setRealMessages] = useState([]);
    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [sellers, setSellers] = useState([]);
    const [isLoadingSellers, setIsLoadingSellers] = useState(false);

    const chatEndRef = useRef(null);


    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Socket Setup
    useEffect(() => {
        if (user) {
            socket.connect();

            socket.on('receive_message', (message) => {
                if (activeConversation && message.conversationId === activeConversation._id) {
                    setRealMessages(prev => [...prev, message]);
                }
                // Refresh conversations
                fetchConversations();
            });

            return () => {
                socket.off('receive_message');
                socket.disconnect();
            };
        }
    }, [user, activeConversation]);

    useEffect(() => {
        const handleOpenChat = async (e) => {
            const { sellerId, bikeId, bikeName } = e.detail;
            setIsOpen(true);
            await startConversation(sellerId, bikeId);
        };

        window.addEventListener('openChat', handleOpenChat);
        return () => window.removeEventListener('openChat', handleOpenChat);
    }, []);

    const fetchConversations = async () => {
        try {
            setIsLoadingChats(true);
            const response = await api.get('/api/chat/conversations');
            setConversations(response.data.data);
        } catch (err) {
            console.error('Failed to fetch conversations', err);
        } finally {
            setIsLoadingChats(false);
        }
    };

    const fetchSellers = async () => {
        try {
            setIsLoadingSellers(true);
            const response = await api.get('/api/auth/sellers');
            // Filter out current user if they are a seller
            const filteredSellers = response.data.data.filter(s => s._id !== user?._id);
            setSellers(filteredSellers);
        } catch (err) {
            console.error('Failed to fetch sellers', err);
        } finally {
            setIsLoadingSellers(false);
        }
    };


    const startConversation = async (participantId, bikeId) => {
        try {
            setView('seller-chat');
            setIsLoadingChats(true);
            const response = await api.post('/api/chat/conversation', { participantId, bikeId });
            const conversation = response.data.data;
            setActiveConversation(conversation);

            // Join socket room
            socket.emit('join_conversation', conversation._id);

            // Fetch existing messages
            const msgResponse = await api.get(`/api/chat/messages/${conversation._id}`);
            setRealMessages(msgResponse.data.data);
        } catch (err) {
            console.error('Failed to start conversation', err);
        } finally {
            setIsLoadingChats(false);
        }
    };

    useEffect(() => {
        if (view === 'chat' || view === 'seller-chat') {
            scrollToBottom();
        }
    }, [botMessages, realMessages, view]);

    const handleFaqClick = (faq) => {
        setBotMessages(prev => [...prev,
        { type: 'user', text: faq.question, time: new Date() },
        { type: 'bot', text: faq.answer, time: new Date() }
        ]);
        setView('chat');
    };

    const generateResponse = (message) => {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.match(/\b(hi|hello|hey|namaste)\b/)) return "Namaste! 👋 How can I help you with RIDEHUB today?";
        if (lowerMsg.includes('sell')) return "Go to 'Sell Bike' in your dashboard, upload photos, and add details. Our team will review it shortly.";
        if (lowerMsg.includes('buy')) return "Browse verified bikes in the 'Browse' section. Use filters to find your perfect ride! 🚲";
        return "I'm not fully sure about that. Try searching our Help Center above, or contact us at support@ridehub.com for assistance.";
    };

    const handleSendBotMessage = (text) => {
        if (!text.trim()) return;
        setBotMessages(prev => [...prev, { type: 'user', text, time: new Date() }]);
        setTimeout(() => {
            const response = generateResponse(text);
            setBotMessages(prev => [...prev, { type: 'bot', text: response, time: new Date() }]);
        }, 800);
    };

    const handleSendRealMessage = async (text) => {
        if (!text.trim() || !activeConversation) return;

        const messageData = {
            conversationId: activeConversation._id,
            text,
            sender: user._id,
        };

        try {
            // Emit to socket
            socket.emit('send_message', messageData);

            // Save to DB
            await api.post('/api/chat/message', messageData);

            setRealMessages(prev => [...prev, { ...messageData, sender: { _id: user._id, name: user.name } }]);
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999] font-sans">
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[380px] md:w-[400px] bg-gray-50 rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden animate-fadeInScale flex flex-col h-[650px] max-h-[80vh]">
                    <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-orange-600 to-orange-500 rounded-b-[40px] z-0"></div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-center p-6 text-white">
                            <h2 className="text-xl font-bold">RIDEHUB Support</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col px-6">
                            {view === 'home' && (
                                <div className="flex flex-col h-full animate-fadeIn">
                                    <div className="text-white mb-6">
                                        <h2 className="text-3xl font-black tracking-tight mb-2">Hi {user?.name?.split(' ')[0]} 👋</h2>
                                        <p className="text-orange-100 font-medium opacity-90">How can we help you today?</p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 -mx-6 px-6 space-y-4">
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <HelpCircle size={18} className="text-orange-600" /> Help Center
                                            </h3>
                                            <div className="space-y-2">
                                                {FAQ_DATA.map((faq) => (
                                                    <button key={faq.id} onClick={() => handleFaqClick(faq)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 text-left group transition-colors">
                                                        <span className="text-sm text-gray-600 group-hover:text-orange-700 font-medium">{faq.question}</span>
                                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-500" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button onClick={() => setView('chat')} className="w-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                            <div className="text-left">
                                                <h3 className="font-bold text-gray-900 mb-1">AI Assistant</h3>
                                                <p className="text-xs text-gray-500">Ask basic questions</p>
                                            </div>
                                            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-200">
                                                <Zap size={18} />
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => { setView('conversations'); fetchConversations(); }}
                                            className="w-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all"
                                        >
                                            <div className="text-left">
                                                <h3 className="font-bold text-gray-900 mb-1">Messages</h3>
                                                <p className="text-xs text-gray-500">Chat with sellers and buyers</p>
                                            </div>
                                            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-200">
                                                <MessageSquare size={18} />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {view === 'chat' && (
                                <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden animate-slideUp">
                                    <div className="bg-orange-600 p-4 flex items-center gap-3 text-white">
                                        <button onClick={() => setView('home')} className="p-1 hover:bg-white/10 rounded-lg">
                                            <ChevronRight className="rotate-180" size={20} />
                                        </button>
                                        <h3 className="font-bold">AI Assistant</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gray-50">
                                        {botMessages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.type === 'user' ? 'bg-orange-600 text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="p-4 bg-white border-t">
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border">
                                            <input
                                                type="text"
                                                placeholder="Ask AI..."
                                                className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={(e) => { if (e.key === 'Enter') { handleSendBotMessage(inputValue); setInputValue(''); } }}
                                            />
                                            <button onClick={() => { handleSendBotMessage(inputValue); setInputValue(''); }} className="text-orange-600">
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {view === 'conversations' && (
                                <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden animate-slideUp">
                                    <div className="bg-orange-600 p-4 flex items-center justify-between text-white">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setView('home')} className="p-1 hover:bg-white/10 rounded-lg">
                                                <ChevronRight className="rotate-180" size={20} />
                                            </button>
                                            <h3 className="font-bold">Recent Messages</h3>
                                        </div>
                                        <button
                                            onClick={() => { setView('browse-sellers'); fetchSellers(); }}
                                            className="text-[10px] font-black uppercase bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            Find Sellers
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">

                                        {isLoadingChats ? (
                                            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-orange-600" /></div>
                                        ) : conversations.length > 0 ? (
                                            conversations.map(conv => (
                                                <button
                                                    key={conv._id}
                                                    onClick={() => startConversation(conv.participants.find(p => p._id !== user._id)._id, conv.bikeId?._id)}
                                                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors border-b border-gray-50 text-left"
                                                >
                                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                                                        {conv.participants.find(p => p._id !== user._id)?.name?.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 text-sm">{conv.participants.find(p => p._id !== user._id)?.name}</h4>
                                                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
                                                        <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase tracking-tighter">
                                                            {conv.bikeId ? `Regarding: ${conv.bikeId.name}` : 'General Chat'}
                                                        </p>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-300" />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-center py-20">
                                                <MessageSquare className="mx-auto text-gray-200 mb-4" size={48} />
                                                <p className="text-gray-400 text-sm font-medium">No conversations found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {view === 'browse-sellers' && (
                                <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden animate-slideUp">
                                    <div className="bg-orange-600 p-4 flex items-center gap-3 text-white font-sans">
                                        <button onClick={() => setView('conversations')} className="p-1 hover:bg-white/10 rounded-lg">
                                            <ChevronRight className="rotate-180" size={20} />
                                        </button>
                                        <div>
                                            <h3 className="font-bold">Available Sellers</h3>
                                            <p className="text-[10px] opacity-80 uppercase font-black">Chat directly with experts</p>
                                        </div>
                                    </div>

                                    <div className="p-4 border-b bg-gray-50/50">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search sellers by name..."
                                                className="w-full bg-white border border-gray-100 rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                        {isLoadingSellers ? (
                                            <div className="flex flex-col items-center justify-center p-20 gap-3 grayscale opacity-50">
                                                <Loader2 className="animate-spin text-orange-600" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Searching Network</p>
                                            </div>
                                        ) : sellers.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                            sellers.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(seller => (
                                                <button
                                                    key={seller._id}
                                                    onClick={() => startConversation(seller._id, null)}
                                                    className="w-full flex items-center gap-4 p-4 hover:bg-orange-50 rounded-2xl transition-all border-b border-gray-50 text-left group"
                                                >
                                                    <div className="relative">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center text-orange-600 font-black shadow-inner">
                                                            {seller.name.charAt(0)}
                                                        </div>
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-gray-900 text-sm group-hover:text-orange-700 transition-colors">{seller.name}</h4>
                                                            {seller.kycStatus === 'verified' && (
                                                                <Shield size={10} className="text-blue-500 fill-blue-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-medium">Verified RIDEHUB Seller</p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                                                        <MessageCircle size={14} />
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-center py-20 grayscale opacity-40">
                                                <User className="mx-auto text-gray-200 mb-4" size={48} />
                                                <p className="text-gray-400 text-xs font-black uppercase tracking-widest">No Sellers Found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {view === 'seller-chat' && (

                                <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden animate-slideUp">
                                    <div className="bg-orange-600 p-4 flex items-center justify-between text-white">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setView('conversations')} className="p-1 hover:bg-white/10 rounded-lg">
                                                <ChevronRight className="rotate-180" size={20} />
                                            </button>
                                            <div>
                                                <h3 className="font-bold leading-none">
                                                    {activeConversation?.participants?.find(p => p._id !== user?._id)?.name || 'Direct Chat'}
                                                </h3>
                                                <p className="text-[10px] opacity-80 mt-1 uppercase font-black">
                                                    {activeConversation?.bikeId?.name || 'General Chat'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gray-50">
                                        {realMessages.map((msg, idx) => {
                                            const isMe = (msg.sender?._id || msg.sender) === user?._id;
                                            return (
                                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${isMe ? 'bg-orange-600 text-white rounded-br-none shadow-orange-100 shadow-md' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="p-4 bg-white border-t">
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100">
                                            <input
                                                type="text"
                                                placeholder="Type your message..."
                                                className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={(e) => { if (e.key === 'Enter') { handleSendRealMessage(inputValue); setInputValue(''); } }}
                                            />
                                            <button
                                                onClick={() => { handleSendRealMessage(inputValue); setInputValue(''); }}
                                                className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white border-t p-2 grid grid-cols-3 gap-1 mt-auto shrink-0">
                            <button onClick={() => setView('home')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${view === 'home' ? 'text-orange-600 bg-orange-50' : 'text-gray-400'}`}>
                                <Home size={20} />
                                <span className="text-[10px] font-bold mt-1">Home</span>
                            </button>
                            <button onClick={() => setView('chat')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${view === 'chat' ? 'text-orange-600 bg-orange-50' : 'text-gray-400'}`}>
                                <Zap size={20} />
                                <span className="text-[10px] font-bold mt-1">AI</span>
                            </button>
                            <button onClick={() => { setView('conversations'); fetchConversations(); }} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${view === 'conversations' || view === 'seller-chat' ? 'text-orange-600 bg-orange-50' : 'text-gray-400'}`}>
                                <MessageSquare size={20} />
                                <span className="text-[10px] font-bold mt-1">Chat</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 p-4 rounded-full shadow-2xl transition-all duration-500 active:scale-95 ${isOpen ? 'bg-gray-900 text-white' : 'bg-orange-600 text-white hover:rotate-3 shadow-orange-200'}`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {!isOpen && <span className="font-black text-sm uppercase tracking-wider pr-2 hidden md:block">Help Hub</span>}
            </button>
        </div>
    );
};

export default SupportChat;
