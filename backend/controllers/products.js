
const Product = require('../models/product');

exports.createProduct = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // userData {email, userId} เป็นข้อมูลที่ส่งมาจาก checkAuth Middleware
  const product = new Product({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  product.save().then((createdProduct) => {
    res.status(201);
    res.json({
      messages: 'Product added Successfully',
      product: {
        id: createdProduct._id,
        title: createdProduct.title,
        content: createdProduct.content,
        imagePath: createdProduct.imagePath
      }
      // product: {
      //   ...createdProduct,
      //   id: createdProduct._id
      // }
    });
  }).catch(error => {
    res.status(500).json({
      messages: 'Create a product failed!'
    })
  });
}

exports.editProduct =   (req, res, next) => {
  console.log(req.file);
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + "://" + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const product = new Product(
    {
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId
    }
  );
  //console.log(product);
  Product.updateOne({ _id: req.params.id, creator: req.userData.userId }, product)
    .then(result => {
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Update Successfull'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize edit other products'});
      }
    })
    .catch(error => {
      res.status(500).json({
        messages: 'Could not update product'
      })
    });
}

exports.getProducts = (req, res, next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const productQuery = Product.find();
  let fetchProducts;
  if (pageSize && currentPage) {
    productQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  productQuery
    .then((documents) => {
      fetchProducts = documents;
      return Product.countDocuments();
    }).then( count => {
      res.status(200).json({
        messages: 'Product fetch successfully.',
        products: fetchProducts,
        maxProducts: count
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching products failed!'
      })
    });
  }

exports.getProduct = (req, res, next) => {
  Product.findById(req.params.id)
    .then(product => {
      if (product) {
        res.status(200).json(product);
        //console.log(product);
      } else {
        res.status(404).json({ messages: 'Product not found'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching products failed!'
      })
    });
  }

exports.deleteProduct = (req, res, next) => {
  Product.deleteOne({_id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      // console.log(result);
      // ตรวจสอบ n สำหรับ ลบ ตรวจสอบ nModified สำหรับการแก้ไข
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Product deleted already!'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize to delete other products'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Deleting products failed!'
      })
    });
}
