const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const testUpload = async () => {
    try {
        console.log('Attempting upload...');
        // Upload a sample base64 image (small red dot)
        const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'majisa_test'
        });
        console.log('Upload Successful!');
        console.log('URL:', result.secure_url);
    } catch (error) {
        console.error('Upload Failed:', error);
    }
};

testUpload();
