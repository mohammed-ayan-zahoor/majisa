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

        // Transformation string: l_<watermark_id>,o_<opacity>,w_<width>,fl_relative,g_<position>,q_auto:best,f_auto
        // q_auto:best ensures the highest visual quality for jewelry while f_auto picks the best format (WebP/AVIF)
        const transformation = `l_${watermarkId.replace(/\//g, ':')},o_${opacity},w_${width},fl_relative,g_${position},q_auto:best,f_auto/`;

        return `${baseUrl}${transformation}${restUrl}`;
    } catch (error) {
        console.error('Error applying watermark:', error);
        return imageUrl;
    }
};
