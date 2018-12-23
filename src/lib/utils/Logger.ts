
import * as winston from 'winston';
import * as Transport from 'winston-transport';
import { TransformableInfo } from 'logform';

const startTime: number = new Date().getTime();
const messageSymbol = Symbol('message');

const tsFormat = () => {
  return '[' + ((new Date().getTime() - startTime) / 1000.0).toFixed(3) + ']';
};

class CustomTransport extends Transport {
  constructor(opts: Transport.TransportStreamOptions) {
    super(opts);
  }

  public log?(info: any, next: () => void): any {
    setImmediate(() => {
      const msg = info[Symbol.for('message')];
      switch (info.level) {
        case 'warn':
          // tslint:disable:no-console
          console.warn(msg);
          break;
        case 'error':
          // tslint:disable:no-console
          console.error(msg);
          break;
        case 'info':
          // tslint:disable:no-console
          console.info(msg);
          break;
        case 'debug':
          // tslint:disable:no-console
          console.debug(msg);
          break;
        default:
          // tslint:disable:no-console
          console.info(msg);
      }
    });

    next();
  }
}

export function NewLogger(label: string = ''): winston.Logger {
  return winston.createLogger({
    level: 'debug',
    format: winston.format.printf((info: TransformableInfo) => {
      return `${tsFormat()} [${label}] ${info.message}`;
    }),
    transports: [
      new CustomTransport({}),
    ],
  });
}
