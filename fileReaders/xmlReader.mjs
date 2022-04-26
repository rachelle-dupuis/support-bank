import moment from 'moment';
moment().format();
import * as fs from 'fs';
import {Transaction} from "../index.mjs";
import * as xml2js from 'xml2js';
import log4js from "log4js";
const logger = log4js.getLogger('xmlReader');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

export function getXmlFileTransactions(file) {
    const xml = fs.readFileSync(file);
    const transactions = [];
    const accounts = new Set();
    let line = 1;
    xml2js.parseString(xml, { mergeAttrs: true }, (err, result) => {
        const jsonArray = result.TransactionList.SupportTransaction;
        jsonArray.forEach((data) => {
            logger.info('XML line ' + line)
            accounts.add(data.Parties[0].From[0]);
            accounts.add(data.Parties[0].To[0]);
            // let jsonDate = new Date(data.Date).toISOString().split('T')[0];
            // const dateMomentObject = moment(jsonDate, "YYYY-MM-DD", true);
            // const date = new Date(dateMomentObject);
            // if (!dateMomentObject.isValid()) {
            //     logger.error('Date is not valid');
            //     throw new Error(`${filePath} line ${line}: Date is not valid`);
            // }
            const amount = parseFloat(data.Value);
            if (isNaN(amount)) {
                logger.error('Amount is not valid');
                throw new Error(`${filePath} line ${line}: Amount is not valid`);
            }
            const newTransaction = new Transaction(data.Date[0], data.Parties[0].From[0], data.Parties[0].To[0], data.Description, amount);
            transactions.push(newTransaction);
            line++;
        });
    });
    return ({transactions, accounts});
}
