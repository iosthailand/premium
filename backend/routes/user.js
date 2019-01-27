const express = require('express');
const usersController = require('../controllers/users');
const checkAdmin = require('../middleware/check-admin');
const router = express.Router();

router.post('', checkAdmin, usersController.createUser);
router.put('/:id', checkAdmin, usersController.editUser);
router.get('', usersController.getUsers);
router.get('/:id', usersController.getUser );
router.delete('/:id', checkAdmin, usersController.deleteUser );

module.exports = router;
