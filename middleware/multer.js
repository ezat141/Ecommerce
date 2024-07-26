const multer = require('multer');
const appError = require("../utils/appError");




// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
        cb(null, file.originalname); // Use the original file name
    }
});

// Multer file filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File must be an image'), false);
    }
};

// Initialize Multer upload
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;