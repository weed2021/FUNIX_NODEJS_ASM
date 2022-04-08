const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const staffSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required:true
    },
    isManager: {
        type: Boolean,
        default: false,
        required:true
    },
    managerId: {
        type: mongoose.Types.ObjectId,
        required:false
    },
    password: {
        type: String,
        required:true
    },
    doB: {
        type: Date,
        required: true
    }
    ,
    salaryScale: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    annualLeave: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Staff', staffSchema);