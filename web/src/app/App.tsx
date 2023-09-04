import { I18nextProvider } from 'react-i18next';
import { ChakraProvider, Flex, Text } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import i18n from '../i18n';
import store from '../store/store';
import theme from '../theme/Theme';
import Router from '../Router/Router';
import { BrowserRouter } from 'react-router-dom';
import { Fonts } from '../components/Fonts';
import { Focus } from '../components/Focus';
import { ScrollBar } from '../components/Scrollbar';
import InnactivityTimer from '../components/InnactivityTimer';
import { isMobile } from 'react-device-detect';

function App() {
	return (
		isMobile ? ( 
			<Flex
					w='full'
					h='100vh'
					justify={'center'}
					alignSelf='center'
					alignContent={'center'}
					flex={1}
					flexDir='column'
					gap={10}
				>
					<Text
						fontSize='16px'
						fontWeight={500}
						textAlign='center'
						lineHeight='16px'
						color='brand.gray'
						data-testid='isMobile'
					>
						This app is for desktop use only
					</Text>
				</Flex>
		) : (		
			<I18nextProvider i18n={i18n}>
				<Provider store={store}>
					<ChakraProvider theme={theme}>
						<BrowserRouter>
							<InnactivityTimer>
								<Focus />
								<Fonts />
								<ScrollBar />
								<Router />
							</InnactivityTimer>
						</BrowserRouter>
					</ChakraProvider>
				</Provider>
			</I18nextProvider>
		)
	);
}

export default App;
