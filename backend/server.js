const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Load env vars
dotenv.config();

// Validate environment variables
const validateEnv = require('./utils/validateEnv');
validateEnv();

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const accountRoutes = require('./routes/accountRoutes');

//Helmet security configuration
const helmet = require('helmet');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://majisa.co.in', 'https://www.majisa.co.in']
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
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

// Rate Limiting
const { authLimiter, apiLimiter, publicLimiter } = require('./middleware/rateLimitMiddleware');

// Apply strict limits to auth endpoints (must be before routes)
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);

// Apply moderate limits to protected API endpoints
app.use('/api/products', apiLimiter);
app.use('/api/orders', apiLimiter);
app.use('/api/categories', apiLimiter);
app.use('/api/customers', apiLimiter);

// Global fallback for other routes
app.use('/api/', publicLimiter);


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
app.use('/api/accounts', accountRoutes);

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
    // Generate unique error ID for tracking
    const errorId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    // Determine error status code
    const statusCode = err.statusCode || err.status || 500;

    // Privacy-conscious logging configuration
    const enableIpLogging = process.env.ENABLE_IP_LOGGING === 'true';
    const enableAuditMode = process.env.ENABLE_AUDIT_MODE === 'true';

    // Pseudonymize user ID (hash first/last 4 chars for privacy)
    const getPseudonymizedUserId = (userId) => {
        if (!userId) return 'anonymous';
        const id = userId.toString();
        if (id.length <= 8) return '****';
        return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
    };

    // Log error details server-side
    // Sensitive data handling:
    // - IP address: Only logged if ENABLE_IP_LOGGING=true or ENABLE_AUDIT_MODE=true
    // - User ID: Pseudonymized by default (shows first/last 4 chars), full ID only in ENABLE_AUDIT_MODE=true
    // - Stack traces: Only included in development mode (NODE_ENV=development)
    // - Request body/headers: Never logged (to prevent credential leakage)
    console.error(`[ERROR ${errorId}]`, {
        timestamp: new Date().toISOString(),
        statusCode,
        message: err.message,
        method: req.method,
        url: req.url,
        // Conditionally include IP address
        ...(enableIpLogging || enableAuditMode ? { ip: req.ip } : {}),
        // Pseudonymized user ID by default, full ID only in audit mode
        userId: enableAuditMode
            ? req.user?._id || 'anonymous'
            : getPseudonymizedUserId(req.user?._id),
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //     Sentry.captureException(err);
    // }

    // Categorize error type
    let errorType = 'ServerError';
    if (statusCode >= 400 && statusCode < 500) {
        errorType = 'ClientError';
    } else if (statusCode >= 500) {
        errorType = 'ServerError';
    }

    // Send appropriate response based on environment
    const response = {
        error: errorType,
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred while processing your request'
            : err.message,
        errorId,
        timestamp: new Date().toISOString(),
        // Include additional details in development
        ...(process.env.NODE_ENV === 'development' && {
            path: req.url,
            method: req.method,
            stack: err.stack
        })
    };

    res.status(statusCode).json(response);
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

        // Initialize Background Workers
        try {
            console.log('Checking Redis availability...');
            const isRedisAvailable = require('./utils/isRedisAvailable');
            if (await isRedisAvailable()) {
                console.log('Redis is available. Initializing Background Workers...');
                require('./workers/emailWorker');
            } else {
                console.warn('Redis is unavailable. Background workers (Email) skipped.');
            }
        } catch (workerError) {
            console.warn('WARNING: Failed to initialize email worker.', workerError.message);
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('CRITICAL: Server failed to start:', error.message);
        process.exit(1);
    }
};

startServer();
