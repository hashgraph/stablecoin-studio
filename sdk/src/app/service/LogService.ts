/*
 *
 * Hedera Stable Coin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLogger, LoggerOptions, transports, format } from 'winston';
import safeStringify from 'fast-safe-stringify';
import BaseError from '../../core/error/BaseError.js';
import { SDK } from '../../port/in/Common.js';
import Injectable from '../../core/Injectable.js';

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
								return safeStringify(e);
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
			...(opts ? { ...this.defaultConfig, ...opts } : this.defaultConfig),
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
		if (error instanceof BaseError) {
			this.log(
				LogLevel.ERROR,
				error.toString(
					Injectable.resolve<typeof SDK>('SDK').log.level === 'TRACE',
				),
				params,
			);
		} else {
			this.log(LogLevel.ERROR, error, params);
		}
	}

	public static logInfo(message: any, ...params: any[]): void {
		this.log(LogLevel.INFO, message, params);
	}

	public static logTrace(message: any, ...params: any[]): void {
		this.log(LogLevel.TRACE, message, params);
	}
}
