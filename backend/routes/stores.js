const express = require('express');
const storeController = require('../controllers/stores');
const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-admin');
const extractFile = require('../middleware/file');
const router = express.Router();

router.post('', checkAuth, checkAdmin, extractFile, storeController.createStore);
router.put('/:id', checkAuth, checkAdmin, extractFile, storeController.editStore);
router.get('', storeController.getStores);
router.get('/:id', storeController.getStore );
router.delete('/:id', checkAuth, checkAdmin, storeController.deleteStore );

module.exports = router;
