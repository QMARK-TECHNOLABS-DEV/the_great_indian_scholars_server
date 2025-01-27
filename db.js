const mongoose = require("mongoose");

const ConnectDB = async()=>{
    try {
        await mongoose.connect(process.env.MongoURI);
        console.log("Connected to Mongodb")
    } catch (error) {
        console.log(error)
    }
}

module.exports = ConnectDB;