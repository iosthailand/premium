const express = require('express');
const transactionsController = require('../controllers/transactions');
const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');
const router = express.Router();

router.post('', checkAuth, extractFile, transactionsController.createTransaction);
router.put('/:id', checkAuth, extractFile, transactionsController.editTransaction);
router.get('', transactionsController.getTransactions);
router.get('/:id', transactionsController.getTransaction );
router.delete('/:id', checkAuth, transactionsController.deleteTransaction );

module.exports = router;
