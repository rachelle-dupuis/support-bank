import log4js from "log4js";
const logger = log4js.getLogger('printAllTransactions');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

export function printAllTransactions(name, transactions) {
    transactions.forEach((transaction) => {
        if (transaction.fromAccount === name || transaction.toAccount === name) {
            const amount = transaction.amount.toFixed(2);
            logger.info(`${transaction.date} ${transaction.fromAccount} paid ${transaction.toAccount} $${amount} for ${transaction.description}`);
            console.log(`${transaction.date} ${transaction.fromAccount} paid ${transaction.toAccount} $${amount} for ${transaction.description}`);
        }
    })
    logger.info(`Finished printing ${name}'s transactions.`);
}