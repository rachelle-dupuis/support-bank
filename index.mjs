import log4js from "log4js";
import * as readline from 'readline-sync';
import {getJsonFileTransactions} from "./fileReaders/jsonReader.mjs";
import {printAllTransactions} from "./client/printAllTransactions.mjs";
import {getAccountBalances} from "./client/getAccountBalances.mjs";
import {getCsvFileTransactions} from "./fileReaders/csvReader.mjs";
const logger = log4js.getLogger('csvReader');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

export class Transaction {
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

const filePath = 'Transactions2014.csv';
const jsonFile = 'Transactions2013.json';

const readlineSync = readline,
    options = ['List All', 'List Account'],
    index = readlineSync.keyInSelect(options, 'Welcome to Support Bank. What would you like to do today?');
logger.info('User selected ' + options[index]);

async function returnUserSelection() {
    logger.info('Program started')

    const { transactions, accounts } = await getCsvFileTransactions(filePath);

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

returnUserSelection();