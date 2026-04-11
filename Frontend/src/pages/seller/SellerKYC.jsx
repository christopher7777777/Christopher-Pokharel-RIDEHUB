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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getDocumentUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const normalizedPath = path.replace(/\\/g, '/');
    return `${API_BASE_URL}/${normalizedPath}`.replace(/([^:])(\/\/+)/g, '$1/');
};

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
    const StatusIcon = isVerified ? CheckCircle : Clock;

    return (
        <div className="py-20 px-6 animate-fadeIn">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 ${isVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'} rounded-full font-bold text-xs uppercase tracking-widest ${!isVerified && 'animate-pulse'}`}>
                        <StatusIcon size={14} />
                        {isVerified ? 'Verified' : 'Under Review'}
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Your Seller <span className={isVerified ? 'text-green-600' : 'text-orange-600'}>KYC {isVerified ? 'Details' : 'Submission'}</span></h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                        {isVerified
                            ? 'Your business identity has been verified. Review your submitted information below.'
                            : 'Your documents are being reviewed. You can edit your submission while it\'s pending.'}
                    </p>
                </div>

                {/* KYC Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <UserIcon className={isVerified ? 'text-green-600' : 'text-orange-600'} />
                                Personal & Business Info
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'Full Name', value: kycStatus.name },
                                    { label: 'Email', value: kycStatus.email },
                                    { label: 'Phone Number', value: kycStatus.phoneNumber },
                                    { label: 'Date of Birth', value: new Date(kycStatus.dob).toLocaleDateString() },
                                    { label: 'Permanent Address', value: kycStatus.permanentAddress },
                                    { label: 'PAN Number', value: kycStatus.panNumber },
                                ].map((field, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                                        <p className="text-slate-900 font-bold text-lg">{field.value || 'N/A'}</p>
                                    </div>
                                ))}
                                
                                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Business Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { label: 'Business Name', value: kycStatus.businessName },
                                            { label: 'Registration Number', value: kycStatus.businessRegistrationNumber },
                                            { label: 'Business Contact', value: kycStatus.businessContactNumber },
                                        ].map((field, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                                                <p className="text-slate-900 font-bold text-lg">{field.value || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {kycStatus.location && (
                                <div className="pt-6 border-t border-slate-100 space-y-4">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        <MapPin className={isVerified ? 'text-green-600' : 'text-orange-600'} />
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

                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <Camera className={isVerified ? 'text-green-600' : 'text-orange-600'} />
                                Documents
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Passport Size Photo', path: kycStatus.userPhoto },
                                    { label: 'Citizenship (Front)', path: kycStatus.nagriktaFront },
                                    { label: 'Citizenship (Back)', path: kycStatus.nagriktaBack },
                                    { label: 'Photo with Citizenship', path: kycStatus.photoWithCitizenship },
                                    { label: 'PAN Document', path: kycStatus.panPhoto },
                                ].filter(doc => doc.path).map((doc, idx) => (
                                    <div key={idx} className="space-y-2 group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{doc.label}</label>
                                        <div className={`aspect-video rounded-2xl overflow-hidden border-2 bg-slate-50 transition-all cursor-pointer hover:border-slate-400 ${isVerified ? 'border-green-100' : 'border-orange-100'}`}>
                                            <img
                                                src={getDocumentUrl(doc.path)}
                                                alt={doc.label}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                onClick={() => window.open(getDocumentUrl(doc.path), '_blank')}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    {!isVerified && (
                        <button
                            onClick={onEdit}
                            className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-orange-600/30 flex items-center gap-2"
                        >
                            <FileText size={20} />
                            EDIT SUBMISSION
                        </button>
                    )}
                    <button
                        onClick={onNavigate}
                        className="px-8 py-4 border-2 border-slate-200 hover:border-slate-800 text-slate-800 font-black rounded-2xl transition-all flex items-center gap-2"
                    >
                        {isVerified ? 'GO TO INVENTORY' : 'BACK TO DASHBOARD'}
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
        citizenshipNumber: '',
        citizenshipIssueDate: null,
        citizenshipIssueDistrict: '',
        declaration: false
    });

    const [location, setLocation] = useState({ lat: 27.7172, lng: 85.3240 });
    const [files, setFiles] = useState({
        nagriktaFront: null,
        nagriktaBack: null,
        userPhoto: null,
        panPhoto: null,
        photoWithCitizenship: null
    });

    const [previews, setPreviews] = useState({
        nagriktaFront: null,
        nagriktaBack: null,
        userPhoto: null,
        panPhoto: null,
        photoWithCitizenship: null
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
                    citizenshipNumber: k.citizenshipNumber || '',
                    citizenshipIssueDate: k.citizenshipIssueDate ? new Date(k.citizenshipIssueDate) : null,
                    citizenshipIssueDistrict: k.citizenshipIssueDistrict || '',
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
            if ((key === 'dob' || key === 'citizenshipIssueDate') && formData[key]) {
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
        if (files.photoWithCitizenship) data.append('photoWithCitizenship', files.photoWithCitizenship);

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

    if (loading) {
        return (
            <SellerLayout>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400">Verifying Identity Records...</p>
                </div>
            </SellerLayout>
        );
    }

    if (kycStatus && (kycStatus.status === 'verified' || (kycStatus.status === 'pending' && viewMode))) {
        return (
            <SellerLayout>
                <KYCPreview
                    kycStatus={kycStatus}
                    isVerified={kycStatus.status === 'verified'}
                    onEdit={() => setViewMode(false)}
                    onNavigate={() => navigate(kycStatus.status === 'verified' ? '/seller/inventory' : '/seller/dashboard')}
                />
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="py-12 px-6 animate-fadeIn">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-xs uppercase tracking-widest animate-bounce">
                            <AlertCircle size={14} />
                            {kycStatus && kycStatus.status === 'pending' ? 'Editing Submission' : 'Action Required'}
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                            {kycStatus && kycStatus.status === 'pending' ? 'Edit Your ' : 'Complete Your '}
                            <span className="text-orange-600">KYC</span>
                        </h1>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">To access seller services, we need to verify your business identity.</p>
                    </div>

                    {kycStatus && kycStatus.status === 'rejected' && (
                        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-red-800 font-black text-lg">Verification Rejected</h3>
                                <p className="text-red-700 mb-2 font-medium">Your previous request was rejected. Admin Note: <span className="italic">"{kycStatus.adminNote}"</span></p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-[2.5rem] p-10 space-y-8 shadow-xl shadow-slate-200/50">
                        <div className="space-y-8">
                            {/* Section 1: Personal */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <UserIcon className="text-orange-600" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { id: 'name', label: 'Full Name', type: 'text' },
                                        { id: 'phoneNumber', label: 'Phone Number', type: 'text' },
                                    ].map(field => (
                                        <div key={field.id}>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">{field.label}</label>
                                            <input
                                                type={field.type}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all text-slate-700 bg-white"
                                                value={formData[field.id]}
                                                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">Date of Birth</label>
                                        <DatePicker
                                            selected={formData.dob}
                                            onChange={(date) => setFormData({ ...formData, dob: date })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all text-slate-700 bg-white"
                                            required
                                            maxDate={new Date()}
                                            showYearDropdown
                                            scrollableYearDropdown
                                            yearDropdownItemNumber={100}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">Permanent Address</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all text-slate-700 bg-white"
                                            value={formData.permanentAddress}
                                            onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Business */}
                            <div className="pt-8 border-t border-slate-100 space-y-6">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <Building2 className="text-orange-600" />
                                    Business Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { id: 'businessName', label: 'Business Name', type: 'text' },
                                        { id: 'panNumber', label: 'PAN Number', type: 'text' },
                                        { id: 'businessRegistrationNumber', label: 'Registration Number', type: 'text' },
                                        { id: 'businessContactNumber', label: 'Business Contact', type: 'text' },
                                    ].map(field => (
                                        <div key={field.id}>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">{field.label}</label>
                                            <input
                                                type={field.type}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all text-slate-700 bg-white"
                                                value={formData[field.id]}
                                                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 3: Citizenship */}
                            <div className="pt-8 border-t border-slate-100 space-y-6">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <FileText className="text-orange-600" />
                                    Citizenship Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">Number</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all text-slate-700 bg-white"
                                            value={formData.citizenshipNumber}
                                            onChange={(e) => setFormData({ ...formData, citizenshipNumber: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">Issue Date</label>
                                        <DatePicker
                                            selected={formData.citizenshipIssueDate}
                                            onChange={(date) => setFormData({ ...formData, citizenshipIssueDate: date })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all text-slate-700 bg-white"
                                            maxDate={new Date()}
                                            showYearDropdown
                                            scrollableYearDropdown
                                            yearDropdownItemNumber={100}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">Issue District</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all text-slate-700 bg-white"
                                            value={formData.citizenshipIssueDistrict}
                                            onChange={(e) => setFormData({ ...formData, citizenshipIssueDistrict: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Location */}
                            <div className="pt-8 border-t border-slate-100 space-y-6">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <MapPin className="text-orange-600" />
                                    Business Location
                                </h3>
                                <div className="space-y-4">
                                    <div className="h-[300px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-200 relative z-0">
                                        <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <LocationMarker position={location} setPosition={setLocation} />
                                            <MapRecenter position={location} />
                                        </MapContainer>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">Full Address</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all text-slate-700 bg-white"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Documents */}
                            <div className="pt-8 border-t border-slate-100 space-y-6">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <Camera className="text-orange-600" />
                                    Documents
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {[
                                        { id: 'userPhoto', label: 'Passport Photo' },
                                        { id: 'nagriktaFront', label: 'Citizenship (Front)' },
                                        { id: 'nagriktaBack', label: 'Citizenship (Back)' },
                                        { id: 'photoWithCitizenship', label: 'With Citizenship' },
                                        { id: 'panPhoto', label: 'PAN Document' },
                                    ].map((doc) => (
                                        <div key={doc.id} className="space-y-2">
                                            <label className="cursor-pointer group block">
                                                <div className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center p-2 ${previews[doc.id] || (kycStatus && kycStatus[doc.id]) ? 'border-orange-500 bg-orange-50' : 'border-slate-200 border-dashed bg-slate-50 hover:bg-slate-100 hover:border-orange-300'}`}>
                                                    {previews[doc.id] ? (
                                                        <img src={previews[doc.id]} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                                    ) : kycStatus && kycStatus[doc.id] ? (
                                                        <img src={getDocumentUrl(kycStatus[doc.id])} className="absolute inset-0 w-full h-full object-cover" alt="Existing" />
                                                    ) : (
                                                        <div className="text-center">
                                                            <Upload size={20} className="text-slate-400 group-hover:text-orange-600 mx-auto" />
                                                        </div>
                                                    )}
                                                    <input type="file" name={doc.id} onChange={handleFileChange} className="hidden" accept="image/*" />
                                                </div>
                                            </label>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center truncate">{doc.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Declaration */}
                            <div className="pt-6 border-t border-slate-100">
                                <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <div className="pt-1">
                                        <input
                                            type="checkbox"
                                            checked={formData.declaration}
                                            onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })}
                                            className="w-5 h-5 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer transition-all"
                                        />
                                    </div>
                                    <span className="text-sm text-slate-600 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                                        I hereby declare that the information provided is true and accurate to the best of my knowledge. I understand that any false information may lead to rejection or account suspension.
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            {kycStatus && kycStatus.status === 'pending' && (
                                <button
                                    type="button"
                                    onClick={() => setViewMode(true)}
                                    className="px-8 py-4 border-2 border-slate-200 hover:border-slate-800 text-slate-800 font-black rounded-2xl transition-all"
                                >
                                    CANCEL
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-12 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-orange-600/30 flex items-center gap-2 group ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {submitting ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        {kycStatus && kycStatus.status === 'pending' ? 'UPDATE SUBMISSION' : 'SUBMIT VERIFICATION'}
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerKYC;
