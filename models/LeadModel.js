const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
    name:{type: String},
    email:{type: String},
    phone:{type: String},
    country:{type: String},
    leadSource:{type: String},
    assignee:{type: mongoose.Types.ObjectId, ref:'Employee'},
    assignedDate:{type: Date},
    status:{type: String, default: "Untouched"},
    statusUpdatedAt:{type: Date, default: Date.now()},

},{timestamps: true})

const Lead = mongoose.model("Lead", LeadSchema)

module.exports = Lead;