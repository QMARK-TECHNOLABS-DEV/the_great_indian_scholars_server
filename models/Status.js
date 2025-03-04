const { Schema, model } = require("mongoose");

const statusSchema = new Schema({
    name: { type: String },
    list: [
        {
            label: { type: String },
            color: { type: String },
        }
    ]
})

const Status = model('Status', statusSchema)

module.exports = { Status }