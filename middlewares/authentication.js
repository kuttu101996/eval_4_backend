const jwt = require("jsonwebtoken")
require("dotenv").config();


const { createClient } = require('redis');
const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));


const authentication = async(req,res,next)=>{
    try{
        const data = req.body;
        const token = await client.get('token')
        if (token){
            const checkBlacklist = await client.SISMEMBER("blacklist", `${token}`)
            if (checkBlacklist){
                res.send({msg: "You have Logged out Please Login"})
            }
            else {
                jwt.verify(token, process.env.secretKey, function(err, decoded) {
                    if (err){
                        res.send({msg: "Unable to Verify -> "+err})
                    }
                    else {
                        next()
                    }
                });
            }
        }
        else {
            res.send({msg: "No Token Please Login"})
        }
    } 
    catch(err){
        res.send({msg: "Catch block -> "+err})
    }
}

module.exports = {
    authentication
}