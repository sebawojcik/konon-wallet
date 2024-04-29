const path = require('path')

const express = require('express');

const router = express.Router();
const { body } = require('express-validator')

const expensesConroller = require('../controllers/expenses.js')
const isAuth = require('../middleware/isAuth')

router.get('/add-expense', isAuth, expensesConroller.getAddExpense);

router.post('/add-expense', [
    body('merchant')
        .isString()
        .trim()
        .isLength({ min: 2, max: 50 }),
    body('amount')
        .trim()
        .isFloat(),
], isAuth, expensesConroller.postAddExpense);

router.get('/all-expenses', isAuth, expensesConroller.getAllExpenses);

router.get("/all-expenses/:id", isAuth, expensesConroller.getExpense)

router.get('/edit-expense/:id', isAuth, expensesConroller.getEditExpense)

router.post('/edit-expense/:id',
    [
        body('merchant')
            .isString()
            .trim()
            .isLength({ min: 2, max: 50 }),
        body('amount')
            .trim()
            .isFloat()

    ], isAuth, expensesConroller.postEditExpense)

router.get('/delete-expense/:id', isAuth, expensesConroller.getDeleteExpense)

router.post('/delete-expense/:id', isAuth, expensesConroller.postDeleteExpense)

router.get('/dashboard', isAuth, expensesConroller.getDashboard)


router.get('/download-expenses-csv', isAuth, expensesConroller.getDownloadExpensesCsv)

module.exports = router;