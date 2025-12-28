import { AlertCircle, Bike, Calendar, DollarSign, Gauge, Loader2, Package, Tag, Trash2, Upload, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../utils/api';

const BikeFormModal = ({ isOpen, onClose, bike, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        modelYear: '',
        engineCapacity: '',
        mileage: '',
        listingType: 'Rental',
        price: '',
        category: '',
        condition: 'Excellent'
    });

    useEffect(() => {
        if (bike) {
            setFormData({
                name: bike.name || '',
                brand: bike.brand || '',
                model: bike.model || '',
                modelYear: bike.modelYear || '',
                engineCapacity: bike.engineCapacity || '',
                mileage: bike.mileage || '',
                listingType: bike.listingType || 'Rental',
                price: bike.price || '',
                category: bike.category || '',
                condition: bike.condition || 'Excellent'
            });
            setExistingImages(bike.images || []);
        } else {
            setFormData({
                name: '',
                brand: '',
                model: '',
                modelYear: '',
                engineCapacity: '',
                mileage: '',
                listingType: 'Rental',
                price: '',
                category: '',
                condition: 'Excellent'
            });
            setExistingImages([]);
        }
        setSelectedFiles([]);
        setPreviews([]);
    }, [bike, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Limit to 4 images total (existing + new)
        const totalCount = existingImages.length + selectedFiles.length + files.length;
        if (totalCount > 4) {
            setError("You can only upload a maximum of 4 images.");
            return;
        }

        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setError(null);
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeSelectedFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);

        // Revoke the URL to avoid memory leaks
        URL.revokeObjectURL(previews[index]);
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();

            // Append all form fields except 'images'
            Object.keys(formData).forEach(key => {
                if (key !== 'images') {
                    data.append(key, formData[key]);
                }
            });

            // Append existing images as a separate field
            existingImages.forEach(img => {
                data.append('existingImages', img);
            });

            // Append new files under 'images' (matching the backend upload field)
            selectedFiles.forEach(file => {
                data.append('images', file);
            });

            if (bike) {
                await api.put(`/api/bikes/${bike._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/api/bikes', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-zoomIn max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">{bike ? 'Edit Bike' : 'Add New Bike'}</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                            {bike ? 'Update your bike listing' : 'Fill in the information to list your bike'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-shake">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                <Tag size={12} /> Bike Name
                            </label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Hero Honda"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                <Package size={12} /> Brand
                            </label>
                            <input
                                required
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="e.g. Hero Honda"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                <Bike size={12} /> Model
                            </label>
                            <input
                                required
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="e.g. SP 125"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                <Calendar size={12} /> Model Year
                            </label>
                            <input
                                required
                                type="number"
                                name="modelYear"
                                value={formData.modelYear}
                                onChange={handleChange}
                                placeholder="e.g. 2025"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                <Zap size={12} /> Engine Capacity (CC)
                            </label>
                            <input
                                required
                                type="number"
                                name="engineCapacity"
                                value={formData.engineCapacity}
                                onChange={handleChange}
                                placeholder="e.g. 41112345APg54"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                <Gauge size={12} /> Mileage (km)
                            </label>
                            <input
                                required
                                type="number"
                                name="mileage"
                                value={formData.mileage}
                                onChange={handleChange}
                                placeholder="e.g. 50"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                Listed for / Type
                            </label>
                            <select
                                name="listingType"
                                value={formData.listingType}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            >
                                <option value="Rental">Rental</option>
                                <option value="Purchase">Purchase</option>
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                <DollarSign size={12} /> {formData.listingType === 'Rental' ? 'Price/Day (RS)' : 'Sale Price (RS)'}
                            </label>
                            <input
                                required
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                Bike Category
                            </label>
                            <input
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g. Cruiser, Off-road"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                Condition
                            </label>
                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            >
                                <option value="New">New</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">
                                <Upload size={12} /> Bike Images
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                {/* Existing Images */}
                                {existingImages.map((img, idx) => (
                                    <div key={`existing-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                                        <img src={img} alt="bike" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        <div className="absolute bottom-1 left-1 bg-black/50 text-[8px] text-white px-1 rounded">Existing</div>
                                    </div>
                                ))}

                                {/* New Previews */}
                                {previews.map((preview, idx) => (
                                    <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-orange-100">
                                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedFile(idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        <div className="absolute bottom-1 left-1 bg-orange-500/80 text-[8px] text-white px-1 rounded">New</div>
                                    </div>
                                ))}

                                {existingImages.length + selectedFiles.length < 4 && (
                                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-orange-200 transition-all cursor-pointer">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <Upload size={24} className="text-gray-400 mb-1" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase text-center px-2">Click to Upload More</span>
                                    </label>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic flex items-center gap-1.5 ml-1">
                                <AlertCircle size={10} /> Max 4 images total. Supports JPG, PNG, WEBP.
                            </p>
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl text-sm font-black text-gray-600 hover:bg-white transition-all order-2 sm:order-1"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] px-6 py-4 bg-orange-600 text-white rounded-2xl text-sm font-black hover:bg-orange-700 shadow-lg shadow-orange-900/20 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                {bike ? 'UPDATING...' : 'LISTING...'}
                            </>
                        ) : (
                            bike ? 'UPDATE LISTING' : 'CREATE LISTING'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BikeFormModal;
