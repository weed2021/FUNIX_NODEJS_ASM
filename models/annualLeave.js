const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const annualLeaveSchema = new Schema({
    leaveDate: {
        type: Date,
        required: true

    },
    reason: {
        type: String,
        required: true,
    },
    hours: {
        type: Number,
        required: true
    },
    staffId: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('Leave',annualLeaveSchema)