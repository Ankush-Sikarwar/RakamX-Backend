const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const {showBalance,transfer, transactions,transferupi} = require("../controller/accountController")

router.get('/balance', authMiddleware, showBalance)

router.post('/transfer', authMiddleware, transfer)
router.post('/transferupi', authMiddleware, transferupi)

router.get('/transactions',authMiddleware, transactions)


module.exports = router;