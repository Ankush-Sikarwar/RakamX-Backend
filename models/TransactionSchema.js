const mongoose = require("mongoose");

const {v4: uuid} = require("uuid");
const crypto = require("crypto")

const TransactionSchema = new mongoose.Schema({

    transactionId:{
        type: String,
        unique: true,
        required: true,
    },
    referenceId: {
  type: String,
  required: true
},
    sender:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true

    },
    receiver:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true

    },
    amount:{
        type: Number,
        required: true
    },
     type: {
    type: String,
    enum: ["debit", "credit"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }


    
});

// TransactionSchema.index({ sender: 1 });
// TransactionSchema.index({ receiver: 1 });


const Transaction = mongoose.model("Transaction", TransactionSchema)
module.exports = { Transaction };