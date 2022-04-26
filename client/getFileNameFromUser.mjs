import * as readlineSync from "readline-sync";
import log4js from "log4js";
const logger = log4js.getLogger('getFileNameFromUser');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

export function getFileNameFromUser(filePath) {
    logger.info('Getting file name from user...');
    let fileName = readlineSync.question('What is the file name?')
    logger.info(`User entered: ${fileName}`);
    return filePath.concat(fileName);
}