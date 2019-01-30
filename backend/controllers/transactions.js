
const Transaction = require('../models/transaction');

exports.createTransaction = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // userData {email, userId} เป็นข้อมูลที่ส่งมาจาก checkAuth Middleware
  const transaction = new Transaction({
    transactionSku: req.body.transactionSku,
    transactionName: req.body.transactionName,
    transactionDetails: req.body.transactionDetails,
    transactionCategory: req.body.transactionCategory,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  transaction.save().then((createdTransaction) => {
    res.status(201);
    res.json({
      messages: 'Transaction added Successfully',
      transaction: {
        id: createdTransaction._id,
        managerId: createdTransaction.managerId,
        transportorId: createdTransaction.transportorId,
        dhStaffId: createdTransaction.dhStaffId,
        dataTime: new Date(),
        departureStoreId: createdTransaction.departureStoreId,
        destinationStoreId: createdTransaction.destinationStoreId,
        productLists: createdTransaction.productLists,
        transactionStatus: createdTransaction.transactionStatus,
        remark: createdTransaction.remark
      }
      // transaction: {
      //   ...createdTransaction,
      //   id: createdTransaction._id
      // }
    });
  }).catch(error => {
    res.status(500).json({
      messages: 'Create a transaction failed!'
    })
  });
}

exports.editTransaction =   (req, res, next) => {
  console.log(req.file);
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + "://" + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const transaction = new Transaction(
    {
      _id: req.body.id,
      managerId: req.body.managerId,
      transportorId: req.body.transportorId,
      dhStaffId: req.body.dhStaffId,
      dataTime: new Date(),
      departureStoreId: req.body.departureStoreId,
      destinationStoreId: req.body.destinationStoreId,
      productLists: req.body.productLists,
      transactionStatus: req.body.transactionStatus,
      remark: req.body.remark
    }
  );
  //console.log(transaction);
  Transaction.updateOne({ _id: req.params.id, creator: req.userData.userId }, transaction)
    .then(result => {
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Update Successfull'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize edit other transactions'});
      }
    })
    .catch(error => {
      res.status(500).json({
        messages: 'Could not update transaction'
      })
    });
}

exports.getTransactions = (req, res, next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const transactionQuery = Transaction.find();
  let fetchTransactions;
  if (pageSize && currentPage) {
    transactionQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  transactionQuery
    .then((documents) => {
      fetchTransactions = documents;
      return Transaction.countDocuments();
    }).then( count => {
      res.status(200).json({
        messages: 'Transaction fetch successfully.',
        transactions: fetchTransactions,
        maxTransactions: count
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching transactions failed!'
      })
    });
  }

exports.getTransaction = (req, res, next) => {
  Transaction.findById(req.params.id)
    .then(transaction => {
      if (transaction) {
        res.status(200).json(transaction);
        //console.log(transaction);
      } else {
        res.status(404).json({ messages: 'Transaction not found'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching transactions failed!'
      })
    });
  }

exports.deleteTransaction = (req, res, next) => {
  Transaction.deleteOne({_id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      // console.log(result);
      // ตรวจสอบ n สำหรับ ลบ ตรวจสอบ nModified สำหรับการแก้ไข
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Transaction deleted already!'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize to delete other transactions'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Deleting transactions failed!'
      })
    });
}
