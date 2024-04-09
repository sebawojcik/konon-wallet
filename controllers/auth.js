const User = require("../models/user")
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
require('dotenv').config();
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

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
                    const mailOptions = {
                        from: "kononwallet.donotreply@gmail.com",
                        to: email,
                        subject: "Hello " + fullName + "!",
                        html: "<h1>Welcome to Konon Wallet!</h1>",
                    };
                    transporter.sendMail(mailOptions);
                    res.redirect('/auth/login')
                })
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