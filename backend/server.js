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

//Helmet security configuration
const helmet = require('helmet');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.cloudinary.com", "https://*.firebaseio.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://www.google.com", "https://www.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.google.com", "https://www.gstatic.com", "https://apis.google.com"],
            frameSrc: ["'self'", "https://www.google.com", "https://majisa-a137d.firebaseapp.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"]
        },
    },
    crossOriginEmbedderPolicy: false
}));


// Health Check Endpoint
app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
    };
    try {
        res.status(200).json(healthcheck);
    } catch (e) {
        healthcheck.message = e;
        res.status(503).json(healthcheck);
    }
});

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
        const Product = require('./models/Product');
        const Category = require('./models/Category');

        const [products, categories] = await Promise.all([
            Product.find({}, 'name _id updatedAt images image'),
            Category.find({}, 'name image updatedAt')
        ]);

        const baseUrl = 'https://majisa.co.in';

        // Helper to escape XML special characters
        const escapeXml = (unsafe) => {
            if (!unsafe) return '';
            return unsafe.toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

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

        // Dynamic Category Pages
        categories.forEach(category => {
            const lastMod = category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString();
            const categoryUrl = `${baseUrl}/products?category=${encodeURIComponent(category.name)}`;

            let imageTags = '';
            if (category.image) {
                imageTags = `
    <image:image>
      <image:loc>${category.image.startsWith('http') ? category.image : baseUrl + category.image}</image:loc>
      <image:title>${escapeXml(category.name)} Collection</image:title>
    </image:image>`;
            }

            xml += `  <url>
    <loc>${categoryUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTags}
  </url>
`;
        });

        // Dynamic Product Pages
        products.forEach(product => {
            const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
            const productUrl = `${baseUrl}/product/${product._id}`;

            // Handle images
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
      <image:title>${escapeXml(product.name)}</image:title>
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

        res.set('Content-Type', 'application/xml');
        res.header('Cache-Control', 'public, max-age=86400');
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

// Port configuration
const PORT = process.env.PORT || 5000;

// Root startup function
const startServer = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log('Running database migrations...');
        const { migrateUsernames } = require('./utils/migrationUtils');
        await migrateUsernames();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);

            // Initialize Background Workers
            console.log('Initializing Background Workers...');
            require('./workers/emailWorker');
        });
    } catch (error) {
        console.error('CRITICAL: Server failed to start:', error.message);
        process.exit(1);
    }
};

startServer();
