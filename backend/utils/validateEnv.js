const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];

const optionalEnvVars = [
    'PORT',
    'NODE_ENV',
    'JWT_EXPIRE',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'REDIS_URL',
    'FRONTEND_URL',
];

const validateEnv = () => {
    console.log('\n🔍 Validating environment variables...\n');

    // Check required variables
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(varName => console.error(`   - ${varName}`));
        console.error('\n💡 Please check .env.example for reference\n');
        process.exit(1);
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.error('❌ JWT_SECRET must be at least 32 characters long for security');
        console.error('   Current length:', process.env.JWT_SECRET.length);
        process.exit(1);
    }

    // Validate MongoDB URI format
    if (!process.env.MONGODB_URI.startsWith('mongodb')) {
        console.error('❌ MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
        process.exit(1);
    }

    // Warn about optional variables
    const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
    if (missingOptional.length > 0) {
        console.warn('⚠️  Optional environment variables not set:');
        missingOptional.forEach(varName => console.warn(`   - ${varName}`));
        console.warn('   (These features may not work correctly)\n');
    }

    console.log('✅ All required environment variables are set\n');
};

module.exports = validateEnv;
