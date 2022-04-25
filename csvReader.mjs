import moment from 'moment';
moment().format();
import csv from 'csv-parser';
import * as fs from 'fs';
import log4js from "log4js";
import * as readline from 'readline-sync';
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

const filePath = 'Transactions2014.csv';
const jsonFile = 'Transactions2013.json';

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
                logger.info('End of file. File read successfully.')
                resolve({transactions, accounts});
            });
    });
}

const readlineSync = readline,
    options = ['List All', 'List Account'],
    index = readlineSync.keyInSelect(options, 'Welcome to Support Bank. What would you like to do today?');
logger.info('User selected ' + options[index]);

async function returnUserSelection() {
    logger.info('Program started')

    const { transactions, accounts } = await getJsonFileTransactions(jsonFile);

    switch (options[index]) {
        case 'List All':
            logger.info('Fetching account balances...')
            getAccountBalances(transactions, accounts);
            break;
        case 'List Account':
            logger.info('Prompting user for account name...')
            const accountName = readlineSync.question('Please enter account name:');
            logger.info('User entered: ' + accountName)
            if (!accounts.has(accountName)) {
                logger.info('Name is not in account list')
                console.log('There is no account with that name');
            }
            logger.info(`Fetching ${accountName}'s transactions...`)
            printAllTransactions(accountName, transactions);
            break;
    }
}

function printAllTransactions(name, transactions) {
    transactions.forEach((transaction) => {
        if (transaction.fromAccount === name || transaction.toAccount === name) {
            const amount = transaction.amount.toFixed(2);
            logger.info(`${transaction.date} ${transaction.fromAccount} paid ${transaction.toAccount} $${amount} for ${transaction.description}`);
            console.log(`${transaction.date} ${transaction.fromAccount} paid ${transaction.toAccount} $${amount} for ${transaction.description}`);
        }
    })
    logger.info(`Finished printing ${name}'s transactions.`);
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
        logger.info(`${account}: ${balance}`);
        console.log(`${account}: ${balance}`);
    })
    logger.info(`Finished printing balances for ${accounts.size} accounts.`);
}

returnUserSelection();

function getJsonFileTransactions (file) {
    const jsonFile = fs.readFileSync(file, 'utf8');
    const jsonArray = JSON.parse(jsonFile);

    const transactions = [];
    const accounts = new Set();
    let line = 1;
    logger.info('Reading file...')

    jsonArray.forEach((data) =>
    {
        logger.info('JSON line ' + line)
        accounts.add(data.FromAccount);
        accounts.add(data.ToAccount);
        let testDate = new Date(data.Date).toISOString().split('T')[0];
        const dateMomentObject = moment(testDate, "YYYY-MM-DD", true);
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
        const newTransaction = new Transaction(date, data.FromAccount, data.ToAccount, data.Narrative, amount);
        transactions.push(newTransaction);
        line++;
    });
    logger.info('End of file. File read successfully.')
    return ({transactions, accounts});
}