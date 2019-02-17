const Stock = require('../models/stock');

exports.createStock = (req, res, next) => {
  // const stocksArray = req.body;
  // console.log('check---------------stock---array');
  // console.log(req.body);
  const allStocks = req.body;
  // if (stocksArray.length > 0) {
  //   stocksArray.forEach(productStock => {
  //     console.log(productStock);
  //     // for destinationStore
  //     const stockIn = {
  //       productId: productStock.productId,
  //       storeId: productStock.destinationStoreId,
  //       dateTime: productStock.dateTime,
  //       code: 'SI',
  //       stockIn: productStock.stockIn,
  //       stockOut: 0,
  //       currentStock: productStock.currentStock + productStock.stockIn,
  //       transactionId: productStock.transactionId
  //     }

  //     allStocks.push(stock);
  //   });
  // }
  // console.log(allStocks);

  Stock.insertMany(allStocks).then((createdStock) => {
    res.status(201);
    res.json({
      message: 'Stock added'
    });
  }).catch(error => {
    res.status(500).json({
      messages: 'Create current stocks failed!'
    })
  });
}

exports.getStocks = (req, res, next)=>{
  let fetchStocks;
  Stock.find()
  .populate('productId')
  .populate('storeId')
    .then((documents) => {
      fetchStocks = documents;
      return Stock.countDocuments();
    }).then( count => {
      res.status(200).json({
        messages: 'Stock fetch successfully.',
        stocks: fetchStocks,
        maxStocks: count
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching stocks failed!'
      })
    });
  }

exports.getStockByProductId = (req, res, next) => {
  console.log(req.query.productId);
  console.log(req.query.storeId);
  // หาจำนวนสต๊อก
  // ค้นจากสโตร์ที่เป็นต้นทาง และสโตร์ที่เป็นปลายทาง โดยดูจาก produtId
  Stock.findOne({productId: req.query.productId, storeId: req.query.storeId })
    // .populate('productId')
    // .populate('storeId')
    // .and(
    //   [
    //     {
    //       $or : [
    //         {productId: req.query.productId, storeId: req.query.departureStoreId },
    //         {productId: req.query.productId, storeId: req.query.destinationStoreId }
    //       ]
    //     }
    //   ]
    // )
    // .sort({ 'dateTime' : -1 })
    .sort({ 'dateTime' : -1 })
    .then(stock => {
      if (stock) {
        res.status(200).json({message: 'get product ok', stock: stock });
        // console.log(stocks);
      } else {
        let stockNotFound = {
          productId: req.query.productId,
          storeId: req.query.storeId,
          dateTime: Date.now,
          code: '',
          stockIn: 0,
          stockOut: 0,
          currentStock: 0,
          transactionId: ''
        }
        res.status(200).json({ messages: 'Product not found', stock: stockNotFound });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching product stocks failed!'
      })
    });
  }




