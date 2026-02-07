import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User as UserIcon, Mail, Phone, FileText, MapPin, Upload,
    CheckCircle, Clock, AlertCircle, ArrowRight, Camera, Building2, Calendar
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../../context/AuthContext';
import SellerLayout from '../../components/layout/SellerLayout';

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
    return position === null ? null : <Marker position={position}></Marker>;
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

// Reusable KYC Preview Component
const KYCPreview = ({ kycStatus, isVerified, onEdit, onNavigate }) => {
    const themeColor = isVerified ? 'green' : 'orange';
    const statusText = isVerified ? 'Verified' : 'Under Review';
    const StatusIcon = isVerified ? CheckCircle : Clock;

    return (
        <div className="py-8 px-6 animate-fadeIn">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${themeColor}-100 text-${themeColor}-700 rounded-full font-bold text-xs uppercase tracking-widest ${!isVerified && 'animate-pulse'}`}>
                        <StatusIcon size={14} />
                        {statusText}
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                        Your <span className={`text-${themeColor}-600`}>Seller KYC {isVerified ? 'Details' : 'Submission'}</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                        {isVerified
                            ? 'Your business identity has been verified. Review your submitted information below.'
                            : 'Your documents are being reviewed. You can edit your submission while it\'s pending.'}
                    </p>
                </div>

                {/* KYC Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                            {/* Personal Information */}
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <UserIcon className={`text-${themeColor}-600`} />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'Full Name', value: kycStatus.name },
                                    { label: 'Email', value: kycStatus.email },
                                    { label: 'Phone Number', value: kycStatus.phoneNumber },
                                    { label: 'Date of Birth', value: new Date(kycStatus.dob).toLocaleDateString() },
                                ].map((field, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                                        <p className="text-slate-900 font-bold text-lg">{field.value}</p>
                                    </div>
                                ))}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Permanent Address</label>
                                    <p className="text-slate-900 font-bold text-lg">{kycStatus.permanentAddress}</p>
                                </div>
                            </div>

                            {/* Business Details */}
                            <div className="pt-6 border-t border-slate-100 space-y-6">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <Building2 className={`text-${themeColor}-600`} />
                                    Business Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Name</label>
                                        <p className="text-slate-900 font-bold text-lg">{kycStatus.businessName}</p>
                                    </div>
                                    {[
                                        { label: 'PAN Number', value: kycStatus.panNumber },
                                        { label: 'Registration Number', value: kycStatus.businessRegistrationNumber },
                                        { label: 'Business Contact', value: kycStatus.businessContactNumber },
                                    ].map((field, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                                            <p className="text-slate-900 font-bold text-lg">{field.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            {kycStatus.location && (
                                <div className="pt-6 border-t border-slate-100 space-y-4">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        <MapPin className={`text-${themeColor}-600`} />
                                        Shop Location
                                    </h3>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Address</label>
                                        <p className="text-slate-900 font-bold text-lg">{kycStatus.location.address}</p>
                                    </div>
                                    {kycStatus.location.coordinates?.length === 2 && (
                                        <div className="h-[300px] w-full rounded-3xl overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-200">
                                            <MapContainer center={[kycStatus.location.coordinates[1], kycStatus.location.coordinates[0]]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                <Marker position={[kycStatus.location.coordinates[1], kycStatus.location.coordinates[0]]}></Marker>
                                            </MapContainer>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <Camera className={`text-${themeColor}-600`} />
                                Documents
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Passport Size Photo', path: kycStatus.userPhoto },
                                    { label: 'Citizenship (Front)', path: kycStatus.nagriktaFront },
                                    { label: 'Citizenship (Back)', path: kycStatus.nagriktaBack },
                                    { label: 'PAN Document', path: kycStatus.panPhoto },
                                ].map((doc, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{doc.label}</label>
                                        <div className={`aspect-video rounded-2xl overflow-hidden border-2 border-${themeColor}-100 bg-${themeColor}-50`}>
                                            <img
                                                src={`http://localhost:5000/${doc.path}`}
                                                alt={doc.label}
                                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                onClick={() => window.open(`http://localhost:5000/${doc.path}`, '_blank')}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    {!isVerified && (
                        <button
                            onClick={onEdit}
                            className={`px-8 py-4 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-${themeColor}-600/30 flex items-center gap-2`}
                        >
                            <FileText size={20} />
                            EDIT SUBMISSION
                        </button>
                    )}
                    <button
                        onClick={onNavigate}
                        className="px-8 py-4 border-2 border-slate-200 hover:border-slate-800 text-slate-800 font-black rounded-2xl transition-all flex items-center gap-2"
                    >
                        {isVerified ? 'GO TO INVENTORY' : 'RETURN TO DASHBOARD'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SellerKYC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [kycStatus, setKycStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState(true);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: '',
        dob: null,
        permanentAddress: '',
        panNumber: '',
        businessName: '',
        businessRegistrationNumber: '',
        businessContactNumber: '',
        address: '',
        declaration: false
    });

    const [location, setLocation] = useState({ lat: 27.7172, lng: 85.3240 });
    const [files, setFiles] = useState({
        nagriktaFront: null,
        nagriktaBack: null,
        userPhoto: null,
        panPhoto: null
    });

    const [previews, setPreviews] = useState({
        nagriktaFront: null,
        nagriktaBack: null,
        userPhoto: null,
        panPhoto: null
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
                    panNumber: k.panNumber || '',
                    businessName: k.businessName || '',
                    businessRegistrationNumber: k.businessRegistrationNumber || '',
                    businessContactNumber: k.businessContactNumber || '',
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

        if (!kycStatus || kycStatus.status === 'rejected') {
            if (!files.userPhoto) return toast.error('Please upload your passport size photo');
            if (!files.nagriktaFront) return toast.error('Please upload citizenship front');
            if (!files.nagriktaBack) return toast.error('Please upload citizenship back');
            if (!files.panPhoto) return toast.error('Please upload PAN document');
        }

        setSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'dob') {
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
        if (files.panPhoto) data.append('panPhoto', files.panPhoto);

        try {
            await api.post('/api/kyc', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(kycStatus && kycStatus.status === 'pending' ? 'KYC updated successfully!' : 'KYC submitted successfully!');
            setViewMode(true);
            fetchKYCStatus();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit KYC');
        } finally {
            setSubmitting(false);
        }
    };

    // Render logic
    if (loading) {
        return (
            <SellerLayout>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing Identity Records...</p>
                </div>
            </SellerLayout>
        );
    }

    // Show preview for verified or pending (in view mode)
    if (kycStatus && (kycStatus.status === 'verified' || (kycStatus.status === 'pending' && viewMode))) {
        return (
            <SellerLayout>
                <KYCPreview
                    kycStatus={kycStatus}
                    isVerified={kycStatus.status === 'verified'}
                    onEdit={() => setViewMode(false)}
                    onNavigate={() => navigate('/seller/inventory')}
                />
            </SellerLayout>
        );
    }

    // Show form for new, rejected, or pending (in edit mode)
    return (
        <SellerLayout>
            <div className="py-8 px-6 animate-fadeIn">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-xs uppercase tracking-widest animate-bounce">
                            <AlertCircle size={14} />
                            Action Required
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Complete Your <span className="text-orange-600">KYC</span></h1>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">To start selling and managing bikes, we need to verify your identity. Please provide accurate information.</p>
                    </div>

                    {kycStatus && kycStatus.status === 'rejected' && (
                        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-red-800 font-black text-lg">Verification Rejected</h3>
                                <p className="text-red-700 mb-2 font-medium">Unfortunately, your previous KYC request was rejected.</p>
                                <div className="p-3 bg-white/50 rounded-xl border border-red-200">
                                    <p className="text-red-900 italic">&quot; {kycStatus.adminNote} &quot;</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form fields */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                                {/* Personal Information */}
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
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none"
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
                                                    placeholder="john@example.com"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 border-2 border-slate-100 text-gray-500 cursor-not-allowed outline-none"
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
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none"
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
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none"
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
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none"
                                                    value={formData.permanentAddress}
                                                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Details */}
                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        <Building2 className="text-orange-600" />
                                        Business Details
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">Business Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="RideHub Motors"
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none"
                                                value={formData.businessName}
                                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">PAN Number</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="123456789"
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none"
                                                value={formData.panNumber}
                                                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">Registration Number</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="REG-99123"
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none"
                                                value={formData.businessRegistrationNumber}
                                                onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">Business Contact</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="01-XXXXXXX"
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none"
                                                value={formData.businessContactNumber}
                                                onChange={(e) => setFormData({ ...formData, businessContactNumber: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-600 ml-1 uppercase tracking-tight">Shop/Business Address</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Shop Location Address"
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-orange-500 transition-all outline-none"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Shop Location */}
                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        <MapPin className="text-orange-600" />
                                        Shop Location (Map)
                                    </h3>
                                    <div className="h-[300px] w-full rounded-3xl overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-200">
                                        <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <LocationMarker position={location} setPosition={setLocation} />
                                            <MapRecenter position={location} />
                                        </MapContainer>
                                    </div>
                                    <p className="text-xs text-slate-450 font-bold uppercase tracking-tight ml-2">Click on the map to mark your shop location</p>
                                </div>

                                {/* Declaration */}
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
                                        <span className="text-sm text-slate-600 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                                            I hereby declare that the information provided is true and accurate to the best of my knowledge. I understand that any false information may lead to rejection or account suspension.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* File uploads */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8 h-full">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <Camera className="text-orange-600" />
                                    Documents
                                </h3>

                                <div className="space-y-6">
                                    {[
                                        { id: 'userPhoto', label: 'Passport Size Photo' },
                                        { id: 'nagriktaFront', label: 'Citizenship (Front)' },
                                        { id: 'nagriktaBack', label: 'Citizenship (Back)' },
                                        { id: 'panPhoto', label: 'PAN Document Preview' },
                                    ].map((doc) => (
                                        <div key={doc.id} className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{doc.label}</label>
                                            <label className="block group cursor-pointer">
                                                <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 ${previews[doc.id] || (kycStatus && kycStatus[doc.id]) ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}>
                                                    {previews[doc.id] ? (
                                                        <img src={previews[doc.id]} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                                    ) : kycStatus && kycStatus[doc.id] ? (
                                                        <img src={`http://localhost:5000/${kycStatus[doc.id]}`} className="absolute inset-0 w-full h-full object-cover" alt="Existing" />
                                                    ) : (
                                                        <div className="text-center">
                                                            <Upload className="mx-auto text-slate-400 group-hover:text-orange-600 mb-2" size={24} />
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter group-hover:text-slate-600">Upload Image</p>
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

                                <div className="space-y-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-3 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                    >
                                        {submitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </div>
                                        ) : (
                                            <>
                                                {kycStatus && kycStatus.status === 'pending' && !viewMode ? 'UPDATE KYC' : 'Submit for Verification'}
                                                <ArrowRight size={24} />
                                            </>
                                        )}
                                    </button>
                                    {kycStatus && kycStatus.status === 'pending' && !viewMode && (
                                        <button
                                            type="button"
                                            onClick={() => setViewMode(true)}
                                            className="w-full border-2 border-slate-200 hover:border-slate-800 text-slate-800 font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2"
                                        >
                                            CANCEL
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerKYC;
