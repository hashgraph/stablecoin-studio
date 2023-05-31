import type { SelectConfigProps } from '../../components/Form/SelectController';

const baseStyle = ({ isDisabled, isInvalid, hasValue }: SelectConfigProps) => {
	return {
		wrapper: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			w: 'full',
			h: 'full',
			position: 'relative',
			cursor: isDisabled ? 'not-allowed' : 'pointer',
			transition: 'all .1s ease-in',
			fontSize: 'sm',
			p: 0,
		},
		container: {
			position: 'relative',
			display: 'flex',
			alignItems: 'center',
			w: 'full',
			h: 'auto',
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
			color: 'brand.black',
		},
		menuList: {},
		option: {
			bg: 'transparent',
			p: 2,
			color: 'brand.black',
			borderRadius: '8px',
			mb: 2,
			_hover: {
				bg: 'blackAlpha.100',
			},
		},
		optionSelected: {
			bg: 'brand.lightPrimary',
			_hover: {
				bg: 'brand.lightPrimary',
			},
		},
		addonDown: {
			paddingEnd: 4,
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

const outline = ({ isInvalid }: SelectConfigProps) => {
	return {
		wrapper: {
			height: 'min',
			width: 'full',
			border: '1px solid',
			borderColor: isInvalid ? 'red.500' : 'gray.600',
			borderRadius: '8px',
			// _hover: {
			// 	borderColor: isInvalid ? 'red.500' : isDisabled ? 'gray.200' : 'gray.300',
			// },
			_focusWithin: {
				borderColor: isInvalid ? 'red.500' : 'gray.600',
			},
		},
		menuList: {
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 2,
			zIndex: 99,
		},
		valueSelected: {
			fontSize: '14px',
			fontWeight: '500',
		},
	};
};

const unstyled = () => {
	return {
		label: {
			color: 'brand.black',
		},
	};
};

export const Select = {
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
		'option',
		'optionSelected',
	],
	baseStyle,
	variants: {
		outline,
		unstyled,
	},
	defaultProps: {
		size: 'md',
		variant: 'outline',
	},
};
