const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // const token = req.query.auth
    const token = req.headers.authorization.split(' ')[1];  // เอาฝั่งขวาจาก Bearer "token"

    jwt.verify(token, 'dsfgsfgsdfgsdfgsdfgsdfgvbaZBOo0876dfgsdfgsdfgsdjA0JKrfgsdE29gsdfgsdfguytDsdfgsdfgsdfewrtwretwertw');
    next();
  } catch (error) {
    res.status(401).json({message: 'Auth failed! นะ เวอร์ริไฟล์ไม่ผ่าน check-auth.js'})
  }

}
