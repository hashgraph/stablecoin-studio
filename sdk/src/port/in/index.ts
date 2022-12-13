import { transports } from 'winston';
import TransportStream from 'winston-transport';
import Account from './Account.js';
import Network from './Network.js';
import Role from './Role.js';
import StableCoin from './StableCoin.js';
import Event from './Event.js';

export { StableCoin, Account, Network, Role, Event };

export * from './request';

export * from './StableCoin.js';
export * from './Network.js';
export * from './Account.js';
export * from './Role.js';
export * from './Event.js';

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
