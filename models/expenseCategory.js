const mongoose = require('mongoose')

const Schema = mongoose.Schema

const expenseCategorySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('ExpenseCategory', expenseCategorySchema)