import { container } from 'tsyringe';
import { CommandBus } from '../../core/command/CommandBus.js';
import StableCoin from './StableCoin.js';

export const init = (): void => {
	container.beforeResolution(
		CommandBus,
		(_t, type) => {
			console.log(_t);
			console.log(type);
		},
		{ frequency: 'Always' },
	);
};

export { StableCoin };
