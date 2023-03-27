const express =require('express')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { createClient } = require("redis")
const cookieParser = require("cookie-parser")


const client = createClient({
    url: process.env.redis
});
client.on('error', err => console.log('Redis Client Error', err));


const {User} = require("../models/user.model")
const userRouter = express.Router()

userRouter.get("/", async(req,res)=>{
    res.send({msg: "Users"})
})

userRouter.post("/login", async(req,res)=>{
    try{
        const {email, pass} = req.body;
        const user = await User.find({email})
        if (user.length>1){
            bcrypt.compare(pass, user[0].pass, async function(err, result) {
                // result == true
                if (result){
                    var token = jwt.sign({ userID: user[0]._id }, process.env.secretKey, {
                        expiresIn: 300
                    });
                    var refreshToken = jwt.sign({ userID: user[0]._id }, process.env.refreshSecret, {
                        expiresIn: 600
                    });
                    res.cookies("token", token)
                    res.cookies("refreshToken", refreshToken)
                    res.cookies("userID", user[0]._id)
                    await client.set(`${JSON.stringify('token')}`, `${JSON.stringify(token)}`, {EX: 300});
                    await client.set(`${JSON.stringify('refreshToken')}`, `${JSON.stringify(refreshToken)}`, {EX: 600});
                }
            });
        }
        else {
            res.send({msg: "No User Found, Please Register"})
        }
    } 
    catch(err){
        res.send({msg: "Error from Catch -> "+err})
    }
})

userRouter.post("/register", async(req,res)=>{
    try{
        const {email, name, pass} = req.body
        const user = await User.find({email})
        if (user.length==0){
            bcrypt.hash(pass, 4, async function(err, hash) {
                if (err){
                    res.send({msg: "Error While Hashing"})
                }
                else{
                    const adding = new User({email, pass:hash, name})
                    await adding.save()
                    res.send({msg: "reg Success"})
                }
            });
        }
        else{
            res.send({msg: "User Exist, Please Login"})
        }
    }
    catch(err){
        res.send({msg: "Catch Block -> "+err})
    }
})

// userRouter.get("/refreshToken", async(req,res)=>{
//     try{

//     } 
//     catch(err){

//     }
// })

userRouter.get("/logout", async(req,res)=>{
    const token = req.cookies.token
    const refreshToken = req.cookies.refreshToken
    await client.sadd(`blacklist`, `${token} ${refreshToken}`)
    res.send({msg: "Logout Success"})
})


module.exports = {
    userRouter
}