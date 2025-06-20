const express = require("express");
const app = express();
app.use(express.json());
require('dotenv').config();
const connectDB = require("./db/db");
connectDB();
const cors = require("cors")
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));

const PORT = process.env.PORT || 3000;

const router = express.Router();
const { User } = require("./models/UserSchema");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const userRouter = require("./routes/userRouter");
const accountRouter = require("./routes/AccountRouter");
const contactRouter  = require("./routes/contactUs");
const authRouter = require("./routes/authRouter")
const authMiddleware = require("./middleware/authMiddleware");



app.use('/user',userRouter)
app.use('/accounts', accountRouter)
app.use('/contact', contactRouter)
app.use('/verify', authRouter);




app.listen(PORT, () => console.log("server is running"));
