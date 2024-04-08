const mongoose = require('mongoose')

const Schema = mongoose.Schema

const expenseSchema = new Schema({
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //     required: true,
    // },
    // paymentMethodId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "PaymentMethod",
    //     required: true,
    // },
    // categoryId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Category",
    //     required: true,

    // },
    merchant: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema)