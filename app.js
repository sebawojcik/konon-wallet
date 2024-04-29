const http = require('http');
const mongoose = require('mongoose')
const cors = require('cors');

require('dotenv').config();
const mongodbURI = process.env.MONGODB_URI;

const session = require('express-session')
const MongoDBStore = require("connect-mongodb-session")(session)



const express = require('express');
const bodyParser = require('body-parser');

const expensesRoutes = require('./routes/expenses')
const authRoutes = require('./routes/auth')
const expressHBS = require('express-handlebars')
const csrf = require('csurf')


const app = express();
const store = new MongoDBStore({
    uri: mongodbURI,
    collection: 'sessions'
})
const csrfProtection = csrf()
const flash = require('connect-flash')

app.engine('handlebars', expressHBS({
    defaultLayout: 'base',
    helpers: {
        json: function (context) {
            return JSON.stringify(context)
        }
    }
}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store }))
app.use(csrfProtection)
app.use(flash())

app.use(cors());


app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.loggedIn
    res.locals.csrfToken = req.csrfToken();
    next()
})

app.use('/expenses', expensesRoutes);
app.use('/auth', authRoutes)

app.get('/', (req, res, next) => {
    res.render('home', { user: req.session.user, successMessage: req.flash('success') })
});
// app.use((req, res, next) => {
//     // res.redirect('https://http.cat/images/404.jpg')
//     res.status(404).send('Page not found')
// })


const server = http.createServer(app);


mongoose.connect(mongodbURI)
    .then(result => {
        server.listen(process.env.PORT || 3000)
    }).catch(err => {
        console.error(err)
    })
