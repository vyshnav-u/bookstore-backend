const bcrypt = require("bcrypt");
const users = require("../models/userModel");
const jwt = require("jsonwebtoken")


exports.loginController = async(req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        return res.status(400).json({
            message:"fill the email and password",

        })
    }
    const existingUser = await users.findOne({email})

    if(!existingUser){
        return res.status(404).json({message:"user not found"
        })
    }
    
    const isPasswordMatch  = await bcrypt.compare(password,existingUser.password)

    if(!isPasswordMatch){
        return res.status(401).json({message:"your password is not correct"})
    }
    const payload = {
        userId:existingUser._id.toString(),
        email:existingUser.email,
        role:existingUser.role || "user"
    }

    const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"1h"})

    return res.status(200).json({
        message:"login successful",
        token,
        user:{
            id:existingUser._id.toString(),
            email:existingUser.email,
            role:existingUser.role || "user"
        }
        
    })

    


}