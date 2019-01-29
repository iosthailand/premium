const express = require('express');
const productsController = require('../controllers/products');
const checkAuth = require('../middleware/check-auth');
const checkManager = require('../middleware/check-manager');
const extractFile = require('../middleware/file');
const router = express.Router();

router.post('', checkAuth, checkManager, extractFile, productsController.createProduct);
router.put('/:id', checkAuth, checkManager, extractFile, productsController.editProduct);
router.get('', productsController.getProducts);
router.get('/:id', productsController.getProduct );
router.delete('/:id', checkAuth, checkManager, productsController.deleteProduct );

module.exports = router;
