/*
 *
 * Hedera Stablecoin SDK
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
import {
	Logger,
	createLogger,
	LoggerOptions,
	transports,
	format,
} from 'winston';
import safeStringify from 'fast-safe-stringify';
import BaseError from '../../core/error/BaseError.js';
import { SDK } from '../../port/in/Common.js';
import Injectable from '../../core/Injectable.js';

// Extracted for convenience
const { Console } = transports;
const { printf } = format;

export enum LogLevel {
	TRACE = 'TRACE',
	DEBUG = 'DEBUG',
	INFO = 'INFO',
	ERROR = 'ERROR',
}

export const LoggerOptionLevels: Record<LogLevel, number> = {
	[LogLevel.TRACE]: 5, //! we set trace and debug to 0, same level
	[LogLevel.DEBUG]: 5,
	[LogLevel.INFO]: 2,
	[LogLevel.ERROR]: 0,
};

export default class LogService {
	public static logger: Logger;
	public static defaultFormat = printf(
		({ level, message, timestamp, other }) => {
			const formatOther = (val: any[]): string => {
				return val
					.map((e) => (typeof e === 'object' ? safeStringify(e) : e))
					.join('\t');
			};
			return `${timestamp} - [${level}]\t${message}\t${formatOther(
				other,
			)}`;
		},
	);

	private readonly coreConfig: LoggerOptions = {
		levels: LoggerOptionLevels,
		exitOnError: false,
	};

	private readonly defaultConfig: LoggerOptions = {
		transports: [new Console()],
		level: LogLevel.ERROR,
		format: LogService.defaultFormat,
	};

	constructor(opts?: LoggerOptions) {
		const config = { ...this.defaultConfig, ...opts, ...this.coreConfig };
		LogService.logger = createLogger(config);
	}

	public static log(level: LogLevel, message: string, params: any[]): void {
		LogService.logger.log(level, message, {
			timestamp: new Date().toISOString(),
			other: params,
		});
	}

	public static logError(error: BaseError | unknown, ...params: any[]): void {
		if (error instanceof BaseError) {
			LogService.log(
				LogLevel.ERROR,
				error.toString(
					Injectable.resolve<typeof SDK>('SDK').log.level ===
						LogLevel.TRACE,
				),
				params,
			);
		} else {
			LogService.log(LogLevel.ERROR, error as string, params);
		}
	}

	public static logInfo(message: string, ...params: any[]): void {
		LogService.log(LogLevel.INFO, message, params);
	}

	public static logTrace(message: string, ...params: any[]): void {
		LogService.log(LogLevel.TRACE, message, params);
	}
}
