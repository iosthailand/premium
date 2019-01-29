const express = require('express');
const categoryController = require('../controllers/categories');
const checkAuth = require('../middleware/check-auth');
const checkManager = require('../middleware/check-manager');
const extractFile = require('../middleware/file');
const router = express.Router();

router.post('', checkAuth, checkManager, extractFile, categoryController.createCategory);
router.put('/:id', checkAuth, checkManager, extractFile, categoryController.editCategory);
router.get('', categoryController.getCategories);
router.get('/:id', categoryController.getCategory );
router.delete('/:id', checkAuth, checkManager, categoryController.deleteCategory );

module.exports = router;
