const getDatabase = require('../database/database')

const { ObjectId } = require('mongodb')
const Expense = require("../models/expense")
const expense = require('../models/expense')

exports.getAddExpense = (req, res, next) => {
    res.render('add-expense', { isEditing: false })
}

exports.getEditExpense = async (req, res, next) => {
    const id = req.params.id
    Expense.findById(id).lean()
        .then(expense => {
            res.render('add-expense', { expense, isEditing: true })
        }).catch(err => {
            console.error(err)
        })
}

exports.postAddExpense = async (req, res, next) => {
    const expense = new Expense({
        merchant: req.body.merchant,
        amount: req.body.amount,
        currency: "£"
    })
    expense.save().then(result => {
        console.log("Created Product")
        res.redirect('/expenses/all-expenses')
    }).catch(err => {
        console.error(err)
    })
}

exports.postEditExpense = async (req, res, next) => {
    const id = req.params.id
    Expense.updateOne({ _id: id }, req.body)
        .then(expense => {
            res.redirect('/expenses/all-expenses')
        }).catch(err => {
            console.error(err)
        })


}

exports.getExpense = async (req, res, next) => {
    const id = req.params.id

    Expense.findById(id).lean()
        .then(expense => {
            res.render('details-expense', { expense })
        }).catch(err => {
            console.error(err)
        })
}

exports.getAllExpenses = async (req, res, next) => {
    // const db = await getDatabase()
    // const collection = db.collection("expenses")
    // const allRecords = await collection.find({}).toArray()
    Expense.find().lean()
        .then(expenses => {
            res.render('list-expenses', { expenses, hasExpenses: expenses.length > 0 })
        }).catch(err => {
            console.error(err)
        })
}

exports.getDeleteExpense = (req, res, next) => {
    const id = req.params.id
    res.render('delete-expense', { id })
}

exports.postDeleteExpense = async (req, res, next) => {
    const id = req.params.id
    Expense.findByIdAndDelete(id)
        .then(() => {
            res.json({})
        }).catch((err) => {
            console.error(err)
        })
}