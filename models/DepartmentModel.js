const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissions: [{
        type: String,
        enum: [
            'create_application', 'view_application', 'edit_application', 'delete_application',
            'create_student', 'view_student', 'edit_student', 'delete_student',
            'create_employee', 'view_employee', 'edit_employee', 'delete_employee',
            'create_project', 'view_project', 'edit_project', 'delete_project',
            'create_lead', 'view_lead', 'edit_lead', 'delete_lead',
            'create_followup', 'view_followup', 'edit_followup', 'delete_followup',
        ]
    }],

    icon: {
        type: {
            location: { type: String },
            key: { type: String },
            name: { type: String },
        }
    },

    isArchived: { type: Boolean, default: false }
})

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department 