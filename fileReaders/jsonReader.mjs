import moment from 'moment';
moment().format();
import * as fs from 'fs';
import {Transaction} from "../index.mjs";
import log4js from "log4js";
const logger = log4js.getLogger('jsonReader');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});


export function getJsonFileTransactions (file) {
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
        let jsonDate = new Date(data.Date).toISOString().split('T')[0];
        const dateMomentObject = moment(jsonDate, "YYYY-MM-DD", true);
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