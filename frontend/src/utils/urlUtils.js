/**
 * Applies a watermark to a Cloudinary image URL.
 * 
 * @param {string} imageUrl - The original product image URL
 * @param {string} watermarkId - The Cloudinary Public ID of the watermark image
 * @param {object} options - Custom options (opacity, scale, position)
 * @returns {string} - The transformed URL
 */
export const getWatermarkedImage = (imageUrl, watermarkId, options = {}) => {
    // Return original if no watermark or not a cloudinary URL
    if (!imageUrl || !watermarkId || !imageUrl.includes('res.cloudinary.com')) {
        return imageUrl;
    }

    // Default options
    const {
        opacity = 50,       // 0-100
        width = 0.2,        // 20% of the image width
        position = 'south_east', // south_east, center, north_west etc.
    } = options;

    try {
        // Cloudinary URL structure: https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/<version>/<public_id>
        // We need to inject the overlay transformation after /upload/

        const uploadIndex = imageUrl.indexOf('/upload/');
        if (uploadIndex === -1) return imageUrl;

        const baseUrl = imageUrl.substring(0, uploadIndex + 8); // includes /upload/
        const restUrl = imageUrl.substring(uploadIndex + 8);

        // Transformation string: l_<watermark_id>,o_<opacity>,w_<width>,fl_relative,g_<position>,q_auto,f_auto
        // w_<pixel_width> can also be added for resizing
        const pixelWidth = options.pixelWidth ? `w_${options.pixelWidth},c_scale,` : '';
        const transformation = `l_${watermarkId.replace(/\//g, ':')},o_${opacity},w_${width},fl_relative,g_${position},${pixelWidth}q_auto,f_auto/`;

        return `${baseUrl}${transformation}${restUrl}`;
    } catch (error) {
        console.error('Error applying watermark:', error);
        return imageUrl;
    }
};

/**
 * Optimizes a Cloudinary image URL for performance.
 * 
 * @param {string} url - The original Cloudinary URL
 * @param {number} width - Target width in pixels
 * @returns {string} - Optimized URL
 */
export const getOptimizedImage = (url, width = 800) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    try {
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return url;

        const baseUrl = url.substring(0, uploadIndex + 8);
        const restUrl = url.substring(uploadIndex + 8);

        // f_auto: best format, q_auto: best compression, w_xxx: specific width, c_scale: resize
        const transformation = `f_auto,q_auto,w_${width},c_scale/`;

        return `${baseUrl}${transformation}${restUrl}`;
    } catch (error) {
        console.error('Error optimizing image:', error);
        return url;
    }
};
