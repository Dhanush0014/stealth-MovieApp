const winston = require('winston');
const { format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const logFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(
        info => `${info.message}`,
    ),
);
let logsFolder = 'logs/'
const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        sql: 4,
        debug: 5
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "cyan",
        sql: "blue",
        debug: "gray"
    }
};
winston.addColors(logLevels);

const pattren = {
    filename: logsFolder + 'combine-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '5m',
    maxFiles: '14d',
    prepend: true,
    level: 'info',
    timestamp: function() {
        return (new Date()).toLocaleTimeString();
    },
    format: format.combine(
       
        format.printf(info => `${info.message}`),
        format.colorize({ all: true })
    ),
};
const info_transport = new DailyRotateFile(pattren);


const error_pattren = pattren;
error_pattren.filename = logsFolder + 'error-%DATE%.log';
error_pattren.level = 'error'
const error_transport = new DailyRotateFile(error_pattren);



const exceptions_pattren = pattren;
exceptions_pattren.filename = logsFolder + 'exceptions-%DATE%.log';
const exception_transport = new DailyRotateFile(exceptions_pattren);

const console_transport = new winston.transports.Console({
    colorize: true,
    humanReadableUnhandledException: true,
    handleExceptions: true,
    format: format.combine(
        format.simple(),
        format.printf(info => `${info.message}`),
        format.colorize({ all: true })
    ),
});

const logger = winston.createLogger({
    format: logFormat,
    transports: [
        info_transport,
        error_transport,
        console_transport,
    ],
    exceptionHandlers: [
        exception_transport,
    ],
 
});
module.exports = logger;