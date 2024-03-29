const path = require('path')

const express = require('express');

const router = express.Router();

const expensesConroller = require('../controllers/expenses.js')

router.get('/add-expense', expensesConroller.getAddExpense);

router.post('/add-expense', expensesConroller.postAddExpense);

router.get('/all-expenses', expensesConroller.getAllExpenses);

router.get("/all-expenses/:id", expensesConroller.getExpense)

router.get('/edit-expense/:id', expensesConroller.getEditExpense)

router.post('/edit-expense/:id', expensesConroller.postEditExpense)

module.exports = router;
