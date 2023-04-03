import { Box, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import Icon from '../../components/Icon';
import {
	LAST_WALLET_SELECTED,
	SELECTED_WALLET_PAIRED,
	SELECTED_NETWORK,
} from '../../store/slices/walletSlice';
import HEDERA_LOGO from '../../assets/png/hashpackLogo.png';
import METAMASK_LOGO from '../../assets/svg/MetaMask_Fox.svg';
import TooltipCopy from '../../components/TooltipCopy';
import { SupportedWallets } from 'hedera-stable-coin-sdk';
import { Question } from 'phosphor-react';
import { useEffect, type ReactElement } from 'react';

const TopbarRight = () => {
	const initData = useSelector(SELECTED_WALLET_PAIRED);
	const selectedWallet = useSelector(LAST_WALLET_SELECTED);
	const network = useSelector(SELECTED_NETWORK);

	const handleDisconnect = async () => {
		window.location.reload();
		localStorage.clear();
	};

	const getIcon = (): ReactElement => {
		const img = (src: string) => (
			<Image src={src} alt={selectedWallet} w='25px' h='25px' alignSelf='center' />
		);

		if (selectedWallet === SupportedWallets.HASHPACK) return img(HEDERA_LOGO);
		if (selectedWallet === SupportedWallets.METAMASK) return img(METAMASK_LOGO);

		return <Question size={22} color='#fdfdfc' weight='light' />;
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
					<TooltipCopy valueToCopy={network ?? ''}>
						<Text data-testid='topbar-right-network' fontSize='10px' textTransform='uppercase'>
							{network ?? ''}
						</Text>
					</TooltipCopy>
				</VStack>
				{getIcon()}
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
