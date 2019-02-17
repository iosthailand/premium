const express = require('express');
const transactionsController = require('../controllers/transactions');
const stocksController = require('../controllers/stocks')
const checkAuth = require('../middleware/check-auth');
// const extractFile = require('../middleware/file');
const router = express.Router();

router.post('', checkAuth, transactionsController.createTransaction);
router.put('/:id', checkAuth, transactionsController.editTransaction);
router.get('', transactionsController.getTransactions);
router.get('/:id', transactionsController.getTransaction);
router.delete('/:id', checkAuth, transactionsController.deleteTransaction );
router.put('/change/:id', checkAuth, transactionsController.changeTransaction );
router.post('/stock', checkAuth, stocksController.createStock );
module.exports = router;
