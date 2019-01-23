const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
router.post('/signup',(req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
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
        error: err
      });
    });
  });
});

router.post('/login', (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then( user => {
      console.log(user);
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
      // jwt.sign จะต้องผ่านพารามิเตอร์ 3 ค่าเข้าไป
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        'dsfgsfgsdfgsdfgsdfgsdfgvbaZBOo0876dfgsdfgsdfgsdjA0JKrfgsdE29gsdfgsdfguytDsdfgsdfgsdfewrtwretwertw',
        { expiresIn: '1h'}
      );
      res.status(200).json({
        token: token
      });

    }).catch(err => {
      return res.status(401).json({
        message: 'Auth failed จาก bcrypt'
      });
    });
});

module.exports = router;
