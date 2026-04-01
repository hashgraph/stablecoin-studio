import { Alert, AlertDescription, AlertIcon, AlertTitle, CloseButton } from '@chakra-ui/react';
import { ConnectionState } from '@hashgraph/stablecoin-npm-sdk';
import type { ReactNode } from 'react';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import SDKService from '../services/SDKService';
import { LAST_WALLET_SELECTED, SELECTED_WALLET_STATUS } from '../store/slices/walletSlice';

interface a {
	children: ReactNode;
}

const InnactivityTimer = ({ children }: a) => {
	const { t } = useTranslation('global');

	const events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress'];

	const status = useSelector(SELECTED_WALLET_STATUS);
	const lastWallet = useSelector(LAST_WALLET_SELECTED);

	let timer: ReturnType<typeof setTimeout>;

	const abortRef = useRef(false);

	const [showAlert, setShowAlert] = useState(false);

	useEffect(() => {
		if (showAlert) {
			setTimeout(() => {
				setShowAlert(false);
			}, 10000);
		}
	}, [showAlert]);

	useEffect(() => {
		abortRef.current = false;
		if (status === ConnectionState.Paired) {
			Object.values(events).forEach((item) => {
				window.addEventListener(item, eventListeners);
			});
		}

		if (status === ConnectionState.Disconnected) {
			abortRef.current = true;
		}

		return () => {
			Object.values(events).forEach((item) => {
				window.removeEventListener(item, eventListeners);
			});
		};
	}, [status, lastWallet]);

	const eventListeners = () => {
		resetTimer();
		handleLogoutTimer();
	};

	const handleLogoutTimer = () => {
		timer = setTimeout(() => {
			resetTimer();

			Object.values(events).forEach((item) => {
				window.removeEventListener(item, eventListeners);
			});

			handleLogout();
		}, 900000); // 15 minutes - 900000 ms
	};

	const handleLogout = async () => {
		if (!abortRef.current) {
			await SDKService.disconnectWallet();

			setShowAlert(true);
		}
	};

	const resetTimer = () => {
		if (timer) clearTimeout(timer);
	};

	return (
		<>
			{showAlert && (
				<Alert
					status='error'
					position={'absolute'}
					borderRadius='10px'
					variant='top-accent'
					justifyContent='center'
					width={'fix-content'}
					alignItems='center'
					left='50%'
					top='30px'
					transform={'translate(-50%, -50%)'}
					borderTopWidth='2px'
				>
					<AlertIcon />

					<AlertTitle fontSize='14px' fontWeight='700' lineHeight='16px' color='brand.black'>
						{t('innactivity.title')}
					</AlertTitle>
					<AlertDescription fontSize='14px' fontWeight='400' lineHeight='16px' color='brand.black'>
						{t('innactivity.description')}
					</AlertDescription>
					<CloseButton
						fontSize='10px'
						alignSelf='flex-end'
						position='relative'
						right={-2}
						top={0}
						onClick={() => setShowAlert(false)}
					/>
				</Alert>
			)}
			{children}
		</>
	);
};

export default InnactivityTimer;
