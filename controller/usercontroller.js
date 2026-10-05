
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../models/userModel");

// Register
exports.registerController = async (req, res) => {
    console.log("inside register controller");

    try {
        const { username, email, password } = req.body;

        const existingUser = await users.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists. Please login"
            });
        }

        const encryptPassword = await bcrypt.hash(password, 10);

        const newUser = await users.create({
            username,
            email,
            password: encryptPassword,
            role: "user"
        });

        return res.status(201).json({
            message: "Registration successful",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};


// Login
exports.loginController = async (req, res) => {
    console.log("inside login controller");

    try {
        const { email, password } = req.body;

        const existingUser = await users.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found. Please register"
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }

        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                role: existingUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

