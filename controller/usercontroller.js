
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../models/userModel");

// Register
exports.registerController = async (req, res) => {
    console.log("Inside registerController");

    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

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
        console.log("Registration error:", error.message);

        return res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};


// Login
exports.loginController = async (req, res) => {
    console.log("Inside loginController");

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

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

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing");
        }

        const token = jwt.sign(
            {
                userId: existingUser._id.toString(),
                email: existingUser.email,
                role: existingUser.role || "user"
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role || "user"
            }
        });
    } catch (error) {
        console.log("Login error:", error.message);

        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};


// User Edit
exports.userEditController = async (req, res) => {
    console.log("Inside userEditController");

    try {
        const { id } = req.params;
        const loginUserId = req.payload?.userId;

        if (!loginUserId || loginUserId !== id) {
            return res.status(403).json({
                message: "You are not authorized to update this profile"
            });
        }

        const { username, password, bio } = req.body;
        const updateData = {};

        if (username !== undefined) updateData.username = username;
        if (bio !== undefined) updateData.bio = bio;

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (req.file) {
            updateData.picture = req.file.filename;
        }

        // Do not allow profile updates to change email or role
        const updatedUser = await users.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.log("User update error:", error.message);

        return res.status(500).json({
            message: "User update failed",
            error: error.message
        });
    }
};


// Google Login
exports.googleLoginController = async (req, res) => {
    console.log("Inside googleLoginController");

    try {
        const { email, password, picture, username } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        let existingUser = await users.findOne({ email });

        if (!existingUser) {
            if (!password || !username) {
                return res.status(400).json({
                    message: "Required user details are missing"
                });
            }

            const encryptPassword = await bcrypt.hash(password, 10);

            existingUser = await users.create({
                username,
                email,
                password: encryptPassword,
                picture,
                role: "user"
            });
        }

        const token = jwt.sign(
            {
                userId: existingUser._id.toString(),
                email: existingUser.email,
                role: existingUser.role || "user"
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role || "user"
            }
        });
    } catch (error) {
        console.log("Google login error:", error.message);

        return res.status(500).json({
            message: "Google login failed",
            error: error.message
        });
    }
};


// Get all users - admins only
exports.getAllUsersController = async (req, res) => {
    console.log("Inside getAllUsersController");

    try {
        if (req.payload?.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        const allUsers = await users.find({
            email: { $ne: req.payload.email }
        }).select("-password");

        return res.status(200).json(allUsers);
    } catch (error) {
        console.log("Get all users error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

