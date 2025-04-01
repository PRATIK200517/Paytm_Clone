// backend/routes/user.js
const express = require('express');
const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
});

router.post("/signup", async (req, res) => {
    // Validate the request body using zod
    const result = signupBody.safeParse(req.body);
    if (!result.success) {
        return res.status(411).json({
            message: "Invalid input. Please check your details.",
            errors: result.error.errors
        });
    }

    const { username, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken"
        });
    }

    const user = await User.create({ username, password, firstName, lastName });
    const userId = user._id;

    // Create a new account for the user
    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    });

    const token = jwt.sign({ userId }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token
    });
});

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
});

router.post("/signin", async (req, res) => {
    // Validate the request body
    const result = signinBody.safeParse(req.body);
    if (!result.success) {
        return res.status(411).json({
            message: "Invalid input. Please check your details.",
            errors: result.error.errors
        });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (user) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        return res.json({ token });
    }

    res.status(411).json({
        message: "Error while logging in"
    });
});

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
    // Validate the request body
    const result = updateBody.safeParse(req.body);
    if (!result.success) {
        return res.status(411).json({
            message: "Error while updating information",
            errors: result.error.errors
        });
    }

    // Update user data, using _id as the filter
    await User.updateOne({ _id: req.userId }, { $set: req.body });

    res.json({
        message: "Updated successfully"
    });
});

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [
            { firstName: { "$regex": filter, "$options": "i" } },
            { lastName: { "$regex": filter, "$options": "i" } }
        ]
    });

    res.json({
        users: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
});

module.exports = router;
