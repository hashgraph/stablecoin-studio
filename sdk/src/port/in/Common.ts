import { transports } from 'winston';
import TransportStream from 'winston-transport';

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
	transport: TransportStream;
};

// Log transports
export { transports as LoggerTransports };

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
