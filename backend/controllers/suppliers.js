
const Supplier = require('../models/supplier');

exports.createSupplier = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // userData {email, userId} เป็นข้อมูลที่ส่งมาจาก checkAuth Middleware
  const supplier = new Supplier({
    supplierName: req.body.supplierName,
    supplierDetails: req.body.supplierDetails,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  supplier.save().then((createdSupplier) => {
    res.status(201);
    res.json({
      messages: 'Supplier added Successfully',
      supplier: {
        id: createdSupplier._id,
        supplierName: createdSupplier.supplierName,
        supplierDetails: createdSupplier.supplierDetails,
        imagePath: createdSupplier.imagePath
      }
      // supplier: {
      //   ...createdSupplier,
      //   id: createdSupplier._id
      // }
    });
  }).catch(error => {
    res.status(500).json({
      messages: 'Create a supplier failed!'
    })
  });
}

exports.editSupplier =   (req, res, next) => {
  console.log(req.file);
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + "://" + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const supplier = new Supplier(
    {
      _id: req.body.id,
      supplierName: req.body.supplierName,
      supplierDetails: req.body.supplierDetails,
      imagePath: imagePath,
      creator: req.userData.userId
    }
  );
  //console.log(supplier);
  Supplier.updateOne({ _id: req.params.id, creator: req.userData.userId }, supplier)
    .then(result => {
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Update Successfull'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize edit other suppliers'});
      }
    })
    .catch(error => {
      res.status(500).json({
        messages: 'Could not update supplier'
      })
    });
}

exports.getSuppliers = (req, res, next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const supplierQuery = Supplier.find();
  let fetchSuppliers;
  if (pageSize && currentPage) {
    supplierQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  supplierQuery
    .then((documents) => {
      fetchSuppliers = documents;
      return Supplier.countDocuments();
    }).then( count => {
      res.status(200).json({
        messages: 'Supplier fetch successfully.',
        suppliers: fetchSuppliers,
        maxSuppliers: count
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching suppliers failed!'
      })
    });
  }

exports.getSupplier = (req, res, next) => {
  Supplier.findById(req.params.id)
    .then(supplier => {
      if (supplier) {
        res.status(200).json(supplier);
        //console.log(supplier);
      } else {
        res.status(404).json({ messages: 'Supplier not found'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching suppliers failed!'
      })
    });
  }

exports.deleteSupplier = (req, res, next) => {
  Supplier.deleteOne({_id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      // console.log(result);
      // ตรวจสอบ n สำหรับ ลบ ตรวจสอบ nModified สำหรับการแก้ไข
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Supplier deleted already!'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize to delete other suppliers'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Deleting suppliers failed!'
      })
    });
}
