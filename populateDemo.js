const { faker } = require('@faker-js/faker')
const bcrypt = require('bcryptjs')
const User = require('./models/user.js')
const ExpenseCategory = require('./models/expenseCategory.js')
const mongoose = require('mongoose');
const Expense = require('./models/expense.js')
const moment = require('moment')
require('dotenv').config();


// Retrieve MongoDB URI from environment variables
const mongodbURI = process.env.MONGODB_URI;

console.log(faker.company.name())

async function fetchCategoryIds() {
    try {
        await mongoose.connect(mongodbURI)
        const categories = await ExpenseCategory.find({}, '_id');
        return categories.map(category => category._id);
    } catch (error) {
        console.error('Error fetching category IDs:', error);
        return [];
    }
}


async function populateDatabase() {
    await mongoose.connect(mongodbURI)
    const categoryIds = await fetchCategoryIds()
    const email = "demo@kononwallet.com"
    const password = "demo123"
    const fullName = "John Cena"
    const currency = "6616ae21341d4ec19c8b0d65"
    

    const user = await User.findOne({ email })
    .then(existingUser => {
        // If no user with the given email exists, proceed to create a new user
        if (!existingUser) {
            // Hash the password
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    // Create and save the user
                    const newUser = new User({
                        email,
                        password: hashedPassword,
                        fullName,
                        currency
                    });
                    return newUser.save();
                })
                .then(user => {
                    console.log('User created successfully');
                    // Return the created user or do something else if needed
                    return user;
                })
                .catch(error => {
                    console.error('Error creating user:', error);
                    // Handle the error
                    throw error;
                });
        } else {
            // User with the given email already exists, handle the situation accordingly
            console.error('User with the given email already exists');
            // You can throw an error, return null, or take any other appropriate action
            return existingUser;
        }
    })
    .catch(error => {
        console.error('Error checking for existing user:', error);
        // Handle the error
        throw error;
    });
    try {
        await Expense.deleteMany({ userId: user._id });
        for (let i = 0; i < 100; i++) {
            const randomDate = faker.date.between({
                from:moment().subtract(6, 'months').toDate(),  // Start date (6 months ago)
                to:new Date()                                 // End date (today)
            });
            const expense = new Expense({
                userId: user._id,
                category: categoryIds[Math.floor(Math.random() * categoryIds.length)], 
                merchant: faker.company.name(),
                amount: (Math.random() * 100).toFixed(2), // Random amount
                longitude: -2 + Math.random() * 2.4,      // Random longitude between -2 and 0.4
                latitude: 51 + Math.random() * 1.5,      // Random latitude between -51 and 52.5
                createdAt: randomDate                     // Random date between today and 6 months ago
            });
            await expense.save(); // Save the document
        }
        console.log('Database populated successfully');
    } catch (error) {
        console.error('Error populating database:', error);
    } finally {
        mongoose.disconnect(); // Disconnect from MongoDB
    }
}

populateDatabase()