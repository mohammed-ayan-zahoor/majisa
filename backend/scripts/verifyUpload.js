const fs = require('fs');
const path = require('path');
const http = require('http');

const boundary = '--------------------------' + Date.now().toString(16);
const hostname = 'localhost';
const port = 5000;
const pathUrl = '/api/upload';
const filePath = path.join(__dirname, 'test_image.png');

// Create a simple 1x1 PNG image
const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync(filePath, pngBuffer);

const fileStats = fs.statSync(filePath);

const postDataStart = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="image"; filename="test_image.png"`,
    `Content-Type: image/png`,
    '',
    ''
].join('\r\n');

const postDataEnd = `\r\n--${boundary}--`;

const options = {
    hostname,
    port,
    path: pathUrl,
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postDataStart) + fileStats.size + Buffer.byteLength(postDataEnd)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', data);

        // Clean up
        fs.unlinkSync(filePath);

        if (res.statusCode === 200) {
            console.log('Upload Verification SUCCESS');
        } else {
            console.log('Upload Verification FAILED');
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    // Clean up
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
});

req.write(postDataStart);
const fileStream = fs.createReadStream(filePath);
fileStream.pipe(req, { end: false });
fileStream.on('end', () => {
    req.write(postDataEnd);
    req.end();
});
