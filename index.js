const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const sharp = require('sharp');

const app = express();
const port = process.env.PORT || 3000;

const fallbackUrl = "https://raw.githubusercontent.com/LeonardSSH/vscord/main/assets/icons/";

app.use(cors());

app.get('/', (req, res) => {
    res.status(200).send('Hello, world!');
});

app.get('/icon/:image', async (req, res) => {
    const imageName = req.params.image;
    const imagePath = path.join(__dirname, 'icons', `${imageName}.png`);

    if (fs.existsSync(imagePath)) {
        res.set('Content-Type', 'image/png');
        res.status(200).sendFile(imagePath);
    } else {
        try {
            const fallbackImageUrl = `${fallbackUrl}${imageName}.png`;
            const response = await axios.get(fallbackImageUrl, { responseType: 'arraybuffer' });

            const compressedImage = await sharp(response.data)
                .resize(128, 128, { fit: 'fill' })
                .resize(1024, 1024, { fit: 'fill' })
                .webp({ quality: 1, alphaQuality: 0, effort: 0 })
                .toBuffer();

            res.set('Content-Type', 'image/jpeg');
            res.status(200).send(compressedImage);
        } catch (error) {
            console.error(error);
            res.status(500).send(String(error));
        }
    }
});

app.listen(port, () => {
    console.log(`✅ | The server is running on port ${port}!`);
});
