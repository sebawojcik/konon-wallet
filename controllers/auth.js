const User = require("../models/user")
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
require('dotenv').config();
const { validationResult } = require('express-validator')
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const expenseCurrency = require("../models/currency")


const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
    },
});


exports.getLogin = (req, res, next) => {
    res.render('login', { errorMessage: req.flash('error'), oldInput: { email: '', password: '' } })
}



exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    User.findOne({ email })
        .then(user => {
            if (!user) {
                // req.flash('error', 'Invalid email or password.')
                return res.status(422).render('login',
                    {
                        oldInput: { email, password },
                        errorMessage: 'Invalid email or password.',
                    },
                )
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
                    return res.status(422).render('login',
                        {
                            oldInput: { email, password },
                            errorMessage: 'Invalid email or password.',
                        },
                    )
                })
                .catch(err => {
                    console.error(err)
                    res.redirect('/auth/login')
                })
        })
        .catch(err => console.error(err))
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/')
    })
}

exports.getRegister = (req, res, next) => {
    expenseCurrency.find().lean()
        .then(currencies => {
            console.log(req.flash('error'))
            res.render('register', { isEditing: false, currencies, oldInput: { email: '', fullName: '', password: '', confirmPassword: '' } })
        }).catch(err => {
            console.error(err)
        })
}

exports.postRegister = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    const fullName = req.body.fullName
    const currency = req.body.currency
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return expenseCurrency.find().lean()
            .then(currencies => {
                return res.status(422).render('register', {
                    isEditing: false,
                    currencies,
                    errorMessage: errors.array()[0].msg,
                    oldInput: { email, fullName, password, confirmPassword }
                })
            }).catch(err => {
                console.error(err)
            })
    }
    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match')
        return res.redirect('/auth/register')
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
                fullName,
                currency
            })
            return user.save()
        })
        .then(result => {
            const mailOptions = {
                from: "kononwallet.donotreply@gmail.com",
                to: email,
                subject: "Hello " + fullName + "!",
                html: "<h1>Welcome to Konon Wallet!</h1>",
            };
            transporter.sendMail(mailOptions);
            res.redirect('/auth/login')
        })
        .catch(err => {
            console.error(err)
        })
}

exports.getReset = (req, res, next) => {
    res.render('resetPassword', { errorMessage: req.flash('error') })
}


exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.error(err)
            return res.redirect('/auth/reset')
        }
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found.')
                    return res.redirect('/auth/reset')
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000
                return user.save()
            })
            .then(result => {
                req.flash('success', 'Email sent successfully')
                res.redirect('/')
                const mailOptions = {
                    from: "kononwallet.donotreply@gmail.com",
                    to: req.body.email,
                    subject: "Password reset request.",
                    html: `
                    <p>You requested a password reset</p>
                    <p><a href="http://${req.headers.host}/auth/reset/${token}">Click this link to set a new password.</a></p>
                    `,
                };
                transporter.sendMail(mailOptions);
            })
            .catch(err => {
                console.error(err)
            })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(userData => {
            if (!userData) {
                return res.redirect('/')
            }
            return res.render('newPassword', { userId: userData._id.toString(), token, errorMessage: req.flash('error') })
        })
        .catch(err => {
            console.error(err)
        })

}


exports.postNewPassword = (req, res, next) => {
    const userId = req.body.userId
    const token = req.body.token
    const password = req.body.password
    User.findOne({ _id: userId, resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(userData => {
            if (!userData) {
                return res.redirect('/')
            }
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    userData.password = hashedPassword
                    userData.resetToken = undefined
                    userData.resetTokenExpiration = undefined
                    return userData.save()
                })
                .then(result => {
                    req.flash('success', 'Your new password was set successfully')
                    res.redirect('/')
                })
        })
        .catch(err => {
            console.error(err)
        })
}