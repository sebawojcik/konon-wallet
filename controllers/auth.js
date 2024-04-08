const user = require("../models/user")
const User = require("../models/user")
const bcrypt = require('bcryptjs')
exports.getLogin = (req, res, next) => {
    res.render('login', { errorMessage: req.flash('error') })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    User.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password.')
                return res.redirect('/auth/login')
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.loggedIn = true
                        req.session.user = user;
                        return req.session.save(err => {
                            console.error(err);
                            res.redirect('/')
                        })
                    }
                    res.redirect('/auth/login')
                })
                .catch(err => {
                    console.log(err)
                    res.redirect('/auth/login')
                })
        })
        .catch(err => console.error(err))
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/')
    })
}

exports.getRegister = (req, res, next) => {
    res.render('register', { errorMessage: req.flash('error') })
}

exports.postRegister = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    const fullName = req.body.fullName

    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match')
        return res.redirect('/auth/register')
    }

    User.findOne({ email })
        .then(userData => {
            if (userData) {
                req.flash('error', 'E-Mail already exists.')
                return res.redirect('/auth/register')
            }
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email,
                        password: hashedPassword,
                        fullName,
                        currency: "GBP"
                    })
                    return user.save()
                })
                .then(result => {
                    res.redirect('/auth/login')
                })
        })
        .catch(err => {
            console.error(err)
        })
}