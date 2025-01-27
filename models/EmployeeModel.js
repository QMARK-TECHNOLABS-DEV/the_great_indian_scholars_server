const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    name: {type:String,required:true},
    email: {type:String,unique:true,required:true},
    phone:{type:String},
    password:{type:String,required:true},
    role: {type:String,
        default:"employee",
        required:true},
    education: {type:String},
    department: {type:String},
    birthDate: {type:Date},
    address: {type:{
        houseName:{type:String},
        city:{type:String},
        state:{type:String},
        pin:{type:String},
    }},
    image:{type:String},
    currentTasks: {type:Array, default:[]},
    isActive:{type:Boolean, default:true},
    leader:{type:mongoose.Types.ObjectId, ref:'Employee'},
    office:{type:mongoose.Types.ObjectId, ref: 'Office'},

},{timestamps:true})

const Employee = mongoose.model("Employee", EmployeeSchema);

module.exports = Employee;