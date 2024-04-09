const path = require('path')

const express = require('express');

const router = express.Router();

const expensesConroller = require('../controllers/expenses.js')
const isAuth = require('../middleware/isAuth')

router.get('/add-expense', isAuth, expensesConroller.getAddExpense);

router.post('/add-expense', isAuth, expensesConroller.postAddExpense);

router.get('/all-expenses', isAuth, expensesConroller.getAllExpenses);

router.get("/all-expenses/:id", isAuth, expensesConroller.getExpense)

router.get('/edit-expense/:id', isAuth, expensesConroller.getEditExpense)

router.post('/edit-expense/:id', isAuth, expensesConroller.postEditExpense)

router.get('/delete-expense/:id', isAuth, expensesConroller.getDeleteExpense)

router.post('/delete-expense/:id', isAuth, expensesConroller.postDeleteExpense)

module.exports = router;
