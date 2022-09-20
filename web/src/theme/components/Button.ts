import type { ComponentSingleStyleConfig } from '@chakra-ui/react';

export const Button: ComponentSingleStyleConfig = {
	baseStyle: {
		_focus: { boxShadow: 'none' },
		textDecoration: 'none',
		borderRadius: '8px',
		p: '12px',
		fontWeight: 700,
		lineHeight: '16px',
	},
	sizes: {
		sm: {
			borderRadius: '4px',
			p: '8px',
			fontSize: '10px',
			fontWeight: 400,
			lineHeight: '12.5px',
		},
		md: {
			fontSize: '14px',
		},
	},
	variants: {
		primary: {
			bgColor: 'dark.primary',
			color: 'brand.white',
			minW: '182px', // seems to be that it is not working from baseStyle
			_hover: {
				bgColor: 'brand.white',
				color: 'brand.primary',
				border: '1px solid',
			},
		},
		secondary: {
			border: '1px solid',
			bgColor: 'brand.white',
			color: 'brand.primary',
			minW: '182px',
			_hover: {
				bgColor: 'dark.primary',
				color: 'brand.white',
			},
		},
	},
	defaultProps: {
		variant: 'primary',
	},
};
