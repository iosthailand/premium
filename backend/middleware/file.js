
const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg'
}


// const checkAuth = require('../middleware/check-auth');

// กำหนดค่า config ให้กับ multer สำหรับสั่งให้เซฟไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mine type');
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});


module.exports = multer({'storage': storage}).single('image');
