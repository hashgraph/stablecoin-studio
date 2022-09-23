import { Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import ModalHashpack from '../components/ModalHashpack';
import SDKService from '../services/SDKService';

const Login = () => {
	const [availabilityExtension, setAvailabilityExtension] = useState<boolean | undefined>();

	useEffect(() => {
		getAvailability();
	}, []);

	const getAvailability = async () => {
		SDKService.getAvailabilityExtension().then((response) => {
			setAvailabilityExtension(response);
		});
	};

	return (
		<Flex
			alignItems='center'
			justifyContent='center'
			flexDirection='column'
			bgColor='background'
			h='100vh'
		>
			{!availabilityExtension ? (
				<ModalHashpack type='no-installed' />
			) : (
				<ModalHashpack type='no-connected' />
			)}
		</Flex>
	);
};

export default Login;
