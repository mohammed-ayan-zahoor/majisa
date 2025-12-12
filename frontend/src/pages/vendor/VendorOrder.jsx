import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';

const VendorOrder = () => {
    const navigate = useNavigate();
    const { addOrder } = useOrder();
    const [productCode, setProductCode] = useState('');
    const [product, setProduct] = useState(null);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    // Order State
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [customFieldValues, setCustomFieldValues] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!productCode.trim()) return;

        setLoading(true);
        setProduct(null);
        setCategory(null);
        setCustomFieldValues({});

        try {
            // 1. Fetch Product
            const { data: productData } = await api.get(`/products/code/${productCode}`);
            setProduct(productData);

            // 2. Fetch Category to get Custom Fields
            // Assuming we can search category by name or we have to iterate. 
            // Better if product had categoryId, but it has categoryName.
            // Let's fetch all categories and find the match, or add an endpoint to find by name.
            // For now, let's fetch all and filter (optimization: backend should support get by name)
            const { data: categoriesData } = await api.get('/categories');
            const matchedCategory = categoriesData.find(c => c.name === productData.category);

            if (matchedCategory) {
                setCategory(matchedCategory);
                // Initialize custom fields with defaults if needed
                const initialValues = {};
                matchedCategory.customFields.forEach(field => {
                    initialValues[field.name] = '';
                });
                setCustomFieldValues(initialValues);
            }

        } catch (error) {
            console.error('Error fetching details:', error);
            toast.error('Product not found with this code');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomFieldChange = (fieldName, value) => {
        setCustomFieldValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handlePlaceOrder = async () => {
        if (!product) return;
        if (placingOrder) return;

        // Validate required fields
        if (category) {
            for (const field of category.customFields) {
                if (field.required && !customFieldValues[field.name]) {
                    return toast.error(`${field.name} is required`);
                }
            }
        }

        setPlacingOrder(true);

        try {
            // Format custom fields for backend
            const formattedCustomFields = Object.entries(customFieldValues).map(([key, value]) => ({
                fieldName: key,
                value: value
            }));

            const orderData = {
                orderItems: [{
                    name: product.name,
                    quantity: quantity,
                    image: product.images && product.images.length > 0 ? product.images[0] : product.image,
                    product: product._id,
                    productCode: product.productCode,
                    wastage: product.wastage,
                    // We can still send size/purity if they are standard, or rely on custom fields
                    // For backward compatibility, if 'Size' or 'Purity' exist in custom fields, use them
                    size: customFieldValues['Size'] || '',
                    purity: customFieldValues['Purity'] || product.purity,
                    customFieldValues: formattedCustomFields
                }],
                shippingAddress: { address: 'Vendor Address', city: 'Vendor City', postalCode: '000000', country: 'India' },
                paymentMethod: 'Credit',
                notes: notes
            };

            await addOrder(orderData);
            navigate('/vendor/dashboard');
        } catch (error) {
            console.error('Error placing order:', error);
            // Optional: toast.error('Failed to place order') if not handled in context
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-xl font-serif font-bold text-gray-900 mb-1">Place New Order</h1>
                    <p className="text-xs text-gray-500">Enter the product code to fetch details and place an order.</p>
                </div>

                {/* Search Section */}
                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 mb-4 md:mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 md:gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={productCode}
                                onChange={(e) => setProductCode(e.target.value)}
                                placeholder="Enter Product Code (e.g., RNG-001)"
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary-600 text-white px-4 py-2 text-sm rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-70 w-full md:w-auto"
                        >
                            {loading ? 'Searching...' : 'Fetch'}
                        </button>
                    </form>
                </div>

                {/* Product Details & Order Form */}
                {product && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-24 h-48 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={product.images && product.images.length > 0 ? product.images[0] : product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider rounded">
                                        {product.category}
                                    </span>
                                    <span className="text-xs text-gray-500">Code: {product.productCode}</span>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h2>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
                                    <p>Weight: <span className="font-medium text-gray-900">{product.weight}</span></p>
                                    <p>Purity: <span className="font-medium text-gray-900">{product.purity}</span></p>
                                    <p>Wastage: <span className="font-medium text-primary-600">{product.wastage}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                                <ShoppingBag size={16} />
                                Order Configuration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Dynamic Fields from Category */}
                                {category && category.customFields.map((field, index) => (
                                    <div key={index}>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            {field.name} {field.required && <span className="text-red-500">*</span>}
                                        </label>

                                        {field.type === 'dropdown' ? (
                                            <select
                                                value={customFieldValues[field.name] || ''}
                                                onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white"
                                            >
                                                <option value="">Select {field.name}</option>
                                                {field.options.map((opt, idx) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type === 'number' ? 'number' : 'text'}
                                                value={customFieldValues[field.name] || ''}
                                                onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                                                placeholder={`Enter ${field.name}`}
                                            />
                                        )}
                                    </div>
                                ))}

                                {/* Fallback if no category or no custom fields (Optional: keep standard fields if needed) */}
                                {!category && (
                                    <div className="col-span-full text-center p-3 bg-yellow-50 text-yellow-700 rounded-lg text-xs">
                                        <AlertCircle size={14} className="inline mr-2" />
                                        No specific category configuration found. Please add notes below.
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Additional Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any specific customization or instructions..."
                                        rows="2"
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-3 border-t border-gray-200">
                                <button
                                    onClick={() => setProduct(null)}
                                    className="w-full md:w-auto px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={placingOrder}
                                    className={`w-full md:w-auto bg-primary-600 text-white px-6 py-2 text-sm rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 ${placingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {placingOrder ? 'Placing Order...' : 'Place Order'}
                                    {!placingOrder && <ArrowRight size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!product && !loading && productCode && (
                    <div className="mt-6 text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                            <Search size={20} />
                        </div>
                        <p className="text-sm text-gray-500">Search for a product to view details and place an order.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorOrder;
