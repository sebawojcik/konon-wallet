const { MongoClient } = require('mongodb')


const client = new MongoClient("mongodb+srv://ratkoski:kXRPseNMvVCStLsn@cluster0.hzab992.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

async function getDatabase() {
    try {
        await client.connect();
        console.log("Connected to database.")
        return client.db("kw")
    } catch (err) {
        console.error("Error connecting to the database", err)
        throw err
    }
}

module.exports = getDatabase;