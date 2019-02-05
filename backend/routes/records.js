const express = require('express');
const recordsController = require('../controllers/records');
const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.post('', checkAuth, recordsController.createRecord);
router.get('', recordsController.getRecords);
router.get('/:id', recordsController.getRecordByProductId );

module.exports = router;
