const express = require("express");
const mongoose = require("mongoose")
const {User} = require("../models/UserSchema")
const {Account} = require("../models/AccountsSchema")
const { Transaction } = require("../models/TransactionSchema")
const { v4: uuid } = require('uuid');

const showBalance = async(req,res) => {

    try{
        const userId = req.user.id;

    const account = await Account.findOne({userId})

    if(!account){
        return res.status(404).json({
            msg: "account not found"
        })
    }
    

    res.json({
        message:"account balance fetched:",
        balance: account.balance
    })

    }catch(e){
        console.log("message:" ,e.message)
        res.json({
            message:"error in fetching balance"
        })
    }

    
}

const transfer = async (req, res) => {

  const session = await mongoose.startSession();
  

  try {
    session.startTransaction();
   

     const fromUserId = req.user.id;
   

    const { amount, bearer } = req.body;
    

 

   

    const fromAccount = await Account.findOne({ userId: fromUserId }).session(session);
    if (!fromAccount || fromAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient Balance" });
    }

    const toUser = await User.findOne({
      $or: [{ email: bearer }, { username: bearer }]
    }).session(session);
 

    if (!toUser) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Recipient not found" });
    }

    const toAccount = await Account.findOne({ userId: toUser._id }).session(session);
    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Recipient account not found" });
    }
    

    
    await Account.updateOne(
      { userId: fromUserId },
      { $inc: { balance: -amount } }
    ).session(session);

    await Account.updateOne(
      { userId: toUser._id },
      { $inc: { balance: amount } }
    ).session(session);

    const debitId = uuid();
    const creditId = uuid();
    const referenceId = uuid();


    console.log("Before transaction save");
    const debitTransaction = new Transaction({
      transactionId: debitId,
      referenceId,
      sender: fromUserId,
      receiver: toUser._id,
      amount,
      type: "debit",
      status: "success"
    });

   try {
  await debitTransaction.save({ session });
  console.log("Saved debit");
} catch (e) {
  console.log("Failed to save debit:", e.message);
}

   
    const creditTransaction = new Transaction({
      transactionId: creditId,
      referenceId,
      sender: fromUserId,
      receiver: toUser._id,
      amount,
      type: "credit",
      status: "success"
    });

    
    console.log("Saved debit");
   try {
  await creditTransaction.save({ session });
  console.log("Saved credit");
} catch (e) {
  console.log("Failed to save credit:", e.message);
}
    console.log("Saved credit");
    console.log("done")

    await session.commitTransaction();

    res.status(200).json({ message: "Transfer successful", referenceId });

  } catch (error) {
    
    res.status(500).json({ message: "Transaction failed", error: error.message });
  } finally {
    session.endSession();
  }
};

const transferupi = async (req, res) => {
console.log("start")
  const session = await mongoose.startSession();
  

  try {
    session.startTransaction();
   

     const fromUserId = req.user.id;
  

    const { amount, upiId } = req.body;
    
    

    const fromAccount = await Account.findOne({ userId: fromUserId }).session(session);
    if (!fromAccount || fromAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient Balance" });
    }

  

    const toUser = await Account.findOne({
      upiid: upiId
    }).session(session);


    if (!toUser) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Recipient not found" });
    }


    const toAccount = await Account.findOne({ userId: toUser.userId }).session(session);
    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Recipient account not found" });
    }


    await Account.updateOne(
      { userId: fromUserId },
      { $inc: { balance: -amount } }
    ).session(session);

    await Account.updateOne(
      { userId: toUser._id },
      { $inc: { balance: amount } }
    ).session(session);

    const debitId = uuid();
    const creditId = uuid();
    const referenceId = uuid();

    console.log("Before transaction save");
    const debitTransaction = new Transaction({
      transactionId: debitId,
      referenceId,
      sender: fromUserId,
      receiver: toUser._id,
      amount,
      type: "debit",
      status: "success"
    });

   try {
  await debitTransaction.save({ session });
  console.log("Saved debit");
} catch (e) {
  console.log("Failed to save debit:", e.message);
}

   
    const creditTransaction = new Transaction({
      transactionId: creditId,
      referenceId,
      sender: fromUserId,
      receiver: toUser._id,
      amount,
      type: "credit",
      status: "success"
    });

    
    console.log("Saved debit");
   try {
  await creditTransaction.save({ session });
  console.log("Saved credit");
} catch (e) {
  console.log("Failed to save credit:", e.message);
}
    console.log("Saved credit");
    console.log("done")

    await session.commitTransaction();

    res.status(200).json({ message: "Transfer successful", referenceId });

  } catch (error) {
    
    res.status(500).json({ message: "Transaction failed", error: error.message });
  } finally {
    session.endSession();
  }
};



const transactions = async(req,res) =>{


  try{
    const userId = req.user.id;

  const transactions = await Transaction.find({
  $or: [
    { sender: userId },
    { receiver: userId }
  ]
})
  .sort({ createdAt: -1 })
  .populate("sender", "username email")
  .populate("receiver", "username email");

const seenRefs = new Set();

const formatted = [];

for (const tx of transactions) {
  if (seenRefs.has(tx.referenceId)) continue;

  seenRefs.add(tx.referenceId);

  const isSender = tx.sender._id.toString() === userId;

  formatted.push({
    transactionId: tx.transactionId,
    referenceId: tx.referenceId,
    type: isSender ? "debit" : "credit",
    amount: tx.amount,
    from: tx.sender.username,
    to: tx.receiver.username,
    date: tx.createdAt,
    status: tx.status,
  });
}

    res.status(200).json({ transactions: formatted });
  }
  catch (err) {
    console.error("Failed to fetch transactions:", err);
    res.status(500).json({ message: "Could not fetch transaction history" });
  }


}


module.exports = {showBalance, transfer, transactions, transferupi}
