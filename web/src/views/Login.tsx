import { Flex } from '@chakra-ui/react';
import ModalHashpack from '../components/ModalHashpack';

const Login = () => {
	return (
		<Flex
			alignItems='center'
			justifyContent='center'
			flexDirection='column'
			bgColor='background'
			h='100vh'
		>
			<ModalHashpack />
		</Flex>
	);
};

export default Login;
