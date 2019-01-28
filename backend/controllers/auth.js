
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      content: '',
      password: hash,
      permission: 'general',
      status: false
    });
    user.save()
    .then(result => {
      res.status(201).json({
        message: 'User created',
        result: result
      });
    })
    .catch(err => {
      res.status(500).json({
          message: 'Invalid authentication credentials'
      });
    });
  });
}

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then( user => {
      // console.log(user);
      if(!user) {
        return res.status(401).json({
          message: 'Auth failed ไม่พบ user'
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      //console.log(result);
      if(!result) {
        return res.status(401).json({
          message: 'Auth failed รหัสผ่านไม่ตรงนะ'
        });
      }
      // เข้ารหัส permission แล้วผ่านค่าเข้าไปใน token แล้วเซฟใน local storage ของบราวเซอร์
      bcrypt.hash(fetchedUser.permission, 10).then((permissionHash) => {
        // jwt.sign จะต้องผ่านพารามิเตอร์ 3 ค่าเข้าไป
        const token = jwt.sign(
          { email: fetchedUser.email, userId: fetchedUser._id, userPermission: permissionHash },
          process.env.JWT_KEY,
          { expiresIn: '1h'}
        );
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id,
          userPermission: permissionHash
        });
      });


    }).catch(err => {
      return res.status(401).json({
        message: 'Invalid authentication credentials'
      });
    });
}
