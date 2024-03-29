const http = require('http');

const express = require('express');
const bodyParser = require('body-parser');

const expensesRoutes = require('./routes/expenses')
const expressHBS = require('express-handlebars')

const app = express();

app.engine('handlebars', expressHBS({ defaultLayout: 'base' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/expenses', expensesRoutes);

app.get('/', (req, res, next) => {
    res.render('home')
});
app.use((req, res, next) => {
    // res.redirect('https://http.cat/images/404.jpg')
    res.status(404).send('Page not found')
})


const server = http.createServer(app);

server.listen(3000)