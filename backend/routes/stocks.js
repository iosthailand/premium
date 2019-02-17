const express = require('express');
const stocksController = require('../controllers/stocks');
const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.post('', checkAuth, stocksController.createStock);
router.get('', stocksController.getStockByProductId);
// router.get('/:productId:storeId', stocksController.getStockByProductId );


module.exports = router;
