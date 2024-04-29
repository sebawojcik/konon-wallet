const mongoose = require('mongoose')

const Schema = mongoose.Schema

const expenseSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExpenseCategory",
        required: true,

    },
    merchant: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema)