import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
    const siteTitle = 'Majisa | Digital Jewelry Catalog';
    const siteDescription = 'Discover the finest craftsmanship at Majisa. Premium gold jewelry, custom orders, and exclusive designs.';
    const siteUrl = window.location.origin;
    const defaultImage = `${siteUrl}/logo.png`; // Ensure you have a default logo/image

    return (
        <Helmet defer={false} key={title}>
            {/* Standard Metadata */}
            <title>{title ? `${title} | Majisa` : siteTitle}</title>
            <meta name="description" content={description || siteDescription} />
            <meta name="keywords" content={keywords || 'gold, jewelry, majisa, catalog, ring, necklace, custom'} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url || window.location.href} />
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={description || siteDescription} />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url || window.location.href} />
            <meta property="twitter:title" content={title || siteTitle} />
            <meta property="twitter:description" content={description || siteDescription} />
            <meta property="twitter:image" content={image || defaultImage} />
        </Helmet>
    );
};

export default SEO;
