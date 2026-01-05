import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';
import { getWatermarkedImage, getOptimizedImage } from '../../utils/urlUtils';

const ProductCard = ({ product }) => {
    const { toggleWishlist, checkIsWishlisted } = useWishlist();
    const { settings } = useSettings();
    const { user } = useAuth();

    const isWishlisted = checkIsWishlisted(product._id);

    // Auto-apply watermark if available
    const displayImage = settings?.watermarkLogo
        ? getWatermarkedImage(product.image, settings.watermarkLogo, { pixelWidth: 600 })
        : getOptimizedImage(product.image, 600);

    return (
        <div className="group relative bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
            {/* Image Container - Click to Navigate */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-50 mb-4">
                <Link to={`/product/${product._id}`} className="block absolute inset-0">
                    <img
                        src={displayImage}
                        alt={product.name}
                        loading="lazy"
                        width="300"
                        height="400"
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNewArrival && (
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-charcoal-500 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                            New
                        </span>
                    )}
                    {product.isFeatured && (
                        <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1">
                            <span>⭐</span> Featured
                        </span>
                    )}
                </div>

                {/* Wishlist Button - Only valid action on overlay now */}
                <div className="absolute inset-x-2 bottom-2 md:inset-x-3 md:bottom-3 flex justify-end z-10">
                    {user?.role !== 'admin' && (
                        <button
                            onClick={() => toggleWishlist(product._id)}
                            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all rounded-lg shadow-lg ${isWishlisted ? 'bg-red-50 text-red-500 hover:bg-white' : 'bg-white/95 backdrop-blur-sm text-charcoal-600 hover:text-red-500'}`}
                            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                            aria-pressed={isWishlisted}
                        >
                            <Heart size={14} className={`md:w-[18px] md:h-[18px] ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                    )}
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
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
