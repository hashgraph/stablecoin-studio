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

import { transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import TransportStream from 'winston-transport';
import LogService from '../../app/service/LogService.js';
import { BaseRequest } from './request/BaseRequest.js';
import { ValidationError } from './request/error/ValidationError.js';
import ValidatedRequest from './request/validation/ValidatedRequest.js';

// App Metadata
export type AppMetadata = {
	icon: string;
	name: string;
	description: string;
	url: string;
	debugMode?: boolean;
};

export type LogOptions = {
	level: 'TRACE' | 'INFO' | 'ERROR' | string;
	transports: TransportStream | TransportStream[];
};

const DefaultLoggerFormat = LogService.defaultFormat;

// Log transports
export { transports as LoggerTransports };
export { DailyRotateFile };
export { DefaultLoggerFormat };

class SDK {
	private static _log: LogOptions;
	public static get log(): LogOptions {
		return SDK._log;
	}
	public static set log(value) {
		SDK._log = value;
		new LogService(value);
	}

	private static _appMetadata: AppMetadata;
	public static get appMetadata(): AppMetadata {
		return SDK._appMetadata;
	}
	public static set appMetadata(value: AppMetadata) {
		SDK._appMetadata = value;
	}
}

export const handleValidation = <T extends BaseRequest>(
	name: string,
	req: ValidatedRequest<T>,
): void => {
	const validation = req.validate();
	if (validation.length > 0) throw new ValidationError(name, validation);
};

export { SDK };
