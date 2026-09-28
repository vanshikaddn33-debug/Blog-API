const jwt = require("jsonwebtoken");

const express = require("express");

const bcrypt = require("bcryptjs");
const User = require("../models/user");
const authMiddleware = require("../middleware/authmiddleware.js");

const router = express.Router();

router.post("/register", async(req, res) => {
    try {

        const {username, email, password} = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }


        //we have only checked if email exists now we check if it is in a correct format.
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                message: "Please enter a valid email"
            });
        }


        //similarly for password
        if(password.length<6){
            return res.status(400).json({
                message: "Password must be of minimum 6 characters long"
            });
        }


        const existingUser = await User.findOne({email});

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        // now we have to save this created user
        await newUser.save();

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }
});


router.post("/login", async (req, res) => {

    try {

        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

         const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );

        res.status(200).json({
            message: "Login successful",
            token: token
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

router.get("/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You accessed a protected route!",
        userId: req.user.userId
    });
});

module.exports = router;