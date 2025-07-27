export interface ILogger {
    info(message: string): void;
    debug(message: string, error: any): void;
    warn(message: string): void;
    error(message: string): void;
}