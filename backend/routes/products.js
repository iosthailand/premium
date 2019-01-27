const express = require('express');
const productsController = require('../controllers/products');
const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');
const router = express.Router();

router.post('/product', checkAuth, extractFile, productsController.createProduct);
router.put('/product/:id', checkAuth, extractFile, productsController.editProduct);
router.get('/product', productsController.getProducts);
router.get('/product/:id', productsController.getProduct );
router.delete('/product/:id', checkAuth, productsController.deleteProduct );

module.exports = router;
