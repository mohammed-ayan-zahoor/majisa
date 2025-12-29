import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getWatermarkedImage } from '../utils/urlUtils';
import SEO from '../components/common/SEO';

import { useProduct, useRelatedProducts } from '../hooks/useProducts';
import ProductCard from '../components/common/ProductCard';
import Skeleton from '../components/common/Skeleton';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, checkIsWishlisted } = useWishlist();
    const { user } = useAuth();
    const { settings } = useSettings();

    // Use React Query for single product
    const { data: product, isLoading: loading, error } = useProduct(id);

    // Fetch related products
    const { data: relatedProducts, isLoading: relatedLoading } = useRelatedProducts(id);

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedWeight, setSelectedWeight] = useState('');
    const [selectedPurity, setSelectedPurity] = useState('');

    // Handle initial selection when data arrives
    useEffect(() => {
        if (product) {
            if (product.images && product.images.length > 0) {
                setSelectedImage(product.images[0]);
            } else {
                setSelectedImage(product.image);
            }

            const wOptions = Array.isArray(product.weight) ? product.weight : (product.weight ? [product.weight] : []);
            if (wOptions.length > 0) {
                setSelectedWeight(wOptions[0]);
            }

            const pOptions = Array.isArray(product.purity) ? product.purity : (product.purity ? [product.purity] : []);
            if (pOptions.length > 0) {
                setSelectedPurity(pOptions[0]);
            }
        }
    }, [product]);

    useEffect(() => {
        if (error) {
            console.error('Error fetching product:', error);
            toast.error('Product not found');
            navigate('/products');
        }
    }, [error, navigate]);

    const handleAddToCart = () => {
        addToCart({ ...product, selectedWeight, selectedPurity }, quantity);
        toast.success(`Added to cart (${selectedWeight}${selectedPurity ? ', ' + selectedPurity : ''})`);
    };

    if (loading) return <div className="p-12 text-center">Loading...</div>;
    if (!product) return null;

    // Prepare images array for gallery
    const rawGalleryImages = product.images && product.images.length > 0
        ? product.images
        : (product.image ? [product.image] : []);

    const galleryImages = settings?.watermarkLogo
        ? rawGalleryImages.map(img => getWatermarkedImage(img, settings.watermarkLogo))
        : rawGalleryImages;

    // Determine the display image (selected or default)
    // We must ensure the selectedImage also gets watermarked if it's not already
    const displayImage = selectedImage
        ? (settings?.watermarkLogo ? getWatermarkedImage(selectedImage, settings.watermarkLogo) : selectedImage)
        : galleryImages[0];

    return (
        <div className="bg-white min-h-screen py-6">
            <SEO
                title={product.name}
                description={product.description || `Buy ${product.name} from Majisa Jewellers.`}
                image={displayImage}
                keywords={`${product.category}, ${product.metal}, ${product.name}, jewelry`}
            />
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
                                src={displayImage}
                                alt={product.name}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        {galleryImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
                                {galleryImages.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedImage(rawGalleryImages[i])} // Keep selected as raw URL for consistent state
                                        className={`w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${displayImage === img ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:border-primary-300'
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
                            {['vendor', 'admin'].includes(user?.role) && (
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
                        {['vendor', 'admin'].includes(user?.role) && (
                            <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100">
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">Weight</span>
                                    <span className="font-medium text-gray-900">
                                        {Array.isArray(product.weight) ? product.weight.join(', ') : product.weight}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">Purity</span>
                                    <span className="font-medium text-gray-900">
                                        {Array.isArray(product.purity) ? product.purity.join(', ') : (product.purity || '22K')}
                                    </span>
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

                        {/* Variant Selection (Weight & Purity) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Weight Selection Dropdown */}
                            {product.weight && (Array.isArray(product.weight) ? product.weight.length > 0 : !!product.weight) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider">Select Weight</label>
                                    <select
                                        value={selectedWeight}
                                        onChange={(e) => setSelectedWeight(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm font-medium text-gray-700 cursor-pointer"
                                    >
                                        {Array.isArray(product.weight) ? (
                                            product.weight.map((w, idx) => (
                                                <option key={idx} value={w}>{w}g</option>
                                            ))
                                        ) : (
                                            <option value={product.weight}>{product.weight}g</option>
                                        )}
                                    </select>
                                </div>
                            )}

                            {/* Purity Selection Dropdown */}
                            {product.purity && (Array.isArray(product.purity) ? product.purity.length > 0 : !!product.purity) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider">Select Purity</label>
                                    <select
                                        value={selectedPurity}
                                        onChange={(e) => setSelectedPurity(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm font-medium text-gray-700 cursor-pointer"
                                    >
                                        {Array.isArray(product.purity) ? (
                                            product.purity.map((p, idx) => (
                                                <option key={idx} value={p}>{p}</option>
                                            ))
                                        ) : (
                                            <option value={product.purity}>{product.purity || '22K'}</option>
                                        )}
                                    </select>
                                </div>
                            )}
                        </div>

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

                        {user?.role === 'vendor' ? (
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

                {/* Related Products Section */}
                <div className="mt-20 border-t border-gray-100 pt-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-gray-900">More Products Like This</h2>
                            <p className="text-gray-500 mt-2 italic">Handpicked recommendations from the {product.category} collection</p>
                        </div>
                    </div>

                    {relatedLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        relatedProducts && relatedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {relatedProducts.map(related => (
                                    <ProductCard key={related._id} product={related} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl">
                                <p className="text-gray-500">No similar products found at the moment.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
