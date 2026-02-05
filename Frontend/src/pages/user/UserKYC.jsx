import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User as UserIcon, Mail, Phone, FileText, MapPin, Upload,
    CheckCircle, Clock, AlertCircle, ArrowRight, Camera, Calendar
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Leaflet fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const MapRecenter = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView([position.lat, position.lng], map.getZoom());
        }
    }, [position, map]);
    return null;
};

const UserKYC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [kycStatus, setKycStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: '',
        dob: null,
        permanentAddress: '',
        address: '', // Current address
        declaration: false
    });

    const [location, setLocation] = useState({ lat: 27.7172, lng: 85.3240 }); // Default location
    const [files, setFiles] = useState({
        nagriktaFront: null,
        nagriktaBack: null,
        userPhoto: null
    });

    const [previews, setPreviews] = useState({
        nagriktaFront: null,
        nagriktaBack: null,
        userPhoto: null
    });

    useEffect(() => {
        fetchKYCStatus();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (formData.address && formData.address.length > 3) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                }
            }
        }, 1500);

        return () => clearTimeout(delayDebounceFn);
    }, [formData.address]);

    const fetchKYCStatus = async () => {
        try {
            const res = await api.get('/api/kyc/my-status');
            setKycStatus(res.data.data);
            if (res.data.data) {
                const k = res.data.data;
                setFormData({
                    name: k.name,
                    email: k.email,
                    phoneNumber: k.phoneNumber,
                    dob: k.dob ? new Date(k.dob) : null,
                    permanentAddress: k.permanentAddress || '',
                    address: k.location?.address || '',
                    declaration: k.declaration || false
                });
                if (k.location?.coordinates?.length === 2) {
                    setLocation({ lat: k.location.coordinates[1], lng: k.location.coordinates[0] });
                }
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const { name, files: uploadedFiles } = e.target;
        if (uploadedFiles[0]) {
            setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
            setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(uploadedFiles[0]) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.declaration) {
            return toast.error('Please accept the declaration');
        }
        if (!formData.dob) {
            return toast.error('Please provide your date of birth');
        }

        // File validation
        if (!kycStatus || kycStatus.status === 'rejected') {
            if (!files.userPhoto) return toast.error('Please upload your passport size photo');
            if (!files.nagriktaFront) return toast.error('Please upload citizenship front');
            if (!files.nagriktaBack) return toast.error('Please upload citizenship back');
        }

        setSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'dob' && formData[key]) {
                data.append(key, formData[key].toISOString());
            } else {
                data.append(key, formData[key]);
            }
        });

        data.append('latitude', location.lat);
        data.append('longitude', location.lng);

        if (files.nagriktaFront) data.append('nagriktaFront', files.nagriktaFront);
        if (files.nagriktaBack) data.append('nagriktaBack', files.nagriktaBack);
        if (files.userPhoto) data.append('userPhoto', files.userPhoto);

        try {
            await api.post('/api/kyc', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('KYC submitted successfully!');
            fetchKYCStatus();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit KYC');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-1 pt-32">
                {loading ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-slate-400">Verifying Identity Records...</p>
                    </div>
                ) : kycStatus && kycStatus.status === 'verified' ? (
                    <div className="h-[70vh] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-50/50 via-transparent to-transparent">
                        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-green-900/5 max-w-md w-full text-center space-y-8 border border-green-100/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                <div className="relative w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
                                    <CheckCircle size={48} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Identity <span className="text-green-600">Verified</span></h2>
                                <p className="text-slate-500 font-medium leading-relaxed italic">Your account is fully verified. You can now rent, buy and sell motorcycles without restrictions.</p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
                            >
                                BACK TO DASHBOARD
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ) : kycStatus && kycStatus.status === 'pending' ? (
                    <div className="h-[70vh] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-50/50 via-transparent to-transparent">
                        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-orange-900/5 max-w-md w-full text-center space-y-8 border border-orange-100/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 bg-orange-500 rounded-full animate-pulse opacity-20"></div>
                                <div className="relative w-24 h-24 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-orange-500/20">
                                    <Clock size={48} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Under <span className="text-orange-600">Review</span></h2>
                                <p className="text-slate-500 font-medium leading-relaxed italic">Our team is reviewing your documents. This usually takes 24-48 business hours.</p>
                            </div>
                            <div className="p-5 bg-orange-50/50 rounded-3xl border border-orange-100/50 space-y-2">
                                <div className="flex items-center justify-center gap-2 text-orange-700 font-black text-xs uppercase tracking-widest">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                                    Pending Approval
                                </div>
                                <p className="text-[10px] text-orange-600/70 font-bold leading-relaxed">You will receive an email notification once your verification status is updated.</p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full border-2 border-slate-200 hover:border-slate-800 text-slate-800 font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                RETURN TO DASHBOARD
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 px-6">
                        <div className="max-w-5xl mx-auto space-y-8">
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-xs uppercase tracking-widest animate-bounce">
                                    <AlertCircle size={14} />
                                    Action Required
                                </div>
                                <h1 className="text-5xl font-black text-slate-900 tracking-tight">Complete Your <span className="text-orange-600">KYC</span></h1>
                                <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">To access all platform services, we need to verify your identity. Please provide accurate information.</p>
                            </div>

                            {kycStatus && kycStatus.status === 'rejected' && (
                                <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-500 mb-8">
                                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-red-800 font-black text-lg uppercase tracking-tighter">Verification Rejected</h3>
                                        <p className="text-red-700 mb-2 font-medium">Unfortunately, your previous KYC request was rejected.</p>
                                        <div className="p-3 bg-white/50 rounded-xl border border-red-200 italic text-red-900">
                                            " {kycStatus.adminNote} "
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                                <UserIcon className="text-orange-600" />
                                                Personal Information
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">Full Name</label>
                                                    <div className="relative group">
                                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="John Doe"
                                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none font-bold"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">Email Address</label>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                                                        <input
                                                            type="email"
                                                            required
                                                            disabled
                                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 border-2 border-slate-100 text-gray-500 cursor-not-allowed outline-none font-bold"
                                                            value={formData.email}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">Phone Number</label>
                                                    <div className="relative group">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="98XXXXXXXX"
                                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none font-bold"
                                                            value={formData.phoneNumber}
                                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">Date of Birth</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors z-10">
                                                            <Calendar size={20} />
                                                        </div>
                                                        <DatePicker
                                                            selected={formData.dob}
                                                            onChange={(date) => setFormData({ ...formData, dob: date })}
                                                            placeholderText="Select Date"
                                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none font-bold"
                                                            required
                                                            maxDate={new Date()}
                                                            showYearDropdown
                                                            scrollableYearDropdown
                                                            yearDropdownItemNumber={100}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">Permanent Address</label>
                                                    <div className="relative group">
                                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Kathmandu, Nepal"
                                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none font-bold"
                                                            value={formData.permanentAddress}
                                                            onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-6 border-t border-slate-100">
                                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                                <MapPin className="text-orange-600" />
                                                Current Location (Map)
                                            </h3>
                                            <div className="h-[300px] w-full rounded-3xl overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-200">
                                                <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                    <LocationMarker position={location} setPosition={setLocation} />
                                                    <MapRecenter position={location} />
                                                </MapContainer>
                                            </div>
                                            <div className="space-y-2 mt-4">
                                                <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">Location Address</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Current Location Address"
                                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none font-bold"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-450 font-bold uppercase tracking-tight ml-2">Click on the map to mark your current location</p>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100">
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <div className="relative mt-1">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.declaration}
                                                        onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })}
                                                    />
                                                    <div className="w-5 h-5 border-2 border-slate-200 rounded-md peer-checked:bg-orange-600 peer-checked:border-orange-600 transition-all flex items-center justify-center">
                                                        <CheckCircle size={14} className="text-white scale-0 peer-checked:scale-100 transition-transform" />
                                                    </div>
                                                </div>
                                                <span className="text-sm text-slate-600 font-bold leading-relaxed group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                                                    I hereby declare that the information provided is true and accurate.
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8 h-full">
                                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                            <Camera className="text-orange-600" />
                                            Documents
                                        </h3>

                                        <div className="space-y-6">
                                            {[
                                                { id: 'userPhoto', label: 'Passport Size Photo', icon: Camera },
                                                { id: 'nagriktaFront', label: 'Citizenship (Front)', icon: FileText },
                                                { id: 'nagriktaBack', label: 'Citizenship (Back)', icon: FileText },
                                            ].map((doc) => (
                                                <div key={doc.id} className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{doc.label}</label>
                                                    <label className="block group cursor-pointer">
                                                        <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 ${previews[doc.id] ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}>
                                                            {previews[doc.id] ? (
                                                                <img src={previews[doc.id]} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                                            ) : (
                                                                <div className="text-center">
                                                                    <Upload className="mx-auto text-slate-400 group-hover:text-orange-600 mb-2" size={24} />
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600">Upload</p>
                                                                </div>
                                                            )}
                                                            <input
                                                                type="file"
                                                                name={doc.id}
                                                                onChange={handleFileChange}
                                                                className="hidden"
                                                                accept="image/*"
                                                            />
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className={`w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-3 mt-8 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                        >
                                            {submitting ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    PROCCESSING...
                                                </div>
                                            ) : (
                                                <>
                                                    SUBMIT KYC
                                                    <ArrowRight size={24} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default UserKYC;
