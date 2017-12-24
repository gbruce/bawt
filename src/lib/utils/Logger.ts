
import * as winston from 'winston';

const startTime: number = new Date().getTime();

const tsFormat = () => {
  return '[' + ((new Date().getTime() - startTime) / 1000.0).toFixed(3) + ']';
};

export function NewLogger(label: string = '') {
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
