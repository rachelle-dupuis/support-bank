import * as readlineSync from "readline-sync";
import log4js from "log4js";
const logger = log4js.getLogger('getUserSelection');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

export function getUserSelection() {
    const readline = readlineSync,
        options = ['List All', 'List Account'],
        index = readline.keyInSelect(options, 'Welcome to Support Bank. What would you like to do today?');
    logger.info('User selected ' + options[index]);
    return options[index];
}