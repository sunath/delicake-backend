// Configure the environment
require("dotenv").config()

//Import major libraries
const express = require("express");
const mongoose = require("mongoose")
const bodyParser = require("body-parser")


// Connect to the mongodb database
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MongodbConnection)
        console.log("Successfully connected")
    }catch(ex){
        console.log("error")
    }
    
}
connectDB()

//Initialize the server
const app = express()

//Import the routes
const userRoutes = require("./routers/user.router")

//MiddleWares
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))

//add the routings
app.use('/user',userRoutes)


// Choose a port to run the server
const port = process.env.PORT || 5000;

//Finally run the server
app.listen( port,() => {
    console.log(`App is running on port ${port}`)
})