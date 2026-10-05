const mongoose = require("mongoose")

const connectionString = process.env.DBCONNECTIONSTRING

mongoose.connect(connectionString)
    .then((res) => {
        console.log("Database Connected Successfully")
    })
    .catch((error) => {
        console.log("Database Connection Failed")
        console.log(error)
    })