import { I18nextProvider } from 'react-i18next';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import i18n from '../i18n';
import store from '../store/store';
import theme from '../theme/Theme';
import Router from '../Router/Router';
import { BrowserRouter } from 'react-router-dom';
import { Fonts } from '../components/Fonts';
import { Focus } from '../components/Focus';
import { ScrollBar } from '../components/Scrollbar';
import { useEffect, useState } from 'react';
import SDKService from '../services/SDKService';

function App() {
	const [SDKInit, setSDKInit] = useState<boolean | undefined>();

	useEffect(() => {
		instanceSDK();
	}, []);

	const instanceSDK = async () => {
		SDKService.getInstance().then((response) => {
			if (response) {
				setTimeout(() => {
					setSDKInit(true);
				}, 100);
			}
		});
	};

	return SDKInit ? (
		<I18nextProvider i18n={i18n}>
			<Provider store={store}>
				<ChakraProvider theme={theme}>
					<BrowserRouter>
						<Focus />
						<Fonts />
						<ScrollBar />
						<Router />
					</BrowserRouter>
				</ChakraProvider>
			</Provider>
		</I18nextProvider>
	) : (
		<></>
	);
}

export default App;
