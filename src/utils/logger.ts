import { createLogger, transports, format } from 'winston';
import { ILogger } from './ILogger';

export class Logger implements ILogger {
    private logger = createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
        ),
        transports: [new transports.Console()],
    });

    info(message: string) {
        this.logger.info(message);
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    error(message: string) {
        this.logger.error(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }
}
