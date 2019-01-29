
const Category = require('../models/category');

exports.createCategory = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // userData {email, userId} เป็นข้อมูลที่ส่งมาจาก checkAuth Middleware
  const category = new Category({
    categoryName: req.body.categoryName,
    categoryDetails: req.body.categoryDetails,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  category.save().then((createdCategory) => {
    res.status(201);
    res.json({
      messages: 'Category added Successfully',
      category: {
        id: createdCategory._id,
        categoryName: createdCategory.categoryName,
        categoryDetails: createdCategory.categoryDetails,
        imagePath: createdCategory.imagePath
      }
      // category: {
      //   ...createdCategory,
      //   id: createdCategory._id
      // }
    });
  }).catch(error => {
    res.status(500).json({
      messages: 'Create a category failed!'
    })
  });
}

exports.editCategory =   (req, res, next) => {
  console.log(req.file);
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + "://" + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const category = new Category(
    {
      _id: req.body.id,
      categoryName: req.body.categoryName,
      categoryDetails: req.body.categoryDetails,
      imagePath: imagePath,
      creator: req.userData.userId
    }
  );
  //console.log(category);
  Category.updateOne({ _id: req.params.id, creator: req.userData.userId }, category)
    .then(result => {
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Update Successfull'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize edit other categories'});
      }
    })
    .catch(error => {
      res.status(500).json({
        messages: 'Could not update category'
      })
    });
}

exports.getCategories = (req, res, next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const categoryQuery = Category.find();
  let fetchCategories;
  if (pageSize && currentPage) {
    categoryQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  categoryQuery
    .then((documents) => {
      fetchCategories = documents;
      return Category.countDocuments();
    }).then( count => {
      res.status(200).json({
        messages: 'Category fetch successfully.',
        categories: fetchCategories,
        maxCategorys: count
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching categorys failed!'
      })
    });
  }

exports.getCategory = (req, res, next) => {
  Category.findById(req.params.id)
    .then(category => {
      if (category) {
        res.status(200).json(category);
        //console.log(category);
      } else {
        res.status(404).json({ messages: 'Category not found'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching categorys failed!'
      })
    });
  }

exports.deleteCategory = (req, res, next) => {
  Category.deleteOne({_id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      // console.log(result);
      // ตรวจสอบ n สำหรับ ลบ ตรวจสอบ nModified สำหรับการแก้ไข
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Category deleted already!'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize to delete other categorys'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Deleting categorys failed!'
      })
    });
}
