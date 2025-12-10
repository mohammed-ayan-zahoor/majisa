import React, { useState } from 'react';
import { Upload, X, Plus } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import toast from 'react-hot-toast';

const PlaceOrder = () => {
    const { addOrder } = useOrder();
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        productName: '',
        category: 'Necklaces',
        metal: 'Gold',
        purity: '22k',
        weight: '',
        budget: '',
        description: '',
        deadline: ''
    });

    const [images, setImages] = useState([]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        // In a real app, we would upload these to a server/cloud storage
        // For now, we'll just create local URLs for preview
        const newImages = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setImages([...images, ...newImages]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct order object matching backend schema
        // Note: This is a "Custom Order" which might differ slightly from standard e-commerce order
        // We might need to adapt the backend Order model or use the 'description' field heavily.
        // For now, I'll map it to a standard order with a "Custom Item"

        const orderData = {
            orderItems: [{
                name: formData.productName,
                quantity: 1,
                price: Number(formData.budget) || 0,
                image: images[0]?.url || '', // Use first image as main
                product: '64c9e1234567890abcdef123', // Placeholder ID or need a "Custom Product" ID
                // In a real app, we might create a Product first or have a specific CustomOrder model
            }],
            shippingAddress: {
                address: 'Store Pickup', // Default for custom orders?
                city: 'Mumbai',
                postalCode: '400002',
                country: 'India'
            },
            paymentMethod: 'Custom',
            totalPrice: Number(formData.budget) || 0,
            status: 'Pending'
        };

        try {
            await addOrder(orderData);
            // Reset form
            setFormData({
                customerName: '',
                customerPhone: '',
                productName: '',
                category: 'Necklaces',
                metal: 'Gold',
                purity: '22k',
                weight: '',
                budget: '',
                description: '',
                deadline: ''
            });
            setImages([]);
        } catch (error) {
            // Error handled in context
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-serif font-bold text-gray-900">Place Custom Order</h1>
                <p className="text-gray-500">Create a new custom jewellery order</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Customer Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                            <input
                                type="text"
                                required
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                required
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Product Specifications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name/Title</label>
                            <input
                                type="text"
                                required
                                value={formData.productName}
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option>Necklaces</option>
                                <option>Rings</option>
                                <option>Earrings</option>
                                <option>Bangles</option>
                                <option>Anklets</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Metal Type</label>
                            <select
                                value={formData.metal}
                                onChange={(e) => setFormData({ ...formData, metal: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option>Gold</option>
                                <option>Silver</option>
                                <option>Platinum</option>
                                <option>Rose Gold</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Purity</label>
                            <select
                                value={formData.purity}
                                onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option>24k</option>
                                <option>22k</option>
                                <option>18k</option>
                                <option>14k</option>
                                <option>92.5 (Silver)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Approx Weight (g)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget (₹)</label>
                            <input
                                type="number"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description / Special Instructions</label>
                            <textarea
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Describe the design details, stone requirements, etc."
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Reference Images */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Reference Images</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                <img src={img.url} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                            <Upload className="text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Upload Image</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                        Place Order
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PlaceOrder;
