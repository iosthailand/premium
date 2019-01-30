const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const storeRoutes = require('./routes/stores');
const transactionRoutes = require('./routes/transactions');
const app = express();
mongoose.connect('mongodb+srv://tsubasa:' + process.env.MONGO_ATLAS_PW + '@jeerawuth007-5duea.mongodb.net/node-angular?retryWrites=true', { useNewUrlParser: true, useCreateIndex: true })
.then(() => {
    console.log('Database Connected!');
  })
  .catch(() => {
    console.log('Can not Connect to Database!!!!');
  });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join('images')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
process.setMaxListeners(0); // prevent MaxListenersExceededWarning
module.exports = app;
