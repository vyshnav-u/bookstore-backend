// import all packages
const express = require("express")
const cors = require("cors")
// loads .env file contents into process.env by defualt
require('dotenv').config()
const routes = require("./routes/allRoutes")

require("./config/db")

// create server

const server = express()

// enable cors in server

server.use(cors())
// parse Json to js content
server.use(express.json())

// use routes

server.use(routes)

// port

const PORT = process.env.PORT



// start server

server.listen(PORT,()=>{
    console.log("Server started");
    
})

// resolve api in server

server.get('/',(req,res)=>{
    res.status(200).send('<h1>The server is now started</h1>')
})

// testing postman

server.post("/",(req,res)=>{
    res.status(200).send("Post request")
})