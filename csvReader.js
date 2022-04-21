const csv = require('csv-parser')
const fs = require('fs')
const transactions = [];

fs.createReadStream('Transactions2014.csv')
    .pipe(csv())
    .on('data', (data) => transactions.push(data))
    .on('end', () => {
        console.log(transactions);
    });