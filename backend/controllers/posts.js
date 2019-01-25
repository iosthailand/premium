
const Post = require('../models/post');

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // userData {email, userId} เป็นข้อมูลที่ส่งมาจาก checkAuth Middleware
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then((createdPost) => {
    res.status(201);
    res.json({
      messages: 'Post added Successfully',
      post: {
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
      // post: {
      //   ...createdPost,
      //   id: createdPost._id
      // }
    });
  }).catch(error => {
    res.status(500).json({
      messages: 'Create a post failed!'
    })
  });
}

exports.editPost =   (req, res, next) => {
  console.log(req.file);
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + "://" + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const post = new Post(
    {
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId
    }
  );
  //console.log(post);
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then(result => {
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Update Successfull'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize edit other posts'});
      }
    })
    .catch(error => {
      res.status(500).json({
        messages: 'Could not update post'
      })
    });
}

exports.getPosts = (req, res, next)=>{
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fetchPosts = documents;
      return Post.countDocuments();
    }).then( count => {
      res.status(200).json({
        messages: 'Post fetch successfully.',
        posts: fetchPosts,
        maxPosts: count
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching posts failed!'
      })
    });
  }

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
        //console.log(post);
      } else {
        res.status(404).json({ messages: 'Post not found'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Fetching posts failed!'
      })
    });
  }

exports.deletePost = (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      // console.log(result);
      // ตรวจสอบ n สำหรับ ลบ ตรวจสอบ nModified สำหรับการแก้ไข
      if (result.n > 0 ) { // ตรวจสอบสถานะการอัพเดท
        //console.log(result);
        res.status(200).json({ messages: 'Post deleted already!'});
      } else {
        res.status(401).json({ messages: 'User Not Authorize to delete other posts'});
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Deleting posts failed!'
      })
    });
}