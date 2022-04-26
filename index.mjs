import log4js from "log4js";
import * as readlineSync from 'readline-sync';
import {getJsonFileTransactions} from "./fileReaders/jsonReader.mjs";
import {printAllTransactions} from "./client/printAllTransactions.mjs";
import {getAccountBalances} from "./client/getAccountBalances.mjs";
import {getCsvFileTransactions} from "./fileReaders/csvReader.mjs";
import {getXmlFileTransactions} from "./fileReaders/xmlReader.mjs";
const logger = log4js.getLogger('index');
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

const filePath = 'C:\\Work\\Training\\support-bank\\';

function getUserSelection() {
    const readline = readlineSync,
        options = ['List All', 'List Account'],
        index = readline.keyInSelect(options, 'Welcome to Support Bank. What would you like to do today?');
    logger.info('User selected ' + options[index]);
    return options[index];
}

function getFileNameFromUser() {
    let fileName = readlineSync.question('What is the file name?')
    return filePath.concat(fileName);
}

let userSelection = getUserSelection();
let file = getFileNameFromUser();

async function returnUserSelection(file, option) {
    logger.info('Program started')

    let transactions;
    let accounts;

    if (file.includes('.json')) {
        let jsonTransactions = getJsonFileTransactions(file);
        transactions = jsonTransactions.transactions;
        accounts = jsonTransactions.accounts;
    } else if (file.includes('.csv')) {
        let csvTransactions = await getCsvFileTransactions(file);
        transactions = csvTransactions.transactions;
        accounts = csvTransactions.accounts;
    } else if (file.includes('.xml')) {
        let xmlTransactions = getXmlFileTransactions(file);
        transactions = xmlTransactions.transactions;
        accounts = xmlTransactions.accounts;
    } else {
        return console.log('That file type not supported');
    }

    switch (option) {
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

returnUserSelection(file, userSelection);