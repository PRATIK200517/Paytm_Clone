const express = require('express');
const { authMiddleware } = require('../middleware');
const { Account } = require('../db');
const mongoose = require('mongoose');

const router = express.Router();

// Helper function to validate MongoDB ID
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.userId });
        
        if (!account) {
            return res.status(404).json({
                message: "Account not found",
                success: false
            });
        }

        res.json({
            balance: account.balance,
            success: true
        });
    } catch (error) {
        console.error("Balance check error:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
});

router.post("/transfer", authMiddleware, async (req, res) => {
    try {
        const { to, amount } = req.body;

        if (!mongoose.Types.ObjectId.isValid(to)) {
            return res.status(400).json({
                success: false,
                message: "Invalid recipient ID format"
            });
        }

        const transferAmount = parseFloat(amount);
        if (isNaN(transferAmount)) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a number"
            });
        }

        if (transferAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero"
            });
        }

        // Prevent self-transfer
        if (req.userId.toString() === to.toString()) {
            return res.status(400).json({
                success: false,
                message: "Cannot transfer to yourself"
            });
        }

        // Find both accounts
        const [senderAccount, recipientAccount] = await Promise.all([
            Account.findOne({ userId: req.userId }),
            Account.findOne({ userId: to })
        ]);

        // Check if accounts exist
        if (!senderAccount) {
            return res.status(404).json({
                success: false,
                message: "Sender account not found"
            });
        }

        if (!recipientAccount) {
            return res.status(404).json({
                success: false,
                message: "Recipient account not found"
            });
        }

        // Check sufficient balance
        if (senderAccount.balance < transferAmount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance",
                currentBalance: senderAccount.balance
            });
        }

        // Perform the transfer
        senderAccount.balance -= transferAmount;
        recipientAccount.balance += transferAmount;

        // Save both accounts
        await Promise.all([
            senderAccount.save(),
            recipientAccount.save()
        ]);

        // Return success response
        res.json({
            success: true,
            message: "Transfer successful",
            amount: transferAmount,
            newBalance: senderAccount.balance
        });

    } catch (error) {
        console.error("Transfer error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during transfer",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;