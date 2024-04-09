
const Expense = require("../models/expense")

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
        userId: req.session.user._id,
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
    const merchant = req.body.merchant
    const amount = req.body.amount
    Expense.findById(id)
        .then(expense => {
            if (expense.id.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            expense.merchant = merchant
            expense.amount = amount
            return expense.save().then(result => {
                res.redirect('/expenses/all-expenses')
            })
        })
        .catch(err => {
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
    console.log(req.session.user)

    Expense.find({ userId: req.session.user._id }).lean()
        .then(expenses => {
            res.render('list-expenses', {
                expenses,
                hasExpenses: expenses.length > 0,
            })
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
    Expense.deleteOne({ _id: id, userId: req.user._id })
        .then(() => {
            res.redirect('/expenses/all-expenses')
        }).catch((err) => {
            console.error(err)
        })
}