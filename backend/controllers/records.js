const Record = require('../models/record');

exports.createRecord = (req, res, next) => {
  // req.body.lastStock, req.body.stock
  let updatedStock;
  if (req.body.lastStock >= 0) {
    switch ( req.body.code ) {
      case 'SI':  // เพิ่มสต๊อก Stock In
        updatedStock = req.body.lastStock + req.body.stockIn;
        break;
      case 'SO':  // หักสต๊อก Stock Out
        updatedStock = req.body.lastStock - req.body.stockOut;
        break;
      case 'RSI':  // เพิ่มสต๊อกจากการคืนของ Return Stock In
        updatedStock = req.body.lastStock + req.body.stockIn;
        break;
      case 'RSO':  // หักสต๊อกจากการคืนของ Return Stock Out
        updatedStock = req.body.lastStock - req.body.stockOut;
        break;
      default:
        break;
    }
  }
  if (updatedStock < 0) {
    res.status(500).json({
      messages: 'Create a record failed! stock can not nagative'
    })
  }
  const record = new Record({
    productId: req.body.productId,
    storeId: req.body.storeId,
    dateTime: new Date(),
    code: req.body.code,
    stockIn: req.body.stockIn,
    stockOut: req.body.stockOut,
    currentStock: updatedStock,
    transactionId: req.body.transactionId
  });
  record.save().then((createdRecord) => {
    res.status(201);
    res.json({
      messages: 'Record added Successfully',
      record: {
        id: createdRecord._id,
        productId: createdRecord.productId,
        storeId: createdRecord.storeId,
        dateTime: createdRecord.dateTime,
        code: createdRecord.code,
        stockIn: createdRecord.stockIn,
        stockOut: createdRecord.stockOut,
        currentStock: createdRecord.currentStock,
        transactionId: createdRecord.transactionId
      }
    }).catch(error => {
      res.status(500).json({
        messages: 'Create a record failed!'
      })
    });
  }).catch(error => {
    res.status(500).json({
      messages: 'Create a record failed!'
    })
  });
}

exports.getRecords = (req, res, next)=>{
  let fetchRecords;
  Record.find()
  .populate('productId')
  .populate('storeId')
    .then((documents) => {
      fetchRecords = documents;
      return Record.countDocuments();
    }).then( count => {
      res.status(200).json({
        messages: 'Record fetch successfully.',
        records: fetchRecords,
        maxRecords: count
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching records failed!'
      })
    });
  }

exports.getRecordByProductId = (req, res, next) => {
  // console.log(req.params.id);
  Record.findOne({ productId: req.params.id }, {}, { sort: { 'dateTime' : -1 } })
    .populate('productId')
    .populate('storeId')
    .then(record => {
      if (record) {
        res.status(200).json(record);
        // console.log(record);
      } else {
        res.status(404).json({ messages: 'Product not found'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching product records failed!'
      })
    });
  }




