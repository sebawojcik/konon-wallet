const Expense = require("../models/expense")
const expenseCategory = require("../models/expenseCategory")
const queries = require('../queries')
const Currency = require('../models/currency')
const { validationResult } = require('express-validator')
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const { Readable } = require('stream');


exports.getAddExpense = (req, res, next) => {
    expenseCategory.find().lean()
        .then(expenseCategories => {
            res.render('add-expense', { isEditing: false, expenseCategories, isEditing: false, fillValues: false, errorMessage: null })
        }).catch(err => {
            console.error(err)
        })
}

exports.getEditExpense = async (req, res, next) => {
    const id = req.params.id
    Expense.findById(id).lean()
        .then(expense => {
            expenseCategory.find().lean()
                .then(expenseCategories => {
                    res.render('add-expense', { expense, isEditing: true, expenseCategories, fillValues: true, errorMessage: null })
                }).catch(err => {
                    console.error(err)
                })
        })
}

exports.postAddExpense = async (req, res, next) => {
    console.log(req.body)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
        return expenseCategory.find().lean()
            .then(expenseCategories => {
                return res.status(422).render('add-expense',
                    {
                        isEditing: false,
                        fillValues: true,
                        expenseCategories,
                        expense: {
                            merchant: req.body.merchant,
                            amount: req.body.amount,
                            category: req.body.category
                        },
                        errorMessage: `${errors.array()[0].path}: ${errors.array()[0].msg}`
                    })
            }).catch(err => {
                console.error(err)
            })

    }

    const expense = new Expense({
        userId: req.session.user._id,
        merchant: req.body.merchant,
        amount: req.body.amount,
        category: req.body.category,
        latitude: req.body.latitude,
        longitude: req.body.longitude
    })
    expense.save().then(result => {
        res.redirect('/expenses/all-expenses')
    }).catch(err => {
        console.error(err)
    })

}

exports.postEditExpense = async (req, res, next) => {
    const id = req.params.id
    const merchant = req.body.merchant
    const amount = req.body.amount
    const category = req.body.category
    const longitude = req.body.longitude
    const latitude = req.body.latitude
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return expenseCategory.find().lean()
            .then(expenseCategories => {
                return res.status(422).render('add-expense',
                    {
                        isEditing: true,
                        fillValues: true,
                        expenseCategories,
                        expense: {
                            _id: id,
                            merchant,
                            amount,
                            category
                        },
                        errorMessage: `${errors.array()[0].path}: ${errors.array()[0].msg}`
                    })
            }).catch(err => {
                console.error(err)
            })

    }

    Expense.findById(id)
        .then(expense => {
            if (expense.userId.toString() !== req.session.user._id.toString()) {
                return res.redirect('/')
            }
            expense.merchant = merchant
            expense.amount = amount
            expense.category = category
            expense.longitude = longitude
            expense.latitude = latitude
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
    Expense.find({ userId: req.session.user._id }).populate('category', 'name').populate({
        path: 'userId', populate: {
            path: 'currency',
            model: 'Currency'
        }
    }).lean()
        .then(expenses => {
            res.render('list-expenses', {
                expenses,
                hasExpenses: expenses.length > 0
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
    Expense.deleteOne({ _id: id, userId: req.session.user._id })
        .then(() => {
            res.redirect('/expenses/all-expenses')
        }).catch((err) => {
            console.error(err)
        })

}

exports.getDashboard = async (req, res, next) => {
    Currency.findById(req.session.user.currency).lean()
        .then(async currency => {
            await Expense.find({ userId: req.session.user._id }).lean()
                .then(async expenses => {
                    const { categoryNames, sums, solidColors, opacityColors } = await queries.getCategorySums(req.session.user._id)
                    const { labels, data } = await queries.getMonthlyExpenses(req.session.user._id)
                    console.log(labels, data)
                    res.render('dashboard', {
                        currency,
                        expenses,
                        categoriesChart: {
                            categoryNames,
                            sums,
                            solidColors,
                            opacityColors,
                        },
                        datesChart: {
                            labels,
                            data
                        }
                    })
                }).catch(err => {
                    console.error(err)
                })
        })

}

exports.getDownloadExpensesCsv = async (req, res, next) => {
    try {
        const records = await Expense.find().lean();


        const readableStream = new Readable({
            read() {
                this.push(Object.keys(records[0]).join(',') + '\n');
                records.forEach(record => {
                    this.push(Object.values(record).join(',') + '\n');
                });
                this.push(null); 
            }
        });

        res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
        res.setHeader('Content-Type', 'text/csv');

        readableStream.pipe(res);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).send('Internal Server Error');
    }
}