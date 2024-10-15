import { extendTheme } from '@chakra-ui/react';
import { Button } from './components/Button';
import { Text } from './components/Text';
import { Select } from './components/Select';
import { Input } from './components/Input';
import { FormLabel } from './components/FormLabel';
import { Heading } from './components/Heading';
import { Tabs } from './components/Tabs';
import { FormError } from './components/FormError';
import { DirectAccess } from './components/DirectAccess';
import { DirectAction } from './components/DirectAction';

const theme = extendTheme({
	config: {
		initialColorMode: 'light',
	},
	colors: {
		background: 'rgb(51, 51, 51, .5)',
		brand: {
			primary: '#662D8F',
			secondary: '#464646',
			black: '#323232',
			gray: '#666666',
			gray2: '#929292',
			gray3: '#F2F2F2',
			gray4: '#FFFAF4',
			gray5: '#edf2f7',
			gray100: '#F7FAFC',
			gray200: '#662d8f0f',
			gray300: '#CBD5E0',
			gray600: '#4A5568',
			white: '#FFFFFF',
			green: '#A7D88A',
			red: '#E62A10',
			blue: '#7285EA',
			lightGray: '#E1E1E1',
			lightPrimary: '#ECE8FF',
			primary200: '#5C47D9',
			hover: '#8750AF',
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
	fonts: {
		regular: 'Mulish, Arial, sans-serif',
	},
	shadows: {
		outline: 'none',
		'down-black': '0px -6px 10px 3px rgba(0,0,0,0.25)',
	},
	components: {
		Button,
		Text,
		Select,
		FormLabel,
		Input,
		Heading,
		Tabs,
		FormError,
		DirectAccess,
		DirectAction,
	},
	styles: {
		global: {
			body: {
				fontFamily: 'regular',
			},
		},
	},
});

export default theme;
