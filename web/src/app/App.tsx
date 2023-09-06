import { I18nextProvider, useTranslation } from 'react-i18next';
import { Button, ChakraProvider, Flex, Text, useDisclosure } from '@chakra-ui/react';
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
import { useEffect, useState } from 'react';
import ModalAction from '../components/ModalAction';

function App() {

	const { t } = useTranslation('global');
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [accepted, setAccepted] = useState<boolean>(false);
	const showDisclaimer: boolean = process.env.REACT_APP_SHOW_DISCLAIMER !== undefined && process.env.REACT_APP_SHOW_DISCLAIMER === 'true';

	useEffect(() => {
		onOpen();
	}, []);

	return (
		isMobile ? (
			<Flex
				h='100vh'
				justify={'center'}
				flexDir='column'
			>
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
		) : (
			!showDisclaimer || accepted ? (
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
			<ChakraProvider theme={theme}>
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
				<>
					<Button
						data-testid='modal-term-conditions-button'
						onClick={() => { onOpen() }}
						variant='primary'
						alignSelf={'center'}
					>
						{t('disclaimer.button')}
					</Button>
					<ModalAction
						data-testid='disclaimer'
						title={t('disclaimer.title')}
						isOpen={isOpen}
						onClose={onClose}
						onConfirm={() => { setAccepted(true); }}
						cancelButtonLabel={t('disclaimer.cancel')}
						confirmButtonLabel={t('disclaimer.accept')}
					>
						{t('disclaimer.description')}
					</ModalAction>
				</>
				</Flex>
			</ChakraProvider>
		))
	);
}

export default App;
