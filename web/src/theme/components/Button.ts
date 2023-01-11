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
			w: '182px', // seems to be that it is not working from baseStyle
			_disabled: {
				_hover: {
					bgColor: 'dark.primary',
					color: 'brand.white',
				},
			},
			_hover: {
				_disabled: {
					bgColor: 'dark.primary',
					color: 'brand.white',
				},
				bgColor: 'brand.hover',
				color: 'brand.white',
			},
		},
		secondary: {
			border: '1px solid',
			bgColor: 'brand.white',
			color: 'brand.primary',
			w: '182px',
			_hover: {
				bgColor: 'brand.gray200',
				color: 'brand.primary',
			},
		},
	},
	defaultProps: {
		variant: 'primary',
	},
};
