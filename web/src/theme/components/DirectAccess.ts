import type { ComponentSingleStyleConfig } from '@chakra-ui/react';

export const DirectAccess: ComponentSingleStyleConfig = {
	baseStyle: {
		w: '120px',
		h: '136px',
		borderRadius: '16px',
		bgColor: 'brand.white',
		borderWidth: '1.3px',
		borderColor: 'brand.gray200',
		_hover: {
			cursor: 'default',
		},
	},
	variants: {
		primary: {
			_hover: {
				cursor: 'pointer',
				filter: 'drop-shadow(2px 2px 4px #5E5E5E26)',
			},
		},
		disabled: {
			opacity: '.5',
		},
	},
};
