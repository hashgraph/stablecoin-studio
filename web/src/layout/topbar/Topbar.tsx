import { Box, Flex, Image } from '@chakra-ui/react';
import LOGO_HEDERA from '../../assets/svg/hedera-hbar-logo.svg';
import CoinDropdown from './CoinDropdown';
import TopbarRight from './TopbarRight';

const Topbar = () => {
	return (
		<Flex
			data-testid='topbar'
			w='100%'
			h='64px'
			boxShadow='down-black'
			bgColor='brand.white'
			color='brand.gray2'
			alignItems='center'
			position='relative'
			zIndex='100'
		>
			<Box minW='80px' w='80px' textAlign='center' ml='64px' mr='64px'>
				<Image data-testid='topbar-logo' src={LOGO_HEDERA} w='40px' h='40px' margin='auto' />
			</Box>
			<Box borderRight='2px solid' borderRightColor='light.primary' w='1px' h='30px' />
			<Flex w='100%' h='100%' justifyContent='space-between' alignItems='center' pl={6} pr={10}>
				<CoinDropdown />
				<TopbarRight />
			</Flex>
		</Flex>
	);
};

export default Topbar;
