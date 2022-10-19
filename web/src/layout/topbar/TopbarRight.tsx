import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Icon from '../../components/Icon';
import SDKService from '../../services/SDKService';
import { SELECTED_WALLET_PAIRED, walletActions } from '../../store/slices/walletSlice';
import type { SavedPairingData } from 'hedera-stable-coin-sdk';

const TopbarRight = () => {
	const { t } = useTranslation('global');
	const dispatch = useDispatch();

	const pairingData: SavedPairingData = useSelector(SELECTED_WALLET_PAIRED);

	const handleDisconnect = () => {
		SDKService.getInstance().then((instance) => instance?.disconectHaspack());

		dispatch(walletActions.clearData());
		dispatch(walletActions.setSelectedStableCoin(undefined));
		dispatch(walletActions.setStableCoinList([]));
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
				onClick={handleDisconnect}
				h='32px'
				minW='32px'
				borderRadius='50%'
				bgColor='light.purple4'
				justifyContent='center'
				alignItems='center'
				_hover={{
					cursor: 'pointer',
					bgColor: 'light.purple2',
				}}
			>
				<Icon name='Power' fontSize='24px' color='dark.primary' />
			</Flex>
		</Flex>
	);
};

export default TopbarRight;
