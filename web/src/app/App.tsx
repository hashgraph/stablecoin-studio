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
	const [SDKInit, setSDKInit] = useState<boolean | null>(false);
	const [SDKInitialize, setSDKInitialize] = useState<boolean | null>(false);
	const [intervalId, setIntervalId] = useState<ReturnType<typeof setTimeout>>();

	useEffect(() => {
		instanceSDK();

		const interval = setInterval(() => {
			handlerInitSDK();
		}, 200);
		setIntervalId(interval);

		return () => {
			clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		if (SDKInitialize) {
			clearInterval(intervalId);
			setSDKInit(true);
		}
	}, [SDKInitialize]);

	const handlerInitSDK = () => {
		const init = SDKService?.isInit();

		if (init) {
			setSDKInitialize(true);
		}
	};

	const instanceSDK = () => {
		SDKService.getInstance();
	};

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
