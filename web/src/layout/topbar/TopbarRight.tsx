import { Box, Button, Flex, Text } from '@chakra-ui/react';
import type { InitializationData } from 'hedera-stable-coin-sdk';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Icon from '../../components/Icon';
import SDKService from '../../services/SDKService';
import { walletActions } from '../../store/slices/walletSlice';

const TopbarRight = () => {
	const { t } = useTranslation('global');
	const dispatch = useDispatch();

	const [initData, setInitData] = useState<InitializationData>();
	const [walletInfo, setWalletInfo] = useState<{
		network: string;
		accountId: string;
	}>({
		network: '',
		accountId: '',
	});

	useEffect(() => {
		getWalletData();
	}, []);

	useEffect(() => {
		if (initData) {
			const walletInfo = initData.savedPairings[0];
			const wallet = {
				network: walletInfo.network,
				accountId: walletInfo.accountIds[0],
			};
			setWalletInfo(wallet);
			dispatch(walletActions.setData(walletInfo));
		}
	}, [initData]);

	const getWalletData = async () => {
		const dataResponse = await SDKService.getWalletData();
		setInitData(dataResponse);
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
				<Text textTransform='uppercase'>{walletInfo.network}</Text>
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
				<Text>{walletInfo.accountId}</Text>
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
