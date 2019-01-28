const express = require('express');
const productsController = require('../controllers/products');
const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');
const router = express.Router();

router.post('', checkAuth, extractFile, productsController.createProduct);
router.put('/:id', checkAuth, extractFile, productsController.editProduct);
router.get('', productsController.getProducts);
router.get('/:id', productsController.getProduct );
router.delete('/:id', checkAuth, productsController.deleteProduct );

module.exports = router;
