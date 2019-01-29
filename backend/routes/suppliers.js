const express = require('express');
const supplierController = require('../controllers/suppliers');
const checkAuth = require('../middleware/check-auth');
const checkManager = require('../middleware/check-manager');
const extractFile = require('../middleware/file');
const router = express.Router();

router.post('', checkAuth, checkManager, extractFile, supplierController.createSupplier);
router.put('/:id', checkAuth, checkManager, extractFile, supplierController.editSupplier);
router.get('', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplier );
router.delete('/:id', checkAuth, checkManager, supplierController.deleteSupplier );

module.exports = router;
