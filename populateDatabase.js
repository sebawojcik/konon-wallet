const axios = require('axios');
const Currency = require("./models/currency");
const ExpenseCategory = require("./models/expenseCategory");
const mongoose = require('mongoose');
require('dotenv').config();


// Retrieve MongoDB URI from environment variables
const mongodbURI = process.env.MONGODB_URI;

// Function to fetch currencies data from API
const getCurrencies = async () => {
    try {
        // Fetch data from API
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const countries = response.data;

        // Extract unique currencies
        const currencies = {};
        countries.forEach(country => {
            if (country.currencies) {
                Object.entries(country.currencies).forEach(([code, obj]) => {
                    if (!(code in currencies)) {
                        currencies[code] = obj;
                    }
                });
            }
        });

        // Convert currencies object to array and sort by name
        const currenciesArray = Object.entries(currencies).map(([code, obj]) => ({ ...obj, code }));
        currenciesArray.sort((a, b) => a.name.localeCompare(b.name));

        return currenciesArray;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error for higher level handling
    }
};

// Function to populate currencies data in MongoDB
async function populateCurrencies() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongodbURI);

        // Fetch currencies data
        const currenciesData = await getCurrencies();

        // Loop through currencies data and upsert into MongoDB
        for (const currencyData of currenciesData) {
            await Currency.findOneAndUpdate(
                { code: currencyData.code }, // Find currency by code
                currencyData, // Data to update or insert
                { upsert: true } // Upsert option: insert if not found, update if found
            );
            console.log(`Currency (${currencyData.code} - ${currencyData.name}) added or updated successfully.`);
        }
    } catch (error) {
        console.error('Error populating currencies:', error);
    } finally {
        // Close the MongoDB connection when done
        await mongoose.disconnect();
    }
}

async function populateExpenseCategories() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongodbURI);

        const categories = [
            "Food and Dining",
            "Transportation",
            "Housing",
            "Healthcare",
            "Entertainment",
            "Shopping",
            "Personal Care",
            "Education",
            "Debts and Loans",
            "Savings and Investments",
            "Travel",
            "Gifts and Donations",
            "Insurance",
            "Taxes",
            "Miscellaneous"
        ]

        // Loop through currencies data and upsert into MongoDB
        for (const category of categories) {
            await ExpenseCategory.findOneAndUpdate(
                { name: category }, // Find currency by code
                { name: category }, // Data to update or insert
                { upsert: true } // Upsert option: insert if not found, update if found
            );
            console.log(`Expense category (${category}) added or updated successfully.`);
        }
    } catch (error) {
        console.error('Error populating expense categories:', error);
    } finally {
        // Close the MongoDB connection when done
        await mongoose.disconnect();
    }
}

// Invoke the function to populate currencies
async function populateDatabase() {

    await populateCurrencies();
    await populateExpenseCategories()
}

populateDatabase()