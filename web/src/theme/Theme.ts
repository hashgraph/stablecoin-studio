import { extendTheme } from '@chakra-ui/react';
import { Button } from './components/Button';
import { ConfigSelect } from './components/Select';

const theme = extendTheme({
	config: {
		initialColorMode: 'light',
	},
	colors: {
		background: 'rgb(51, 51, 51, .5)',
		brand: {
			primary: '#7A6BAE',
			secondary: '#464646',
			black: '#323232',
			gray: '#666666',
			gray2: '#929292',
			gray3: '#F2F2F2',
			gray4: '#FFFAF4',
			gray5: '#edf2f7',
			white: '#FFFFFF',
			green: '#A7D88A',
			red: '#F25454',
			blue: '#7285EA',
			lightPrimary: '#ECE8FF',
			primary200: '#5C47D9',
		},
		light: {
			primary: '#ECEBF1',
			secondary: '#A0A0A0',
			purple: '#ECE8FF',
			purple2: '#B699F5',
			purple3: '#9F79F2',
			purple4: 'rgb(182, 153, 245, .4)',
		},
		dark: {
			primary: '#662D8F',
			secondary: '#222222',
		},
	},
	breakpoints: {
		sm: '320px',
		md: '768px',
		lg: '960px',
		xl: '1200px',
	},
	shadows: {
		outline: 'none',
		'down-black': '0px -6px 10px 3px rgba(0,0,0,0.25)',
	},
	components: {
		Button,
		Select: ConfigSelect,
		Input: {
			baseStyle: {
				border: 0,
			},
			defaultProps: {
				variant: 'unstyled',
			},
		},
	},
});

export default theme;
