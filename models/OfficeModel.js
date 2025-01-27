const mongoose = require('mongoose');

const OfficeSchema = new mongoose.Schema({
    name:{type: String, required: true, unique: true}
})

const Office = mongoose.model('Office', OfficeSchema);

module.exports = Office;