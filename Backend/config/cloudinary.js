const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'ridehub/bikes',
            format: 'jpeg', // supports promises as well
            public_id: file.fieldname + '-' + Date.now(),
        };
    },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
