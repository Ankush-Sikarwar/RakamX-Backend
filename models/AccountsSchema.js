const mongoose = require("mongoose");
const User = require("./UserSchema")

const AccountSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
        
    },
    accountnumber:{
        type: Number,
        required: true,
        unique: true
    },
    IFSCnumber:{
        type: String,
        default: "RAKAMX21291909"
    },
    qrcode:{
        type: String

    },
    upiid:{
        type: String,
        unique: true
    },
    balance: {
        type: Number,
        required: true
    }


})

const Account = mongoose.model('Account' , AccountSchema);

module.exports = {Account};