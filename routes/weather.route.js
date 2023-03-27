const express = require("express")
require("dotenv").config()

const {Searches} = require("../models/search.model")
const {authentication} = require("../middlewares/authentication")
const {validation} = require("../middlewares/validation")

const { createClient } = require('redis');
const client = createClient({
    url: process.env.redis
});
client.on('error', err => console.log('Redis Client Error', err));

const weatherRoute = express.Router()

weatherRoute.post("/", authentication, validation, async(req,res)=>{
    try{
        const userID = req.cookies.userID;
        const search = await Searches.find({userID})
        search.city.push(req.body.city)
        await search.save();
        const data = await client.get(`${req.body.city}`)
        if (data){
            res.send({masg: data})
        }
        else {
            let data = 0;
            // let data = fetch(`weather Api ${req.body.city}`)
            // res.send({msg: data})
            await client.set(`${req.body.city}`, `${data}`, {EX:1800})
            res.send({msg: data})
        }
    }
    catch(err){
        res.send({msg: "Catch block -> "+ err})
    }
})


module.exports = {
    weatherRoute
}