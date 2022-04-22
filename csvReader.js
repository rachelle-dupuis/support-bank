const moment = require('moment');
moment().format();
const csv = require('csv-parser');
const fs = require('fs');
const log4js = require("log4js");

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
const logger = log4js.getLogger('csvReader');

const readlineSync = require('readline-sync'),
    options = ['List All', 'List Account'],
    index = readlineSync.keyInSelect(options, 'Welcome to Support Bank. What would you like to do today?');

const filePath = 'Transactions2014.csv';

async function getUserInput() {
    logger.info('Program started')

    function getTransactions(file) {
        const transactions = [];
        const accounts = new Set();
        let line = 2;
        return new Promise((resolve, reject) => {
            fs.createReadStream(file)
                .on('error', reject)
                .pipe(csv())
                .on('data', (data) => {
                    logger.info('CSV line ' + line)
                    accounts.add(data.From);
                    accounts.add(data.To);
                    const dateMomentObject = moment(data.Date, "DD/MM/YYYY");
                    const date = new Date(dateMomentObject);
                    const amount = parseFloat(data.Amount);
                    const newTransaction = new Transaction(date, data.From, data.To, data.Narrative, amount);
                    transactions.push(newTransaction);
                    line++;
                })
                .on('end', () => {
                    resolve({transactions, accounts});
                });
        });
    }
    const bank = await getTransactions(filePath);
    const allTransactions = bank.transactions;
    const allAccounts = bank.accounts;

    switch (options[index]) {
        case 'List All':
            logger.info('User chose to list all account balances')
            getAccountBalances(allTransactions, allAccounts);
            break;
        case 'List Account':
            logger.info('User chose to see account detail')
            const accountName = readlineSync.question('Please enter account name:');
            logger.info('User entered: ' + accountName)
            if (!allAccounts.has(accountName)) {
                logger.info('Name is not in account list')
                console.log('There is no account with that name');
            }
            printAllTransactions(accountName, allTransactions);
            break;
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

class Account {
    name;

    constructor (name) {
        this.name = name;
    }
}

function printAllTransactions(name, transactions) {
    transactions.forEach((transaction) => {
        if (transaction.fromAccount === name || transaction.toAccount === name) {
            const amount = transaction.amount.toFixed(2);
            console.log(`${transaction.date} ${transaction.fromAccount} paid ${transaction.toAccount} $${amount} for ${transaction.description}`);
        }
    })
}

function getAccountBalances(transactions, accounts) {
    accounts.forEach((account) => {
        let balance = 0;
        transactions.forEach((transaction) => {
            if (transaction.toAccount === account) {
                balance += transaction.amount;
            }
            if (transaction.fromAccount === account) {
                balance -= transaction.amount;
            }
        })
        balance = balance.toFixed(2);
        console.log(`${account}: ${balance}`);
    })
}

getUserInput();