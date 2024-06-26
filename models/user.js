const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    currency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Currency",
        required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema)