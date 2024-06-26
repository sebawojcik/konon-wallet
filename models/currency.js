const mongoose = require('mongoose')

const Schema = mongoose.Schema

const currencySchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
    },


}, { timestamps: true });

module.exports = mongoose.model('Currency', currencySchema)