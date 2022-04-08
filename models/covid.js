const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

const covidSchema = new Schema({
    staffId: {
        type: Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    bodyTemporature: {
        celsius: {
            type: Number,
            required: false
        },
        dateRegister: {
            type: Date,
            default: null,
            required: false
        }
    },
    vaccine: {
        first: {
            type: {
                type: String,
                default: "None info",
                require: false
            },
            dateInjection1:{
                type: Date,
                default: null,
                require: false
            }
        },
        second: {
            type: {
                type: String,
                default: "None info",
                require: false
            },
            dateInjection2:{
                type: Date,
                // default: null,
                require: false
            }
        }

    },
    infection:{
        type: Number,
        default: 0,
        require: true
    }
})

module.exports = mongoose.model('Covid', covidSchema);