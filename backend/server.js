const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Load env vars
dotenv.config();

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const customerRoutes = require('./routes/customerRoutes');

const helmet = require('helmet');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.cloudinary.com", "https://*.firebaseio.com", "https://identitytoolkit.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.google.com", "https://www.gstatic.com"],
            frameSrc: ["'self'", "https://www.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"]
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);

const path = require('path');

// Serve frontend (ALWAYS try to serve static files, regarding of NODE_ENV)
// This ensures it works if NODE_ENV isn't set perfectly
const frontendPath = path.join(__dirname, '../frontend/dist');

// Dynamic Sitemap
app.get('/sitemap.xml', async (req, res) => {
    try {
        const Product = require('./models/productModel'); // Ensure this path is correct
        const products = await Product.find({}, 'name _id updatedAt images image'); // Fetch images too

        const baseUrl = 'https://majisa.co.in';

        // Static Pages
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

        // Dynamic Product Pages
        products.forEach(product => {
            const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
            const productUrl = `${baseUrl}/product/${product._id}`;

            // Handle images (support both array and single string legacy)
            const productImages = [];
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                productImages.push(...product.images);
            } else if (product.image) {
                productImages.push(product.image);
            }

            let imageTags = '';
            productImages.forEach(img => {
                if (img) {
                    imageTags += `
    <image:image>
      <image:loc>${img.startsWith('http') ? img : baseUrl + img}</image:loc>
      <image:title>${product.name.replace(/&/g, '&amp;')}</image:title>
    </image:image>`;
                }
            });

            xml += `  <url>
    <loc>${productUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imageTags}
  </url>
`;
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.header('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        res.send(xml);

    } catch (error) {
        console.error('Sitemap Error:', error);
        res.status(500).end();
    }
});

app.use(express.static(frontendPath));

app.get('/*splat', (req, res) => {
    const indexPath = path.join(frontendPath, 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send('Majisa Jewellers API is running... (Frontend not built or path incorrect)');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
