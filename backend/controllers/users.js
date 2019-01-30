const User = require('../models/user');

const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');


exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      content: req.body.content,
      password: hash,
      permission: req.body.permission,
      storeId: req.body.storeId,
      status: req.body.status
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

exports.editUser =   (req, res, next) => {
  const user = new User(
    {
      _id: req.body.id,
      email: req.body.email,
      content: req.body.content,
      password: req.body.password,
      permission: req.body.permission,
      storeId: req.body.storeId,
      status: req.body.status
    }
  );


  //console.log(user);
  User.updateOne({ _id: req.params.id }, user)
    .then(result => {
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Update Successfull'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize edit other users'});
      }
    })
    .catch(error => {
      res.status(500).json({
        messages: 'Could not update user'
      })
    });
}

exports.getUsers = (req, res, next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const userQuery = User.find();
  let fetchUsers;
  if (pageSize && currentPage) {
    userQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  userQuery
    .then((documents) => {
      fetchUsers = documents;
      return User.countDocuments();
    }).then( count => {
      res.status(200).json({
        messages: 'User fetch successfully.',
        users: fetchUsers,
        maxUsers: count
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching users failed!'
      })
    });
  }

exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      if (user) {
        res.status(200).json(user);
        //console.log(user);
      } else {
        res.status(404).json({ messages: 'User not found'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching users failed!'
      })
    });
  }

exports.deleteUser = (req, res, next) => {
  User.deleteOne({_id: req.params.id })
    .then((result) => {
      // console.log(result);
      // ตรวจสอบ n สำหรับ ลบ ตรวจสอบ nModified สำหรับการแก้ไข
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'User deleted already!'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize to delete other users'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Deleting users failed!'
      })
    });
}
