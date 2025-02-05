const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String },
    image: { type: String },
    role: { type: String, default: "admin", enum: ["super admin", "admin"], required: true },

    office: { type: mongoose.Types.ObjectId, ref: 'Office' },

}, { timestamps: true })

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;