
import * as winston from 'winston';

export function NewLogger(label: string = '') {
  return new (winston.Logger)({
    transports: [
      new winston.transports.Console({
        colorize: true,
        timestamp: true,
        label,
      }),
    ],
  });
}
