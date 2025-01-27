const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
    name:{type:String, required:true, trim: true},
    list:{type:[{type:String, trim:true}], default:[]},
    
},{timestamps:true})

const Data = mongoose.model("Data", DataSchema);

module.exports = Data;