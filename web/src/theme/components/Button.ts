export const Button = {
	baseStyle: {
		_focus: { boxShadow: 'none' },
	},
	variants: {
		primary: {
			minW: '182px',
			minH: '40px',
			borderRadius: '8px',
			bgColor: 'brand.primary',
			color: 'white',
			fontSize: '14px',
			fontWeight: '700',
			textDecoration: 'none',
			_hover: {
				bgColor: 'white',
				color: 'brand.primary',
				border: '1px solid',
			},
		},
		secondary: {
			minW: '182px',
			minH: '40px',
			borderRadius: '8px',
			border: '1px solid',
			bgColor: 'white',
			color: 'brand.primary',
			fontSize: '14px',
			fontWeight: '700',
			textDecoration: 'none',
			_hover: {
				bgColor: 'brand.primary',
				color: 'white',
			},
		},
	},
};
