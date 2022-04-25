import log4js from "log4js";
const logger = log4js.getLogger('getAccountBalances');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

export function getAccountBalances(transactions, accounts) {
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