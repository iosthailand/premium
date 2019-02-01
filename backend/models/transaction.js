const mongoose = require('mongoose');
const transactionSchema = mongoose.Schema({

  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  transportorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  dateTime: { type: Date, default: Date.now },
  departureStoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  destinationStoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  productLists:  [
                    {
                      productId: String,
                      productSku: String,
                      productName: String,
                      imagePath: String,
                      productQuantity: Number
                    }
                  ],
  transactionStatus: { type: String, required: false },
  remark: { type: String, required: false }
});
module.exports = mongoose.model('Transaction', transactionSchema);

