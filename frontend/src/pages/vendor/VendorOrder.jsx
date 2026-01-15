import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';

const VendorOrder = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { addOrder } = useOrder();
    const [productCode, setProductCode] = useState('');
    const [product, setProduct] = useState(null);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    // Order State
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [selectedWeight, setSelectedWeight] = useState('');
    const [selectedPurity, setSelectedPurity] = useState('');
    const [customFieldValues, setCustomFieldValues] = useState({});

    useEffect(() => {
        const codeFromUrl = searchParams.get('code');
        const weightFromUrl = searchParams.get('weight');
        const purityFromUrl = searchParams.get('purity');

        if (codeFromUrl) {
            setProductCode(codeFromUrl);
            fetchProductDetails(codeFromUrl, weightFromUrl, purityFromUrl);
        }
    }, [searchParams]);

    const fetchProductDetails = async (code, defaultWeight, defaultPurity) => {
        if (!code.trim()) return;

        setLoading(true);
        setProduct(null);
        setCategory(null);
        setCustomFieldValues({});

        try {
            // 1. Fetch Product
            const { data: productData } = await api.get(`/products/code/${code}`);
            setProduct(productData);

            // Initial selected weight
            if (defaultWeight) {
                setSelectedWeight(defaultWeight);
            } else if (productData.weight && Array.isArray(productData.weight)) {
                setSelectedWeight(productData.weight[0]);
            } else {
                setSelectedWeight(productData.weight);
            }

            // Initial selected purity
            if (defaultPurity) {
                setSelectedPurity(defaultPurity);
            } else if (productData.purity && Array.isArray(productData.purity)) {
                setSelectedPurity(productData.purity[0]);
            } else {
                setSelectedPurity(productData.purity || '22k');
            }

            // 2. Fetch Category/Product Custom Fields
            // ALWAYS fetch category to get the latest schema (e.g. new Color fields)
            const { data: categoriesData } = await api.get('/categories');
            const matchedCategory = categoriesData.find(c => c.name === productData.category);

            let finalFields = [];

            if (matchedCategory) {
                // Start with Category fields as the base
                finalFields = matchedCategory.customFields.map(catField => {
                    // Check if product has an override or specific version of this field
                    const productField = productData.customFields?.find(pf => pf.name === catField.name);
                    return productField || catField;
                });

                // Add any extra fields that exist on Product but NOT on Category
                const extraProductFields = productData.customFields?.filter(pf =>
                    !matchedCategory.customFields.some(cf => cf.name === pf.name)
                ) || [];

                finalFields = [...finalFields, ...extraProductFields];

                setCategory({ ...matchedCategory, customFields: finalFields });
            } else {
                // Fallback if category not found (shouldn't happen usually)
                finalFields = productData.customFields || [];
                setCategory({ name: productData.category, customFields: finalFields });
            }

            // check if category is set correctly for validation
            // setCategory above handles it.

            // Initialize custom fields with defaults
            const initialValues = {};
            finalFields.forEach(field => {
                // Pre-fill from URL params if field name matches
                if (field.name === 'Weight' && defaultWeight) {
                    initialValues[field.name] = defaultWeight;
                } else if (field.name === 'Purity' && defaultPurity) {
                    initialValues[field.name] = defaultPurity;
                } else if (field.type === 'color' && field.options && field.options.length > 0) {
                    // Auto-select first color
                    initialValues[field.name] = field.options[0].split('|')[0];
                } else {
                    initialValues[field.name] = '';
                }
            });
            setCustomFieldValues(initialValues);

        } catch (error) {
            console.error('Error fetching details:', error);
            toast.error('Product not found with this code');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProductDetails(productCode);
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
                    selectedWeight: selectedWeight,
                    // We can still send size/purity if they are standard, or rely on custom fields
                    // For backward compatibility, if 'Size' or 'Purity' exist in custom fields, use them
                    size: customFieldValues['Size'] || '',
                    purity: customFieldValues['Purity'] || selectedPurity,
                    customFieldValues: formattedCustomFields
                }],
                shippingAddress: { address: 'Vendor Address', city: 'Vendor City', postalCode: '000000', country: 'India' },
                paymentMethod: 'Credit',
                notes: notes
            };

            await addOrder(orderData);
            // If checking out from cart flow, we might want to clear cart here?
            // But we don't have access to clearCart from here unless we hook into CartContext
            // For now, let's assume it's fine. The item stays in cart.
            // Ideally we should empty cart if this item was from cart.
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 mt-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Weight</span>
                                        {product.weight && Array.isArray(product.weight) ? (
                                            <select
                                                value={selectedWeight}
                                                onChange={(e) => setSelectedWeight(e.target.value)}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            >
                                                {product.weight.map((w, i) => <option key={i} value={w}>{w}</option>)}
                                            </select>
                                        ) : (
                                            <span className="font-medium text-gray-900 text-sm px-2 py-1.5 bg-gray-50 rounded-md border border-gray-200 block">
                                                {product.weight ?? 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Purity</span>
                                        {product.purity && Array.isArray(product.purity) ? (
                                            <select
                                                value={selectedPurity}
                                                onChange={(e) => setSelectedPurity(e.target.value)}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            >
                                                {product.purity.map((p, i) => <option key={i} value={p}>{p}</option>)}
                                            </select>
                                        ) : (
                                            <span className="font-medium text-gray-900 text-sm px-2 py-1.5 bg-gray-50 rounded-md border border-gray-200 block">
                                                {product.purity ?? '22k'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2 flex flex-col gap-1">
                                        <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Wastage</span>
                                        <span className="font-medium text-primary-700 text-sm px-2 py-1.5 bg-primary-50/50 rounded-md border border-primary-100 block">
                                            {product.wastage ?? 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                                <ShoppingBag size={16} />
                                Order Configuration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                {/* Dynamic Fields from Category */}
                                {category && category.customFields.map((field, index) => (
                                    <div key={index}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            {field.name} {field.required && <span className="text-red-500">*</span>}
                                        </label>

                                        {field.type === 'color' ? (
                                            <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={field.name}>
                                                {(field.options || []).map((opt, optIndex) => {
                                                    const parts = opt.split('|');
                                                    const name = parts[0] || opt;
                                                    const hex = parts[1] || '#cccccc';
                                                    const isSelected = customFieldValues[field.name] === name; return (
                                                        <div
                                                            key={optIndex}
                                                            onClick={() => handleCustomFieldChange(field.name, name)}
                                                            className={`cursor-pointer group relative flex flex-col items-center gap-1`}
                                                            tabIndex={0}
                                                            role="radio"
                                                            aria-checked={isSelected}
                                                            aria-label={`${name} color`}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    handleCustomFieldChange(field.name, name);
                                                                }
                                                            }}
                                                        >
                                                            <div
                                                                className={`w-9 h-9 rounded-full shadow-sm items-center justify-center flex transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-primary-600 scale-110' : 'hover:scale-105 border border-gray-200'}`}
                                                                style={{ backgroundColor: hex }}
                                                            >
                                                                {isSelected && <svg className="w-4 h-4 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                                                            </div>
                                                            <span className={`text-[10px] font-medium ${isSelected ? 'text-primary-700' : 'text-gray-500'}`}>{name}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : field.type === 'dropdown' ? (
                                            <select
                                                value={customFieldValues[field.name] || ''}
                                                onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white"
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
                                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                                                placeholder={`Enter ${field.name}`}
                                            />
                                        )}
                                    </div>
                                ))}

                                {/* Fallback if no category or no custom fields */}
                                {!category && (
                                    <div className="col-span-full text-center p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100">
                                        <AlertCircle size={16} className="inline mr-2" />
                                        No specific category configuration found. Please add notes below.
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                                    />                                </div>
                                <div className="col-span-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any specific customization or instructions..."
                                        rows="3"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
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
