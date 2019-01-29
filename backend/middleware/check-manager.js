
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];  // เอาฝั่งขวาจาก Bearer "token"
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    console.log(decodedToken.userPermission);
    bcrypt.compare('Storage Manager', decodedToken.userPermission)
      .then((result) => {
        if(!result) {
          return res.status(401).json({
            message: 'Auth failed ขออภัยต้องเป็น Manager เท่านั้นนะจ๊ะ check-manager.js'
          });
        }
        next();
      }).catch((err) => {
        res.status(401).json({message: 'Auth failed! ถอดรหัสไม่ได้ check-manager.js'})
      });
  } catch (error) {
    res.status(401).json({message: 'Auth failed! นะ เวอร์ริไฟล์ไม่ผ่าน check-manager.js'})
  }

}
