/* eslint-disable @typescript-eslint/no-unused-vars */
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
	const [SDKInit, setSDKInit] = useState<boolean>(false);
	const [SDKInitialize, setSDKInitialize] = useState<boolean>(true);

	useEffect(() => {
		// instanceSDK();
	}, []);

	useEffect(() => {
		if (SDKInitialize) {
			setSDKInit(true);
		}
	}, [SDKInitialize]);

	// const instanceSDK = async () => {
	// 	const instance = SDKService.getInstance();
	// 	// await instance.init({
	// 	// 	onInit: () => {
	// 	// 		console.log('Init');
	// 	// 	},
	// 	// });
	// 	// instance.onWalletExtensionFound(() => {
	// 	// 	console.log('Extension found');
	// 	// 	setSDKInitialize(true);
	// 	// });
	// };

	return (
		<I18nextProvider i18n={i18n}>
			<Provider store={store}>
				<ChakraProvider theme={theme}>
					<BrowserRouter>
						<Focus />
						<Fonts />
						<ScrollBar />
						{SDKInit ? <Router /> : <></>}
					</BrowserRouter>
				</ChakraProvider>
			</Provider>
		</I18nextProvider>
	);
}

export default App;
