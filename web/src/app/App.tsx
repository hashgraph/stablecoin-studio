import { I18nextProvider, useTranslation } from 'react-i18next';
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
import { useState } from 'react';
import Disclaimer from './Disclaimer';

function App() {
	const { t } = useTranslation('global');
	const [accepted, setAccepted] = useState<boolean>(false);
	const showDisclaimer: boolean =
		process.env.REACT_APP_SHOW_DISCLAIMER !== undefined &&
		process.env.REACT_APP_SHOW_DISCLAIMER === 'true';

	return isMobile ? (
		<Flex h='100vh' justify={'center'} flexDir='column'>
			<Text
				fontSize='16px'
				fontWeight={500}
				textAlign='center'
				lineHeight='16px'
				color='brand.gray'
				data-testid='isMobile'
			>
				{t('mobile.message')}
			</Text>
		</Flex>
	) : !showDisclaimer || accepted ? (
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
	) : (
		<Disclaimer setAccepted={setAccepted}/>
	);
}

export default App;
