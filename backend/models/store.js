const mongoose = require('mongoose');
const storeSchema = mongoose.Schema({
  storeName: { type: String, required: true },
  storeCode: { type: String, required: true },
  storeDetails: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
module.exports = mongoose.model('Store', storeSchema);
