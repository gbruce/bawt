
import * as winston from 'winston';
import browser = require('winston-browser');

const startTime: number = new Date().getTime();

const tsFormat = () => {
  return '[' + ((new Date().getTime() - startTime) / 1000.0).toFixed(3) + ']';
};

export function NewLogger(label: string = ''): winston.LoggerInstance {
  if (typeof process.stdout === 'undefined') {
    // yeah, yuck...
    return browser as winston.LoggerInstance;
  }

  return new (winston.Logger)({
    transports: [
      new winston.transports.Console({
        colorize: true,
        timestamp: tsFormat,
        label,
        level: 'debug',
        showLevel: true,
        align: true,
      }),
    ],
  });
}
