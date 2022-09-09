import { Box, Flex, Image } from '@chakra-ui/react';
import LOGO_HEDERA from '../../assets/svg/hedera-hbar-logo.svg';
import TopbarLeft from './TopbarLeft';
import TopbarRight from './TopbarRight';

const Topbar = () => {
	return (
		<Flex
			w='100%'
			h='64px'
			boxShadow='0px -5px 10px 3px rgba(0,0,0,0.25)'
			bgColor='white'
			color='brand.gray2'
			alignItems='center'
			position='relative'
			zIndex='100'
		>
			<Box minW='80px' w='80px' textAlign='center' ml='64px' mr='64px'>
				<Image src={LOGO_HEDERA} w='40px' h='40px' margin='auto' />
			</Box>
			<Box borderRight='2px solid #ECEBF1' w='1px' h='30px' />
			<Flex w='100%' h='100%' justifyContent='space-between' alignItems='center' pl={6} pr={10}>
				<TopbarLeft />
				<TopbarRight />
			</Flex>
		</Flex>
	);
};

export default Topbar;
