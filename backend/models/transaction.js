const mongoose = require('mongoose');
const transactionSchema = mongoose.Schema({
  managerId: { type: String, required: true },
  transportorId: { type: String, required: true },
  dhStaffId: { type: String, required: true },
  dataTime: { type: String, required: true },
  destinationStoreId: { type: String, required: true },
  productLists: { type: Array, required: true },
  transactionStatus: { type: String, required: true },
  remark: { type: String, required: true }
});
module.exports = mongoose.model('Transaction', transactionSchema);


