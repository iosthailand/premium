const mongoose = require('mongoose');
const transactionSchema = mongoose.Schema({
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transportorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  dhStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  dataTime: { type: Date, required: true },
  departureStoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  destinationStoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  productLists: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true } ],
  transactionStatus: { type: String, required: true },
  remark: { type: String, required: false }
});
module.exports = mongoose.model('Transaction', transactionSchema);


