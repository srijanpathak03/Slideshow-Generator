const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.post('/api/upload', upload.array('images', 10), async (req, res) => {
  try {
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);
    res.json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

app.post('/api/generate-video', async (req, res) => {
  try {
    const { imageUrls } = req.body;
    const publicIds = imageUrls.map(url => {
      const regex = /\/v\d+\/([^\.]+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    });

    if (publicIds.includes(null)) {
      return res.status(400).json({ error: 'Invalid image URLs' });
    }

    const manifestJson = {
      w: 1280,
      h: 720,
      du: 5,
      vars: {
        sdur: 3000,
        tdur: 1500,
        slides: publicIds.map(publicId => ({ media: `i:${publicId}` }))
      }
    };

    const videoResult = await cloudinary.uploader.create_slideshow({
      manifest_json: JSON.stringify(manifestJson),
      resource_type: 'video',
      public_id: `slideshow_${Date.now()}`
    });

    res.json({ videoId: videoResult.public_id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate video' });
  }
});

app.get('/api/video-status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const result = await cloudinary.api.resource(videoId, { resource_type: 'video' });

    if (result && result.secure_url) {
      res.json({ status: 'ready', url: result.secure_url });
    } else {
      res.json({ status: 'processing' });
    }
  } catch (error) {
    if (error.http_code === 404) {
      res.status(404).json({ status: 'processing', error: 'Video not ready yet or not found' });
    } else {
      res.status(500).json({ error: 'Failed to check video status' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
