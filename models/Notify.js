const mongoose = require("mongoose")

const notifySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    notificationType: { type: String },
    title: { type: String },
    body: { type: String },
    isRead: { type: Boolean, default: false },
    route: { type: String },

}, { timestamps: true });


const Notify = mongoose.model('Notify', notifySchema);

module.exports = Notify;