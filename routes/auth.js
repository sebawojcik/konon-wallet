const express = require('express')
const { check, body } = require("express-validator")
const router = express.Router();
const User = require('../models/user')
const authController = require('../controllers/auth')

router.get('/login', authController.getLogin)

router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter valid email.')
            .normalizeEmail(),
        body('password', 'Password has to be valid.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin
)

router.post('/logout', authController.postLogout)

router.get('/register', authController.getRegister)

router.post('/register',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(userData => {
                        if (userData) {
                            return Promise.reject('This email already exsists.')
                        }
                    })
            })
            .normalizeEmail(),

        body('password', 'Please enter a password with text and numbers only and at least 6 characters')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim(),
        body('fullName')
            .trim()
            .notEmpty().withMessage('Please enter Name')
            // .isAlpha().withMessage('Please enter valid name with alphabetic characters')
            .custom(value => {
                const trimmedValue = value.replace(/ /g, '');
                console.log("aa", trimmedValue)
                if (!/^[a-zA-Z]+$/.test(trimmedValue)) {
                    throw new Error('Value must contain only alphabetic characters');
                }
                return true;
            }),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match')
                } return true
            })
    ],
    authController.postRegister
)

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset)

router.get('/reset/:token', authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)


module.exports = router