const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // const token = req.query.auth
    const token = req.headers.authorization.split(' ')[1];  // เอาฝั่งขวาจาก Bearer "token"

    const decodedToken = jwt.verify(token, 'dsfgsfgsdfgsdfgsdfgsdfgvbaZBOo0876dfgsdfgsdfgsdjA0JKrfgsdE29gsdfgsdfguytDsdfgsdfgsdfewrtwretwertw');
    // add req to next middleware ในกรณีนี้เราจะผ่านค่า email และ id ของผู้ใช้
    req.userData = {
      email: decodedToken.email,
      userId: decodedToken.userId
    };
    next();
  } catch (error) {
    res.status(401).json({message: 'Auth failed! นะ เวอร์ริไฟล์ไม่ผ่าน check-auth.js'})
  }

}
