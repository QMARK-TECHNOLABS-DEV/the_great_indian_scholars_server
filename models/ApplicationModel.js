const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
    studentId:{type:mongoose.Types.ObjectId,required:true},
    intakes:{type:Array, default:[]},
    country:{type:String,required:true},
    creator:{type:mongoose.Types.ObjectId},
    steppers:{type:[{type:mongoose.Types.ObjectId, ref:'Stepper'}], default:[]},
    documents:{type:[
                        {
                            name:{type:String},
                            key:{type:String},
                            location:{type:String}
                        }
                    ],
         default:[]},
    statuses:{type:Array,default:[]},
    assignees:{type:[{type:mongoose.Types.ObjectId, ref:'Employee'}], default:[]},

    phase:{type:String, default: "pending"},
 
    office:{type:mongoose.Types.ObjectId, ref: 'Office', required:true},

},{timestamps:true});


const Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;