const expenses = [];

exports.getAddExpense = (req, res, next) => {
    // res.sendFile(path.join(__dirname, '../', 'views', 'add-expense'))
    res.render('add-expense', { isEditing: false })
}

exports.getEditExpense = (req, res, next) => {
    const id = req.params.id
    const expense = expenses.find((e) => e.id == id)
    res.render('add-expense', { expense, isEditing: true })
}

exports.postAddExpense = (req, res, next) => {
    const currentDate = new Date();
    var formattedDateTime = currentDate.toLocaleString();
    expenses.push({
        merchant: req.body.merchant,
        amount: req.body.amount,
        currency: "£",
        date: formattedDateTime,
        id: expenses.length + 1
    })
    res.redirect('/expenses/all-expenses')
}

exports.postEditExpense = (req, res, next) => {
    const id = req.params.id
    const index = expenses.findIndex(e => e.id == id)
    expenses[index] = { ...expenses[index], ...req.body }
    res.redirect('/expenses/all-expenses')
}

exports.getExpense = (req, res, next) => {
    const id = req.params.id
    const expense = expenses.find((e) => e.id == id)
    res.render('details-expense', { expense })
}

exports.getAllExpenses = (req, res, next) => {
    res.render('list-expenses', { expenses, hasExpenses: expenses.length > 0 })
}