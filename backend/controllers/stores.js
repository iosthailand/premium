
const Store = require('../models/store');

exports.createStore = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // userData {email, userId} เป็นข้อมูลที่ส่งมาจาก checkAuth Middleware
  const store = new Store({
    storeName: req.body.storeName,
    storeCode: req.body.storeCode,
    storeDetails: req.body.storeDetails,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  store.save().then((createdStore) => {
    res.status(201);
    res.json({
      messages: 'Store added Successfully',
      store: {
        id: createdStore._id,
        storeName: createdStore.storeName,
        storeCode: createdStore.storCode,
        storeDetails: createdStore.storeDetails,
        imagePath: createdStore.imagePath
      }
      // store: {
      //   ...createdStore,
      //   id: createdStore._id
      // }
    });
  }).catch(error => {
    res.status(500).json({
      messages: 'Create a store failed!'
    })
  });
}

exports.editStore =   (req, res, next) => {
  console.log(req.file);
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + "://" + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const store = new Store(
    {
      _id: req.body.id,
      storeName: req.body.storeName,
      storeCode: req.body.storeCode,
      storeDetails: req.body.storeDetails,
      imagePath: imagePath,
      creator: req.userData.userId
    }
  );
  // ยกเลิกการอัพเดทเฉพาะไอดีเดิม
  // Store.updateOne({ _id: req.params.id, creator: req.userData.userId }, store)
  Store.updateOne({ _id: req.params.id }, store)
    .then(result => {
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Update Successfull'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize edit other stores'});
      }
    })
    .catch(error => {
      res.status(500).json({
        messages: 'Could not update store'
      })
    });
}

exports.getStores = (req, res, next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const storeQuery = Store.find();
  let fetchStores;
  if (pageSize && currentPage) {
    storeQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  storeQuery
    .then((documents) => {
      fetchStores = documents;
      return Store.countDocuments();
    }).then( count => {
      res.status(200).json({
        messages: 'Store fetch successfully.',
        stores: fetchStores,
        maxStores: count
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching stores failed!'
      })
    });
  }

exports.getStore = (req, res, next) => {
  Store.findById(req.params.id)
    .then(store => {
      if (store) {
        res.status(200).json(store);
        //console.log(store);
      } else {
        res.status(404).json({ messages: 'Store not found'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching stores failed!'
      })
    });
  }

exports.deleteStore = (req, res, next) => {
  // ยกเลิกการลบเมื่อเป็นไอดีเดิม
  // Store.deleteOne({_id: req.params.id, creator: req.userData.userId })
  Store.deleteOne({_id: req.params.id })
    .then((result) => {
      // console.log(result);
      // ตรวจสอบ n สำหรับ ลบ ตรวจสอบ nModified สำหรับการแก้ไข
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Store deleted already!'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize to delete other stores'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Deleting stores failed!'
      })
    });
}
