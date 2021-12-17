const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
    day: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    items: [
        {
            checkIn: {
                type: Date,
                required: false
            },
            checkOut: {
                type: Date,
                required: false
            },
            workplace: {
                type: String,
                required: true
            },
            timeOfSession: {
                type: Number,
                default: 0,
                required: true
            },
            overtime: {
                type: Number,
                default: 0,
                required: true
            },
            statusWork: {
                type: Boolean,
                default: false,
                required: true
            }
        }
    ],
    annualLeave: {
        type: Number,
        default: 0,
        required: false
    },
    staffId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    totalTimeOfDay: {
        type: Number,
        default: 0,
        required: true
    },
    statusWork: {
        type: Boolean,
        default: false,
        required: true
    }
});


module.exports = mongoose.model('Attendance', attendanceSchema);