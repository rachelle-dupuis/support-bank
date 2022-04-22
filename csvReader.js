const moment = require('moment');
moment().format();
const csv = require('csv-parser');
const fs = require('fs');
const log4js = require("log4js");
const logger = log4js.getLogger('csvReader');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

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

const filePath = 'DodgyTransactions2015.csv';

function getTransactions(file) {
    const transactions = [];
    const accounts = new Set();
    let line = 2;
    logger.info('Reading file...')
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', reject)
            .pipe(csv())
            .on('data', (data) => {
                logger.info('CSV line ' + line)
                accounts.add(data.From);
                accounts.add(data.To);
                const dateMomentObject = moment(data.Date, "DD/MM/YYYY", true);
                const date = new Date(dateMomentObject);
                if (!dateMomentObject.isValid()) {
                    logger.error('Date is not valid');
                    throw new Error(`${filePath} line ${line}: Date is not valid`);
                }
                const amount = parseFloat(data.Amount);
                if (isNaN(amount)) {
                    logger.error('Amount is not valid');
                    throw new Error(`${filePath} line ${line}: Amount is not valid`);
                }
                const newTransaction = new Transaction(date, data.From, data.To, data.Narrative, amount);
                transactions.push(newTransaction);
                line++;
            })
            .on('end', () => {
                logger.info('End of file. File read successfully')
                resolve({transactions, accounts});
            });
    });
}

const readlineSync = require('readline-sync'),
    options = ['List All', 'List Account'],
    index = readlineSync.keyInSelect(options, 'Welcome to Support Bank. What would you like to do today?');
logger.info('User selected ' + options[index]);

async function returnUserSelection() {
    logger.info('Program started')

    const { transactions, accounts } = await getTransactions(filePath);

    switch (options[index]) {
        case 'List All':
            getAccountBalances(transactions, accounts);
            break;
        case 'List Account':
            const accountName = readlineSync.question('Please enter account name:');
            logger.info('User entered: ' + accountName)
            if (!accounts.has(accountName)) {
                logger.info('Name is not in account list')
                console.log('There is no account with that name');
            }
            printAllTransactions(accountName, transactions);
            break;
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

returnUserSelection();