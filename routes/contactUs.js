const express = require('express');
const nodemailer = require("nodemailer");
const cors = require('cors');
const app = express();
const router = express.Router();
app.use(cors());
app.use(express.json());
require('dotenv').config();



router.post("/send-message",async(req,res) =>{

    const { name, email, phone, subject, message } = req.body;

    let transporter = nodemailer.createTransport({ 
        service: "gmail", 
        auth: {
            user: process.env.GMAIL_ADDRESS,
            pass: process.env.GMAIL_PASSWORD  
        },
    });

     let mailOptions = {
        from: email,
        to: process.env.GMAIL_ADDRESS,
        subject: `Contact form submission from ${name} - ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage:\n${message}`
    };

     try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send email.", error });
    }



});



module.exports = router;