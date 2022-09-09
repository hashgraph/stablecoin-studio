import { extendTheme } from '@chakra-ui/react';
import { Button } from './components/Button';

const theme = extendTheme({
	config: {
		initialColorMode: 'light',
	},
	colors: {
		background: 'rgb(51, 51, 51, .5)',
		brand: {
			primary: '#662D81',
			gray: '#666666',
		},
		ligth: {
			primary: '#662DA1',
		},
		dark: {},
	},
	breakpoints: {
		sm: '320px',
		md: '768px',
		lg: '960px',
		xl: '1200px',
	},
	shadows: {
		outline: 'none',
	},
	components: {
		Button,
	},
});

export default theme;
