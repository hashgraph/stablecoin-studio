export const Input = {
	variants: {
		outline: {
			field: {
				borderColor: 'brand.black',
				fontSize: '14px',
				_focus: {
					boxShadow: 'none',
					borderColor: 'light.secondary',
				},
				_focusVisible: {
					borderColor: 'inherit',
				},
				_hover: {
					borderColor: 'brand.black',
				},
				_placeholder: {
					color: 'brand.gray',
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
