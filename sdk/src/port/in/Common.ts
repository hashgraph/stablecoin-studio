import { transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import TransportStream from 'winston-transport';
import LogService from '../../app/service/LogService.js';

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
	transport: TransportStream | TransportStream[];
};

const DefaultLoggerFormat = LogService.defaultFormat;

// Log transports
export { transports as LoggerTransports };
export { DailyRotateFile };
export { DefaultLoggerFormat };

const SDK: {
	log: LogOptions;
	appMetadata: AppMetadata;
} = {
	log: {
		level: 'ERROR',
		transport: new transports.Console(),
	},
	appMetadata: {
		icon: '',
		description: '',
		name: '',
		url: '',
		debugMode: false,
	},
};

export { SDK };
