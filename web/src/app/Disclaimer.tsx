import ModalAction from '../components/ModalAction';
import { Button, ChakraProvider, Flex, useDisclosure } from '@chakra-ui/react';
import theme from '../theme/Theme';
import { useEffect } from 'react';

interface DisclaimerProps {
	setAccepted: (accepted: boolean) => void;
}

const Disclaimer = ({ setAccepted }: DisclaimerProps) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		onOpen();
	}, []);

	return (
		<ChakraProvider theme={theme}>
			<Flex
				w='full'
				h='100vh'
				justify={'center'}
				alignSelf='center'
				alignContent={'center'}
				flex={1}
				flexDir='column'
				gap={10}
			>
				<>
					<Button
						data-testid='modal-term-conditions-button'
						onClick={() => {
							onOpen();
						}}
						variant='primary'
						alignSelf={'center'}
					>
						Terms & Conditions
					</Button>
					<ModalAction
						data-testid='disclaimer'
						title='Terms & Conditions'
						isOpen={isOpen}
						onClose={onClose}
						onConfirm={() => {
							setAccepted(true);
						}}
						cancelButtonLabel='Cancel'
						confirmButtonLabel='Accept'
					>
						Disclaimer Text
					</ModalAction>
				</>
			</Flex>
		</ChakraProvider>
	);
};

export default Disclaimer;
