export const Button = {
	baseStyle: {
		_focus: { boxShadow: 'none' },
	},
	variants: {
		primary: {
			minW: '182px',
			minH: '40px',
			borderRadius: '8px',
			bgColor: 'dark.primary',
			color: 'brand.white',
			fontSize: '14px',
			fontWeight: '700',
			textDecoration: 'none',
			_hover: {
				bgColor: 'brand.white',
				color: 'brand.primary',
				border: '1px solid',
			},
		},
		secondary: {
			minW: '182px',
			minH: '40px',
			borderRadius: '8px',
			border: '1px solid',
			bgColor: 'brand.white',
			color: 'brand.primary',
			fontSize: '14px',
			fontWeight: '700',
			textDecoration: 'none',
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
