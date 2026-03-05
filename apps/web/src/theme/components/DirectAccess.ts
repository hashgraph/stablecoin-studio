import type { ComponentSingleStyleConfig } from '@chakra-ui/react';

export const DirectAccess: ComponentSingleStyleConfig = {
	baseStyle: {
		borderRadius: '16px',
		px: '6px',
		py: 6,
		w: '120px',
		bgColor: 'brand.white',
		borderWidth: '1.3px',
		borderColor: 'brand.gray200',
		transition: 'all .2s ease-in',
		flexDirection: 'column',
		justifyContent: 'center',
		gap: '16px',
		alignItems: 'center',
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
	defaultProps: {
		variant: 'primary',
	},
};
