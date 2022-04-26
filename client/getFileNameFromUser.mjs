import * as readlineSync from "readline-sync";

export function getFileNameFromUser(filePath) {
    let fileName = readlineSync.question('What is the file name?')
    return filePath.concat(fileName);
}