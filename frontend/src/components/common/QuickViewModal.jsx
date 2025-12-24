import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getWatermarkedImage } from '../../utils/urlUtils';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, checkIsWishlisted } = useWishlist();
    const { user } = useAuth();
    const { settings } = useSettings();

    // Prevent body scroll when modal is active
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!product) return null;

    const isWishlisted = checkIsWishlisted(product._id);
    const [selectedImage, setSelectedImage] = useState(product.images?.[0] || product.image);
    const [selectedWeight, setSelectedWeight] = useState(Array.isArray(product.weight) ? product.weight[0] : (product.weight || ''));
    const [selectedPurity, setSelectedPurity] = useState(Array.isArray(product.purity) ? product.purity[0] : (product.purity || '22k'));

    // Auto-apply watermark
    const displayImage = settings?.watermarkLogo
        ? getWatermarkedImage(selectedImage, settings.watermarkLogo)
        : selectedImage;

    const handleAddToCart = () => {
        addToCart({ ...product, selectedWeight, selectedPurity }, quantity);
        toast.success(`Added to cart (${selectedWeight}${selectedPurity ? ', ' + selectedPurity : ''})`);
        onClose();
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={handleOverlayClick}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-gray-100 z-10 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image */}
                    <div className="aspect-[4/5] md:aspect-auto bg-gray-100">
                        <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Details */}
                    <div className="p-8 flex flex-col justify-center">
                        <span className="text-gold-600 text-xs font-bold uppercase tracking-widest mb-2">
                            {product.category}
                        </span>
                        <h2 className="text-3xl font-serif text-charcoal-500 mb-4">{product.name}</h2>

                        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                            {product.description || 'Experience the elegance of fine craftsmanship with this exquisite piece, designed to add a touch of royalty to your collection.'}
                        </p>

                        {/* Variant Selection (Weight & Purity) */}
                        <div className="flex flex-col gap-4 mb-6">
                            {/* Weight selection */}
                            {product.weight && (Array.isArray(product.weight) ? product.weight.length > 0 : !!product.weight) && (
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-500 uppercase w-16">Weight</span>
                                    {Array.isArray(product.weight) && product.weight.length > 1 ? (
                                        <select
                                            value={selectedWeight}
                                            onChange={(e) => setSelectedWeight(e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary-500 outline-none cursor-pointer"
                                        >
                                            {product.weight.map((w, idx) => (
                                                <option key={idx} value={w}>{w}g</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-sm text-gray-700 font-medium">{Array.isArray(product.weight) ? product.weight[0] : product.weight}g</span>
                                    )}
                                </div>
                            )}

                            {/* Purity selection */}
                            {product.purity && (Array.isArray(product.purity) ? product.purity.length > 0 : !!product.purity) && (
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-500 uppercase w-16">Purity</span>
                                    {Array.isArray(product.purity) && product.purity.length > 1 ? (
                                        <select
                                            value={selectedPurity}
                                            onChange={(e) => setSelectedPurity(e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary-500 outline-none cursor-pointer"
                                        >
                                            {product.purity.map((p, idx) => (
                                                <option key={idx} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-sm text-gray-700 font-medium">{Array.isArray(product.purity) ? product.purity[0] || '22K' : (product.purity || '22K')}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {user && (user.role === 'vendor' || user.role === 'admin') ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-3 hover:text-primary-600"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-3 hover:text-primary-600"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                                    >
                                        <ShoppingBag size={18} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-4">
                                To place an order, please contact us or visit our store.
                            </div>
                        )}

                        <Link
                            to={`/product/${product._id}`}
                            className="block text-center text-xs text-gray-500 hover:text-primary-600 underline mt-4"
                            onClick={onClose}
                        >
                            View Full Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
