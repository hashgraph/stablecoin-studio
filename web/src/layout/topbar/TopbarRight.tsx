import { Box, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import Icon from '../../components/Icon';
import { SELECTED_WALLET_PAIRED, walletActions } from '../../store/slices/walletSlice';
import HEDERA_LOGO from '../../assets/png/hashpackLogo.png';
import METAMASK_LOGO from '../../assets/svg/MetaMask_Fox.svg';
import TooltipCopy from '../../components/TooltipCopy';
import { Network, SDK } from 'hedera-stable-coin-sdk';

const TopbarRight = () => {
	const dispatch = useDispatch();

	const initData = useSelector(SELECTED_WALLET_PAIRED);
	const dAppName = SDK.appMetadata.name;

	const handleDisconnect = async () => {
		await Network.disconnect()

		dispatch(walletActions.clearData());
		dispatch(walletActions.setSelectedStableCoin(undefined));
		dispatch(walletActions.setStableCoinList([]));
	};

	const getIcon = (): string => {
		if (dAppName === 'HashPack') return HEDERA_LOGO;

		return METAMASK_LOGO;
	};

	return (
		<Flex data-testid='topbar-right' gap={5}>
			<HStack
				color='white'
				borderRadius='8px'
				h='46px'
				minW='150px'
				justifyContent={'space-between'}
				px={3}
				boxShadow='2px 2px 10px 0px #f1f1f1, -2px -2px 10px 0px #FFF'
				bgColor='#4a4a4a'
			>
				<VStack spacing={0}>
					<TooltipCopy valueToCopy={initData?.account?.id?.toString() ?? ''}>
						<Text data-testid='topbar-right-account' fontSize='12px' fontWeight={600}>
							{initData?.account?.id?.toString() ?? ''}
						</Text>
					</TooltipCopy>
					<Text data-testid='topbar-right-network' fontSize='10px' textTransform='uppercase'>
						{'testnet'}
					</Text>
				</VStack>
				<Image src={getIcon()} alt={dAppName} w='25px' h='25px' alignSelf='center' />
			</HStack>
			<Box borderLeft='2px solid' borderLeftColor='light.primary' w='1px' />
			<Flex
				onClick={handleDisconnect}
				h='32px'
				minW='32px'
				borderRadius='50%'
				bgColor='light.purple4'
				justifyContent='center'
				alignItems='center'
				alignSelf='center'
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
