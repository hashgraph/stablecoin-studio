import { Flex } from '@chakra-ui/react';
import AwaitingWalletSignature from '../components/AwaitingWalletSignature';

const Loading = () => {
	return (
		<Flex
			data-testid='login_container'
			alignItems='center'
			position='absolute'
			w='100%'
			zIndex={1000}
			justifyContent='center'
			flexDirection='column'
			bgColor='background'
			h='100vh'
		>
			<Flex
				bgColor='brand.white'
				w='500px'
				h='272px'
				borderRadius='8px'
				flexDirection='column'
				justifyContent='center'
				alignItems='center'
			>
				<AwaitingWalletSignature />
			</Flex>
		</Flex>
	);
};

export default Loading;
