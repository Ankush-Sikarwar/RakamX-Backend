const express = require("express");
const jwt = require("jsonwebtoken")
require('dotenv').config();


const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; 

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    
    next();
  } catch (error) {
    console.error("Jwt verification error:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
