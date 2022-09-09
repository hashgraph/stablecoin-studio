/* eslint-disable @typescript-eslint/no-unused-vars */
const baseStyle = ({ isDisabled, isInvalid, addonRight, addonLeft, hasValue }: any) => {
	return {
		wrapper: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			w: 'full',
			h: 'full',
			position: 'relative',
			cursor: isDisabled ? 'not-allowed' : 'pointer',
		},
		container: {
			position: 'relative',
			display: 'flex',
			alignItems: 'center',
			w: 'full',
			h: 'auto',
			paddingStart: addonLeft ? '9.5px' : 4,
		},
		label: {
			position: 'absolute',
			display: hasValue ? 'none' : 'block',
			color: isInvalid ? 'red.500' : 'blackAlpha.500',
			fontSize: hasValue ? 'sm' : 'md',
			transitionDuration: '300ms',
		},
		valueSelected: {
			position: 'absolute',
		},
		menuList: {
			border: '1px solid',
			borderColor: 'gray.200',
		},
		option: {
			bg: 'transparent',
		},
		addonDown: {
			paddingEnd: addonRight || isInvalid ? '14px' : 4,
		},
		addonError: {
			color: 'red.500',
			paddingEnd: 4,
		},
		addonRight: {
			paddingEnd: 4,
		},
		addonLeft: {
			paddingStart: 4,
		},
	};
};

const sizesStyle = {
	md: () => {
		return {
			container: {
				py: '10px',
			},
		};
	},
	lg: ({ hasValue }: any) => {
		return {
			container: {
				paddingTop: hasValue ? '21px' : '14px',
				paddingBottom: hasValue ? '7px' : '14px',
			},
			label: {
				display: 'block',
				top: hasValue ? '7px' : 'auto',
			},
			valueSelected: {
				bottom: '7px',
			},
		};
	},
	xl: ({ hasValue }: any) => {
		return {
			container: {
				paddingTop: hasValue ? '26px' : '18px',
				paddingBottom: hasValue ? '10px' : '18px',
			},
			label: {
				display: 'block',
				top: hasValue ? '10px' : 'auto',
			},
			valueSelected: {
				bottom: '10px',
			},
		};
	},
};

const outline = ({ isInvalid, isDisabled }: any) => {
	return {
		wrapper: {
			border: '1px solid',
			borderColor: isInvalid ? 'red.500' : 'gray.200',
			_hover: {
				borderColor: isInvalid ? 'red.500' : isDisabled ? 'gray.200' : 'gray.300',
			},
			_focusWithin: {
				borderColor: isInvalid ? 'red.500' : 'blue.500',
			},
		},
	};
};

export const ConfigSelect = {
	parts: [
		'wrapper',
		'container',
		'addonLeft',
		'addonRight',
		'addonError',
		'addonDown',
		'menuList',
		'label',
		'valueSelected',
	],
	baseStyle,
	sizes: {
		md: sizesStyle.md,
		lg: sizesStyle.lg,
		xl: sizesStyle.xl,
	},
	variants: {
		outline,
	},
	defaultProps: {
		size: 'md',
		variant: 'outline',
	},
};
