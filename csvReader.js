var moment = require('moment');
moment().format();
const csv = require('csv-parser');
const fs = require('fs');
var readlineSync = require('readline-sync'),
    options = ['List All', 'List Account'],
    index = readlineSync.keyInSelect(options, 'Welcome to Support Bank. What would you like to do today?');

const filePath = 'Transactions2014.csv';

async function getUserInput() {
    if (options[index] === 'List All') {
        getAccountBalances();
    }
    if (options[index] === 'List Account') {
        let accountName = readlineSync.question('Please enter account name:');
        const accountList = await getAccounts();
        if (!accountList.includes(accountName)) {
            console.log('There is no account with that name');
        }
        printAllTransactions(accountName);
    }
}

class Transaction {
    date;
    fromAccount;
    toAccount;
    description;
    amount;

    constructor(date, fromAccount, toAccount, description, amount) {
        this.date = date;
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.description = description;
        this.amount = amount;
    }
}

function getTransactions(file) {
    let bank = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .pipe(csv())
            .on('data', (data) => {
                let dateMomentObject = moment(data.Date, "DD/MM/YYYY");
                let date = new Date(dateMomentObject);
                let amount = parseFloat(data.Amount);
                let newTransaction = new Transaction(date, data.From, data.To, data.Narrative, amount);
                bank.push(newTransaction);
            })
            .on('end', () => {
                resolve(bank);
            });
    });
}

async function getAccounts() {
    const data = await getTransactions(filePath);
    const accounts = [...new Set(data.map(item => item.fromAccount && item.toAccount))]
    return accounts;
}

async function printAllTransactions(name) {
    const allTransactions = await getTransactions(filePath);
    for (let i = 0; i < allTransactions.length; i++) {
        if (allTransactions[i].fromAccount === name || allTransactions[i].toAccount=== name) {
            let amount = allTransactions[i].amount;
            amount = amount.toFixed(2);
            console.log(`${allTransactions[i].date} ${allTransactions[i].fromAccount} paid ${allTransactions[i].toAccount} $${amount} for ${allTransactions[i].description}`);
        }
    }
}

async function getAccountBalances() {
    const allTransactions = await getTransactions(filePath);
    const allAccounts = await getAccounts();
    for (let i = 0; i < allAccounts.length; i++) {
        let account = allAccounts[i];
        let balance = 0;
        for (let i = 0; i < allTransactions.length; i++) {
            let transaction = allTransactions[i];
            if (transaction.toAccount === account) {
                balance += transaction.amount;
            }
            if (transaction.fromAccount === account) {
                balance -= transaction.amount;
            }
        }
        balance = balance.toFixed(2);
        console.log(`${account}: ${balance}`);
    }
}

getUserInput();