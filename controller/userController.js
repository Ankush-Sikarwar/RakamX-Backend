require('dotenv').config();


const mongoose = require("mongoose")
const {authMiddleware} = require("../middleware/authMiddleware")
const { User} = require('../models/UserSchema')
const {Account} = require('../models/AccountsSchema')
const { Transaction } = require("../models/TransactionSchema");
const bcrypt  = require('bcrypt')
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const QRcode = require("qrcode")



const generateUniqueAccountNumber = async () => {
  const randomAccount = () => Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10-digit number

  let exists = true;
  let accountNumber;

  while (exists) {
    accountNumber = randomAccount();
    const existing = await Account.findOne({ accountNumber });
    if (!existing) exists = false;
  }

  return accountNumber;
};







const createUser = async (req,res) =>{
    const {username, password, firstname, lastname ,email} = req.body;
    const normalizedEmail = email.toLowerCase();
    

    try{

        const salt = await bcrypt.genSalt(10);
        const hashedPassword  = await bcrypt.hash(password,salt);

        const user = await User.create({
            email: normalizedEmail,
            username,
            password: hashedPassword,
            firstname,
            lastname
        })
        const userCreated = await user.save();
        if(userCreated){
        res.status(200).json({
            msg:"user created"
        })}
        else{
            res.json({
                msg: "something went wrong"
            })
        }

        const min = 10;
        const max = 100000;
        const generatedBalance = Math.floor((Math.random() * (max - min)) + min )
        const generatedAccountNumber =   await generateUniqueAccountNumber();
        const upiId = `${user.username.toLowerCase()}@rakamx`;
        const qrCodeBase64 = await QRcode.toDataURL(generatedAccountNumber);


        const AccountDetails = await Account.create({
            userId: user._id,
            balance: generatedBalance,
            accountnumber: generatedAccountNumber,
            qrcode: qrCodeBase64,
            upiid: upiId


        })
        await AccountDetails.save();



    }
    catch(e){
        console.log("error",e.message)
        res.json({
            message: "Internal server error"
        })
    }
}

const signin = async (req,res) =>{

    try{
        
        const {email, password} = req.body;
        const normalizedEmail = email.toLowerCase();
        // console.log(normalizedEmail)

        
        const user = await User.findOne({email: normalizedEmail});
        if(!user){
            return res.status(404).json({
                message: " user not found"
            })
        }

        const checkPassword = await bcrypt.compare(password , user.password)

        if(!checkPassword) {
            return res.status(404).json({
                message: " Invalid password"
            })
        }

        const payload = {
            id: user._id,
            username: user.username

        }

        const key = process.env.JWT_SECRET;

        const token = jwt.sign(payload,key, { expiresIn: "1h" } );
        console.log(token)
 
        res.cookie('token',token,{
            httpOnly: true,
            secure:false,
            sameSite: 'Lax',
            maxAge: 3600000


        });
        console.log("cookie sent")


        res.status(200).json({
            message : "Login successful",
            
        })
        


    }catch(e){
        console.log("error:",e.message)
        res.status(500).json(
            {
                message: "internal server error"
            }
        )

    }
    
}

const updateuser =  async(req, res) =>{


    const userId = req.user.id;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set : updates
        },
        {
            new: true
        }
    )
    res.json({
        message:"user updated"
    })

}





const getTransactions = async (req, res) => {

    try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
        $or:[{sender: userId }, {receiver: userId}]
    })
    .sort({ createdAt: -1 }) 
    .populate("sender", "username email")
    .populate("receiver", "username email");

     res.status(200).json({
      message: "Transaction history fetched",
      data: transactions
    });
  } catch (e) {
    res.status(500).json({
      message: "Error fetching transactions",
      error: e.message
    });
  }
 
};







module.exports = {createUser, signin, updateuser , getTransactions};
