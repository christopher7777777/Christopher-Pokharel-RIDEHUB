import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Image as ImageIcon,
    Camera,
    Plus,
    X,
    ChevronDown,
    Loader2
} from 'lucide-react';
import Footer from '../../components/Footer';

const ListBike = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        engineCapacity: '',
        modelYear: '',
        condition: 'A',
        price: '',
        mileage: '',
        category: 'Standard',
        additionalDetails: '',
        listingType: 'Sale'
    });

    const [photos, setPhotos] = useState({
        frontView: null,
        sideView: null,
        dashboard: null,
        engine: null,
        additional: []
    });

    const [bluebook, setBluebook] = useState(null);

    const [previewUrls, setPreviewUrls] = useState({
        frontView: null,
        sideView: null,
        dashboard: null,
        engine: null,
        additional: [],
        bluebook: null
    });

    const brands = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Hero', 'Bajaj', 'TVS', 'Royal Enfield', 'KTM', 'Other'];
    const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e, photoType) => {
        const file = e.target.files[0];
        if (file) {
            if (photoType === 'additional') {
                setPhotos(prev => ({ ...prev, additional: [...prev.additional, file] }));
                setPreviewUrls(prev => ({ ...prev, additional: [...prev.additional, URL.createObjectURL(file)] }));
            } else if (photoType === 'bluebook') {
                setBluebook(file);
                setPreviewUrls(prev => ({ ...prev, bluebook: URL.createObjectURL(file) }));
            } else {
                setPhotos(prev => ({ ...prev, [photoType]: file }));
                setPreviewUrls(prev => ({ ...prev, [photoType]: URL.createObjectURL(file) }));
            }
        }
    };

    const removePhoto = (photoType, index = null) => {
        if (photoType === 'additional' && index !== null) {
            setPhotos(prev => ({ ...prev, additional: prev.additional.filter((_, i) => i !== index) }));
            setPreviewUrls(prev => ({ ...prev, additional: prev.additional.filter((_, i) => i !== index) }));
        } else if (photoType === 'bluebook') {
            setBluebook(null);
            setPreviewUrls(prev => ({ ...prev, bluebook: null }));
        } else {
            setPhotos(prev => ({ ...prev, [photoType]: null }));
            setPreviewUrls(prev => ({ ...prev, [photoType]: null }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.brand || !formData.model || !formData.price || !bluebook) {
            setError("Please fill in all required fields and upload bluebook.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();

            // Derive Name
            data.append('name', `${formData.brand} ${formData.model}`);

            // Append other info
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Append photos
            if (photos.frontView) data.append('images', photos.frontView);
            if (photos.sideView) data.append('images', photos.sideView);
            if (photos.dashboard) data.append('images', photos.dashboard);
            if (photos.engine) data.append('images', photos.engine);

            photos.additional.forEach(file => {
                data.append('images', file);
            });

            // Append bluebook
            if (bluebook) data.append('bluebook', bluebook);

            const response = await api.post('/api/bikes', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                navigate('/my-selling');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to list bike');
        } finally {
            setLoading(false);
        }
    };

    const conditionGrades = [
        { grade: 'A', label: 'Grade A', description: 'Excellent condition' },
        { grade: 'B', label: 'Grade B', description: 'Good condition' },
        { grade: 'C', label: 'Grade C', description: 'Needs attention' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm py-4">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <Link to="/dashboard" className="text-2xl font-black text-gray-900">RIDE<span className="text-orange-600">HUB</span></Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-600">{user?.name}</span>
                        <button onClick={logout} className="text-xs font-black uppercase tracking-widest text-red-500">Logout</button>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
                <div className="text-center mb-10 animate-fadeIn">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Sell Your Bike</h1>
                    <p className="text-gray-500 italic">Get the best price from our verified dealers</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 flex items-center gap-3 animate-shake">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-sm text-red-700 font-bold">{error}</p>
                    </div>
                )}

                <div className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slideInUp">
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                            <FileText className="text-orange-600" size={24} /> 1. Basic Info
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Brand</label>
                                <select name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold transition-all appearance-none cursor-pointer">
                                    <option value="">Select Brand</option>
                                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Model</label>
                                <input name="model" value={formData.model} onChange={handleInputChange} placeholder="e.g. MT-15" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Engine (CC)</label>
                                <input type="number" name="engineCapacity" value={formData.engineCapacity} onChange={handleInputChange} placeholder="e.g. 150" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Model Year</label>
                                <select name="modelYear" value={formData.modelYear} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold transition-all">
                                    <option value="">Select Year</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Condition */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                            <CheckCircle className="text-orange-600" size={24} /> 2. Condition
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {conditionGrades.map((c) => (
                                <button key={c.grade} type="button" onClick={() => setFormData({ ...formData, condition: c.grade })} className={`p-6 rounded-3xl border-2 transition-all ${formData.condition === c.grade ? 'border-orange-500 bg-orange-50' : 'border-gray-50 hover:bg-gray-50'}`}>
                                    <div className={`text-2xl font-black mb-1 ${formData.condition === c.grade ? 'text-orange-600' : 'text-gray-300'}`}>{c.label}</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase">{c.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                            <Plus className="text-orange-600" size={24} /> 3. Pricing
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Asking Price (NPR)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g. 280000" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Mileage (km)</label>
                                <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} placeholder="e.g. 12000" className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Bluebook */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slideInUp" style={{ animationDelay: '0.25s' }}>
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                            <FileText className="text-orange-600" size={24} /> 4. Bluebook Photo
                        </h2>
                        <div className="relative aspect-[16/9] max-w-md mx-auto">
                            <input type="file" id="bluebook" className="hidden" onChange={(e) => handlePhotoUpload(e, 'bluebook')} />
                            <label htmlFor="bluebook" className={`w-full h-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${previewUrls.bluebook ? 'border-orange-500' : 'border-gray-200 hover:bg-orange-50'}`}>
                                {previewUrls.bluebook ? (
                                    <img src={previewUrls.bluebook} className="w-full h-full object-cover" alt="Bluebook" />
                                ) : (
                                    <div className="text-center">
                                        <Camera className="text-gray-300 mx-auto mb-2" size={48} />
                                        <p className="text-xs font-black text-gray-400 uppercase">Upload Bluebook Main Page</p>
                                    </div>
                                )}
                            </label>
                            {previewUrls.bluebook && (
                                <button
                                    onClick={() => removePhoto('bluebook')}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                            <Camera className="text-orange-600" size={24} /> 5. Bike Photos
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['frontView', 'sideView', 'dashboard', 'engine'].map((t) => (
                                <div key={t} className="relative aspect-square">
                                    <input type="file" id={t} className="hidden" onChange={(e) => handlePhotoUpload(e, t)} />
                                    <label htmlFor={t} className={`w-full h-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${previewUrls[t] ? 'border-orange-500' : 'border-gray-200 hover:bg-orange-50'}`}>
                                        {previewUrls[t] ? (
                                            <img src={previewUrls[t]} className="w-full h-full object-cover" alt={t} />
                                        ) : (
                                            <ImageIcon className="text-gray-300" size={32} />
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-[30px] font-black text-lg shadow-2xl shadow-orange-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : 'LIST BIKE FOR REVIEW'}
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ListBike;
