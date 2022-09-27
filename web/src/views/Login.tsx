import { Flex } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import ModalHashpack from '../components/ModalHashpack';
import { HAS_WALLET_EXTENSION } from '../store/slices/hashpackSlice';

const Login = () => {
	const hasWalletExtension = useSelector(HAS_WALLET_EXTENSION);

	return (
		<Flex
			alignItems='center'
			justifyContent='center'
			flexDirection='column'
			bgColor='background'
			h='100vh'
		>
			<ModalHashpack type={hasWalletExtension ? 'no-connected' : 'no-installed'} />
		</Flex>
	);
};

export default Login;
