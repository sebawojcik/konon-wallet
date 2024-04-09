const axios = require('axios');
const Currency = require("./models/currency")
const mongoose = require('mongoose')
require('dotenv').config();
const mongodbURI = process.env.MONGODB_URI;

const getCurrencies = async () => {
    return await axios.get("https://restcountries.com/v3.1/all")
    .then(response => {
        const countries = response.data
        const currencies = {}

        countries.forEach(element => {
            if (element.currencies) {
                Object.entries(element.currencies).forEach(([code, obj]) => {
                    if (!(code in currencies)) {
                        currencies[code] = obj
                    }
                })
            }
        });

        const currenciesArray = []

        Object.entries(currencies).forEach(([code, obj]) => {
            currenciesArray.push({...obj, code})
        })

        currenciesArray.sort((a, b) => a.name.localeCompare(b.name));
        return currenciesArray
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

}

mongoose.connect(mongodbURI)
.then(async () => {
    const currencies = await getCurrencies()
    Currency.insertMany(currencies)
    .then(() => {
        console.log('Data inserted successfully');
    })
    .catch(err => {
        console.error('Error inserting data:', err);
    })
    .finally(() => {
        mongoose.disconnect();
    });
}).catch(err => {
    console.error(err)
})