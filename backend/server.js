const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up tracking folders
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}
const galleryFolder = path.join(__dirname, 'gallery');
if (!fs.existsSync(galleryFolder)) {
    fs.mkdirSync(galleryFolder);
}

// Host gallery files statically for the frontend to consume directly
app.use('/gallery_files', express.static(galleryFolder));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.post('/colorize', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
        const filePath = req.file.path;
        
        // Prepare FormData for ML API
        const formData = new FormData();
        // Since cloud proxies like Render often block 'chunked' multipart transfers without explicit Content-Length,
        // we load the file fully into memory buffer so the FormData library calculates exact payload sizes automatically!
        const fileContent = fs.readFileSync(filePath);
        formData.append('file', fileContent, { filename: req.file.originalname });

        // Let Python container process the image request
        let pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
        if (!pythonApiUrl.endsWith('/predict')) pythonApiUrl += '/predict';
        
        console.log(`Routing image to ML API at: ${pythonApiUrl}`);
        
        const response = await axios.post(pythonApiUrl, formData, {
            headers: { 
                ...formData.getHeaders(),
                'Content-Length': formData.getLengthSync()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            responseType: 'arraybuffer' // Request Buffer back
        });

        const id = Date.now().toString();
        const inputGalleryPath = path.join(galleryFolder, `${id}_input.jpg`);
        const outputGalleryPath = path.join(galleryFolder, `${id}_output.jpg`);

        // Save original and mocked versions respectively to the permanent gallery disk
        fs.copyFileSync(filePath, inputGalleryPath);
        fs.writeFileSync(outputGalleryPath, response.data);

        // Standard Buffer processing towards UI active memory context
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';
        
        fs.unlinkSync(filePath); // clear out original redundant path

        res.json({
            success: true,
            id: id,
            image: `data:${mimeType};base64,${base64Image}`
        });

    } catch (error) {
        console.error('Error in /colorize endpoint:', error.message);
        
        let detailedError = error.message;
        if (error.response && error.response.data) {
            try {
                // If the arraybuffer response is actually an error message from FastAPI
                const errorStr = Buffer.from(error.response.data).toString('utf-8');
                console.error('FastAPI Failure Data:', errorStr);
                detailedError += ` | Details: ${errorStr}`;
            } catch (e) {}
        }
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: `ML Api Proxy Failed: ${detailedError}` });
    }
});

// Retrieves the dynamic listing of all processed image pairs natively inside the filesystem.
app.get('/api/gallery', (req, res) => {
    try {
        const files = fs.readdirSync(galleryFolder);
        const images = [];
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        files.forEach(file => {
            if (file.endsWith('_input.jpg')) {
                const id = file.split('_')[0];
                const expectedOutput = `${id}_output.jpg`;
                if (files.includes(expectedOutput)) {
                    images.push({
                        id,
                        inputUrl: `${baseUrl}/gallery_files/${file}`,
                        outputUrl: `${baseUrl}/gallery_files/${expectedOutput}`,
                        timestamp: parseInt(id)
                    });
                }
            }
        });
        // Render chronological history properly (recent events first!)
        images.sort((a, b) => b.timestamp - a.timestamp);
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Failed to accurately compile gallery context' });
    }
});

// Deletes specific items efficiently using file referencing
app.delete('/api/gallery/:id', (req, res) => {
    try {
        const id = req.params.id;
        const inputPath = path.join(galleryFolder, `${id}_input.jpg`);
        const outputPath = path.join(galleryFolder, `${id}_output.jpg`);
        
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to execute item purge' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://127.0.0.1:${PORT}`);
});
