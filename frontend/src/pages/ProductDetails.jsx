import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('12');

    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data);
                // Set initial selected image
                if (data.images && data.images.length > 0) {
                    setSelectedImage(data.images[0]);
                } else {
                    setSelectedImage(data.image);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Product not found');
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    const handleAddToCart = () => {
        addToCart(product, quantity);
        toast.success('Added to cart');
    };

    if (loading) return <div className="p-12 text-center">Loading...</div>;
    if (!product) return null;

    // Prepare images array for gallery
    const galleryImages = product.images && product.images.length > 0
        ? product.images
        : (product.image ? [product.image] : []);

    return (
        <div className="bg-white min-h-screen py-6">
            <div className="container mx-auto px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-4 transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="h-[65vh] bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
                            <img
                                src={selectedImage || galleryImages[0]}
                                alt={product.name}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        {galleryImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
                                {galleryImages.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === img ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:border-primary-300'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`View ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-primary-600 font-medium mb-2">
                                <span>{product.category}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>

                            {/* Technical Details - Only for Vendors/Admins */}
                            {['vendor', 'admin'].includes(JSON.parse(localStorage.getItem('majisa_user'))?.role) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                                    <p className="text-lg font-medium text-gray-900">Product Code: <span className="font-bold text-primary-700">{product.productCode || 'N/A'}</span></p>
                                    <p className="text-md text-gray-600 mt-1">Wastage: <span className="font-medium">{product.wastage || 'N/A'}</span></p>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                                </div>
                                <span className="text-gray-500 text-sm">(12 Reviews)</span>
                            </div>
                        </div>

                        <p className="text-gray-600 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Specifications - Only for Vendors/Admins */}
                        {['vendor', 'admin'].includes(JSON.parse(localStorage.getItem('majisa_user'))?.role) && (
                            <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100">
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">Weight</span>
                                    <span className="font-medium text-gray-900">{product.weight}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">Purity</span>
                                    <span className="font-medium text-gray-900">{product.purity}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">Metal</span>
                                    <span className="font-medium text-gray-900">{product.metal}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">Availability</span>
                                    <span className="font-medium text-green-600">ON DEMAND</span>
                                </div>
                            </div>
                        )}

                        {/* Size Selection (Display only) */}
                        {product.category === 'Rings' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-3">Available Sizes</label>
                                <div className="flex gap-3">
                                    {['10', '12', '14', '16', '18'].map(size => (
                                        <div
                                            key={size}
                                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600"
                                        >
                                            {size}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {['vendor'].includes(JSON.parse(localStorage.getItem('majisa_user'))?.role) ? (
                            <div className="flex gap-4">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 hover:text-primary-600"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-3 hover:text-primary-600"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ) : (
                            <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                                To place an order, please contact us or visit our store.
                            </div>
                        )}

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Truck className="text-primary-600" size={20} />
                                <span>Free Insured Shipping</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <ShieldCheck className="text-primary-600" size={20} />
                                <span>BIS Hallmarked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
