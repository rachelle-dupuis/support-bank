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
    if (options[index] === 'List All') {
        logger.info('User chose to list all account balances')
        getAccountBalances();
    }
    if (options[index] === 'List Account') {
        logger.info('User chose to see account detail')
        const accountName = readlineSync.question('Please enter account name:');
        logger.info('User entered: ' + accountName)
        const accountList = await getAccounts();
        if (!accountList.includes(accountName)) {
            logger.info('Name is not in account list')
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

class Account {
    name;

    constructor (name) {
        this.name = name;
    }
}

function getTransactions(file) {
    const bank = [];
    let line = 2;
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .pipe(csv())
            .on('data', (data) => {
                logger.info('CSV line ' + line)
                const dateMomentObject = moment(data.Date, "DD/MM/YYYY");
                const date = new Date(dateMomentObject);
                const amount = parseFloat(data.Amount);
                const newTransaction = new Transaction(date, data.From, data.To, data.Narrative, amount);
                bank.push(newTransaction);
                line++;
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
            const amount = allTransactions[i].amount.toFixed(2);
            console.log(`${allTransactions[i].date} ${allTransactions[i].fromAccount} paid ${allTransactions[i].toAccount} $${amount} for ${allTransactions[i].description}`);
        }
    }
}

async function getAccountBalances() {
    const allTransactions = await getTransactions(filePath);
    const allAccounts = await getAccounts();
    for (let i = 0; i < allAccounts.length; i++) {
        const account = allAccounts[i];
        let balance = 0;
        for (let i = 0; i < allTransactions.length; i++) {
            const transaction = allTransactions[i];
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