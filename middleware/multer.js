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
    if (file.mimetype.startsWith('image/')) {

        return cb(null, true);
    } else {
        return cb(appError.create('file must be an image',400 ), false);
    }
};

// Initialize Multer upload
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;