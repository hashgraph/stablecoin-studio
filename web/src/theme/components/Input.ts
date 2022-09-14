export const Input = {
	variants: {
		outline: {
			field: {
				borderColor: 'brand.black',
				fontSize: '14px',
				_focus: {
					boxShadow: 'none',
				},
				_focusVisible: {
					borderColor: 'inherit',
				},
				_hover: {
					borderColor: 'brand.black',
				},
				_placeholder: {
					color: 'brand.black',
					fontSize: '14px',
				},
				_invalid: {
					borderColor: 'brand.red',
				},
			},
		},
	},
	baseStyle: {},
	defaultProps: {},
};
