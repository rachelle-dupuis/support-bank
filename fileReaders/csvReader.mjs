import moment from 'moment';
moment().format();
import csv from 'csv-parser';
import * as fs from 'fs';
import log4js from "log4js";
import {Transaction} from "../index.mjs";
const logger = log4js.getLogger('csvReader');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

export function getCsvFileTransactions(file) {
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