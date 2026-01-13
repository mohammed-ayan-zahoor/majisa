import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
    const siteTitle = 'Majisa | KGF Kolar Gold Fields | Digital Jewelry Catalog';
    const siteDescription = 'Experience fine craftsmanship at Majisa Jewellers, KGF (Kolar Gold Fields). Explore our digital catalog of premium gold, diamond, and antique jewelry in Karnataka.';
    const siteUrl = window.location.origin;
    const defaultImage = `${siteUrl}/logo.png`; // Ensure you have a default logo/image

    return (
        <Helmet defer={false} key={title}>
            {/* Standard Metadata */}
            <title>{title ? `${title} | Majisa KGF` : siteTitle}</title>
            <meta name="description" content={description || siteDescription} />
            <meta name="keywords" content={keywords || 'Majisa KGF, Kolar Gold Fields, Karnataka Jewelry, Gold Catalog, Antique Jewelry, Wedding Jewelry Karnataka, Harams, Vanki, Antique Gold KGF'} />

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

            {/* Google Schema -- Helps with Logo in Search Results */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "Majisa Jewellers",
                    "url": "https://www.majisa.co.in",
                    "logo": "https://www.majisa.co.in/logo.png",
                    "sameAs": [
                        "https://www.majisa.co.in"
                    ]
                })}
            </script>
        </Helmet>
    );
};

export default SEO;
