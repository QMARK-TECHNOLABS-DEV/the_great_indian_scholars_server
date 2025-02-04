const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
    userId: { type: String },
    subscription: { type: Object },
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = { Subscription }