import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
    const [showQuickView, setShowQuickView] = useState(false);
    const { addToCart } = useCart();
    const { toggleWishlist, checkIsWishlisted } = useWishlist();

    const isWishlisted = checkIsWishlisted(product._id);

    return (
        <>
            <div className="group relative bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-50 mb-4">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Badges */}
                    {product.isNew && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-charcoal-500 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                            New
                        </span>
                    )}

                    {/* Hover Actions */}
                    {/* Actions - Always visible on mobile, Hover on Desktop */}
                    <div className="absolute inset-x-2 bottom-2 md:inset-x-3 md:bottom-3 flex gap-2 z-10 transition-all duration-300
                        translate-y-0 lg:translate-y-[120%] lg:group-hover:translate-y-0">
                        <button
                            onClick={() => setShowQuickView(true)}
                            className="flex-1 bg-white/95 backdrop-blur-sm text-charcoal-600 py-2 md:py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-charcoal-600 hover:text-white transition-all rounded-lg shadow-lg"
                        >
                            <span className="md:hidden">Quick View</span>
                            <span className="hidden md:inline">Quick View</span>
                        </button>
                        {['vendor'].includes(JSON.parse(localStorage.getItem('majisa_user'))?.role) && (
                            <button
                                onClick={() => addToCart(product, 1)}
                                className="w-8 md:w-10 bg-white/95 backdrop-blur-sm text-charcoal-600 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all rounded-lg shadow-lg"
                                title="Add to Cart"
                            >
                                <ShoppingBag size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(product._id);
                            }}
                            className={`w-8 md:w-10 flex items-center justify-center transition-all rounded-lg shadow-lg ${isWishlisted ? 'bg-red-50 text-red-500 hover:bg-white' : 'bg-white/95 backdrop-blur-sm text-charcoal-600 hover:text-red-500'}`}
                        >
                            <Heart size={16} className={`md:w-[18px] md:h-[18px] ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center px-2 pb-2">
                    <p className="text-xs text-gold-600 mb-1 uppercase tracking-widest font-medium">{product.category}</p>
                    <h3 className="text-base font-serif text-charcoal-600 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                        <Link to={`/product/${product._id}`}>
                            {product.name}
                        </Link>
                    </h3>
                    <div className="text-sm text-gray-500 space-y-1">
                        {/* Product Code - Visible to All */}
                        <p className="text-xs text-gray-500">Code: <span className="font-medium text-gray-900">{product.productCode || 'N/A'}</span></p>

                        {/* Technical Details - Only for Vendors/Admins */}
                        {['vendor', 'admin'].includes(JSON.parse(localStorage.getItem('majisa_user'))?.role) && (
                            <>
                                <div className="flex justify-center items-center gap-4 text-xs text-gray-400 mt-1">
                                    <span>{product.weight}g</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span>{product.purity || '22K'}</span>
                                </div>
                                <p className="text-primary-600 font-medium text-xs mt-2 bg-primary-50 inline-block px-2 py-1 rounded">
                                    Wastage: {product.wastage || 'N/A'}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            {showQuickView && (
                <QuickViewModal
                    product={product}
                    onClose={() => setShowQuickView(false)}
                />
            )}
        </>
    );
};

export default ProductCard;
