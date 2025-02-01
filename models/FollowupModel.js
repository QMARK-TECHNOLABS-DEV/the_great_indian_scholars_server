const mongoose = require("mongoose");

const FollowupSchema = new mongoose.Schema({
    leadId:{type:mongoose.Types.ObjectId, ref:'Lead', required:true},
    assignee:{type:mongoose.Types.ObjectId, ref:'Employee'},
    dueDate:{type:Date, required:true},
    dueTime:{type:String},
    note:{type:String},
    isCompleted:{type:Boolean, default:false},

},{timestamps:true})

const Followup = mongoose.model("Followup",FollowupSchema);

module.exports = Followup;