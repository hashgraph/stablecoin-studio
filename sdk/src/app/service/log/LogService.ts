/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLogger, LoggerOptions, transports, format } from 'winston';
import BaseError from '../../../core/error/BaseError.js';

const { Console } = transports;
const { printf } = format;

export enum LogLevel {
	TRACE = 'TRACE',
	INFO = 'INFO',
	ERROR = 'ERROR',
}

export const LoggerOptionLevels = {
	[LogLevel.TRACE]: 3,
	[LogLevel.INFO]: 2,
	[LogLevel.ERROR]: 0,
};

export default class LogService {
	public static instance: LogService = new LogService();
	public static defaultFormat = printf(
		({ level, message, timestamp, other }) => {
			const formatOther = (val: any[]): string => {
				return val
					.map((e) => {
						switch (typeof e) {
							case 'object':
								return JSON.stringify(e);
							default:
								return e;
						}
					})
					.join('\t');
			};
			return `${timestamp} - [${level}]\t${message}\t${formatOther(
				other,
			)}`;
		},
	);

	private logger;
	private readonly coreConfig: LoggerOptions = {
		levels: LoggerOptionLevels,
		exitOnError: false,
	};
	private readonly defaultConfig: LoggerOptions = {
		transports: new Console(),
		level: LogLevel.ERROR,
		format: LogService.defaultFormat,
	};

	constructor(opts?: LoggerOptions) {
		LogService.instance = this;
		this.logger = createLogger({
			...(opts ? opts : this.defaultConfig),
			...this.coreConfig,
		});
	}

	public static log(level: LogLevel, message: any, params: any[]): void {
		this.instance.logger.log(level, message, {
			timestamp: new Date().toISOString(),
			other: params,
		});
	}

	public static logError(error: unknown, ...params: any[]): void;
	public static logError(error: BaseError, ...params: any[]): void {
		let other = params;
		if (error && error?.stack) other = [error.stack, ...params];
		this.log(LogLevel.ERROR, error, other);
	}

	public static logInfo(message: any, ...params: any[]): void {
		this.log(LogLevel.INFO, message, params);
	}

	public static logTrace(message: any, ...params: any[]): void {
		this.log(LogLevel.TRACE, message, params);
	}
}
