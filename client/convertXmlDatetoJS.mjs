import moment from 'moment';
moment().format();

function ExcelDateToJSDate(serial) {
    var hours = Math.floor((serial % 1) * 24);
    var minutes = Math.floor((((serial % 1) * 24) - hours) * 60)
    return new Date(Date.UTC(0, 0, serial, hours-17, minutes));
}

       let test = ExcelDateToJSDate(42736);
console.log(test);

var excelDate = 42736;
var date = moment(new Date(excelDate));
var dateWithNewFormat = date.format('DD-MMM-YYYY');
console.log(dateWithNewFormat);