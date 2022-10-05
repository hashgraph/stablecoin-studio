import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Icon from '../../components/Icon';
import SDKService from '../../services/SDKService';
import {
	HAS_WALLET_EXTENSION,
	SELECTED_WALLET_PAIRED,
	walletActions,
} from '../../store/slices/walletSlice';
import type { SavedPairingData } from 'hedera-stable-coin-sdk';

const TopbarRight = () => {
	const { t } = useTranslation('global');
	const dispatch = useDispatch();

	const pairingData: SavedPairingData = useSelector(SELECTED_WALLET_PAIRED);
	const extensionFound: boolean = useSelector(HAS_WALLET_EXTENSION);

	useEffect(() => {
		if (!pairingData && extensionFound) {
			getWalletData();
		}
	}, [extensionFound]);

	const getWalletData = async () => {
		const dataResponse = await SDKService.getWalletData();
		dispatch(walletActions.setData(dataResponse));
	};

	const handleDisconnect = () => {
		SDKService.disconnectWallet();
	};

	return (
		<Flex data-testid='topbar-right' gap={5} h='30px'>
			<Flex
				data-testid='topbar-right-network'
				color='brand.gray'
				fontSize='12px'
				fontWeight='400'
				alignItems='center'
			>
				<Text>{t('topbar.network')}</Text>
				<Text mr='5px'>: </Text>
				<Text textTransform='uppercase'>{pairingData ? pairingData.network : ''}</Text>
			</Flex>
			<Box borderLeft='2px solid' borderLeftColor='light.primary' w='1px' />
			<Flex
				data-testid='topbar-right-account'
				color='brand.gray'
				fontSize='12px'
				fontWeight='400'
				alignItems='center'
			>
				<Text>{t('topbar.account')}</Text>
				<Text mr='5px'>: </Text>
				<Text>{pairingData ? pairingData.accountIds[0] : ''}</Text>
			</Flex>
			<Box borderLeft='2px solid' borderLeftColor='light.primary' w='1px' />
			<Flex
				data-testid='topbar-right-disconnect'
				color='brand.gray'
				fontSize='12px'
				fontWeight='400'
				alignItems='center'
			>
				<Button h='100%' w='40px' onClick={handleDisconnect}>
					<Icon name='Power' fontSize='20px' />
				</Button>
			</Flex>
		</Flex>
	);
};

export default TopbarRight;
