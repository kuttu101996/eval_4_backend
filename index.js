const express = require("express")
require('dotenv').config()
const redis = require("redis")
const cors = require("cors")
const winston = require("winston")
const expressWinston = require("express-winston")
require('winston-mongodb');

app.use(expressWinston.logger({
    transports: [
      new winston.transports.MongoDB({
        db: process.env.mongoURL,
        level: "error"
      })
    ],
    format: winston.format.json(),
    meta: true, 
    expressFormat: true,
    colorize: false,  
    ignoreRoute: function (req, res) { return false; } 
  }));


const { createClient } = require('redis');
const client = createClient({
    url: process.env.redis
});
client.on('error', err => console.log('Redis Client Error', err));


const {connection} = require("./config/db")
const {userRouter} = require("./routes/user.route")
const {weatherRoute} = require("./routes/weather.route")
const { level } = require("winston")

const app = express()
app.use(express.json())
app.use(cors())
app.use("/user", userRouter)
app.use("/weather", weatherRoute)


app.get("/", (req,res)=>{
    res.send({msg: "Welcome to Weather Application"})
})


app.listen(process.env.port, async()=>{
    try{
        await connection;
        await client.connect();
        console.log("connected to DB")
    }catch(err){
        console.log(err)
    }
    console.log("server at 9999")
})