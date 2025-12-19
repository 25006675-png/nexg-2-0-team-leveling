const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const files = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

const downloadFile = (file) => {
    const url = `${baseUrl}/${file}`;
    const filePath = path.join(modelsDir, file);
    const fileStream = fs.createWriteStream(filePath);

    console.log(`Downloading ${file}...`);

    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            console.error(`Failed to download ${file}: Status Code ${response.statusCode}`);
            fileStream.close();
            fs.unlinkSync(filePath); // Delete partial file
            return;
        }

        response.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded ${file}`);
        });
    }).on('error', (err) => {
        fs.unlinkSync(filePath);
        console.error(`Error downloading ${file}: ${err.message}`);
    });
};

files.forEach(downloadFile);
