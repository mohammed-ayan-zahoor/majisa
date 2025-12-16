const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');

router.post('/', (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            console.error('Multer/Cloudinary Error:', err);
            return res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        }
        if (!req.file) {
            console.error('No file received in req.file');
            return res.status(400).send('No file uploaded');
        }
        res.json(req.file.path);
    });
});

module.exports = router;
