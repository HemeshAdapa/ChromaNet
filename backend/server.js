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
        
        let pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
        // Intercept their URL properly
        if (pythonApiUrl.endsWith('/predict')) pythonApiUrl = pythonApiUrl.replace('/predict', '/predict_base64');
        else if (!pythonApiUrl.endsWith('/predict_base64')) pythonApiUrl += '/predict_base64';
        
        console.log(`Routing image via native JSON Base64 to ML API at: ${pythonApiUrl}`);
        
        // Native JSON Architecture to decisively prevent the Reverse Proxy Stream Terminations
        const fileContent = fs.readFileSync(filePath);
        const base64Input = fileContent.toString('base64');

        const response = await axios.post(pythonApiUrl, { image: base64Input }, {
            headers: { 'Content-Type': 'application/json' },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (response.data.error) {
            throw new Error(`Cloud API internal crash: ${response.data.error}`);
        }

        const outputBuffer = Buffer.from(response.data.image, 'base64');

        const id = Date.now().toString();
        const inputGalleryPath = path.join(galleryFolder, `${id}_input.jpg`);
        const outputGalleryPath = path.join(galleryFolder, `${id}_output.jpg`);

        fs.copyFileSync(filePath, inputGalleryPath);
        fs.writeFileSync(outputGalleryPath, outputBuffer);
        
        fs.unlinkSync(filePath); 

        res.json({
            success: true,
            id: id,
            image: `data:image/jpeg;base64,${response.data.image}`
        });

    } catch (error) {
        console.error('Error in /colorize endpoint:', error.message);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: `ML Api Proxy Failed: ${error.message}` });
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
