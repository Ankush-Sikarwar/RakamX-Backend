const express = require('express');
const router = express.Router();



const authMiddleware = require("../middleware/authMiddleware")



router.get("/authentication", (req, res) => {
  const token = req.cookies?.token; 

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ user });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});




module.exports = router;