import {
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	VStack,
} from '@chakra-ui/react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

export interface FireblocksFormValues {
	apiKey: string;
	baseUrl: string;
	vaultAccountId: string;
	fileInput: string;
}

interface FireblocksFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (data: FireblocksFormValues) => void;
}

const FireblocksFormModal = (props: FireblocksFormModalProps) => {
	const { isOpen, onClose, onConfirm } = props;
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FireblocksFormValues>();

	const onSubmit: SubmitHandler<FireblocksFormValues> = (data, event) => {
		const fileInput = event?.target[3].files[0];

		if (fileInput) {
			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target) {
					const fileContent = e.target.result as string;
					onConfirm({ ...data, fileInput: fileContent });
				}
			};
			reader.readAsText(fileInput);
		} else {
			console.error('Archivo no seleccionado');
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size={'xl'}
			isCentered
			closeOnEsc={false}
			closeOnOverlayClick={false}
		>
			<ModalOverlay />
			<ModalContent p='50' w='500px'>
				<ModalCloseButton />
				<ModalHeader>
					<Text fontSize='19px' fontWeight={700} lineHeight='16px' color='brand.black'>
						Fireblocks settings
					</Text>
				</ModalHeader>
				<ModalBody textAlign='center' pt='14px'>
					<form onSubmit={handleSubmit(onSubmit)}>
						<VStack spacing={4}>
							<FormControl isInvalid={!!errors.apiKey}>
								<FormLabel htmlFor='apiKey'>API Key</FormLabel>
								<Input id='apiKey' {...register('apiKey', { required: true })} />
							</FormControl>
							<FormControl isInvalid={!!errors.baseUrl}>
								<FormLabel htmlFor='baseUrl'>Base URL</FormLabel>
								<Input
									id='baseUrl'
									{...register('baseUrl', { required: true })}
									defaultValue='https://api.fireblocks.io'
								/>
							</FormControl>
							<FormControl isInvalid={!!errors.vaultAccountId}>
								<FormLabel htmlFor='vaultAccountId'>Vault Account ID</FormLabel>
								<Input id='vaultAccountId' {...register('vaultAccountId', { required: true })} />
							</FormControl>
							<FormControl isInvalid={!!errors.fileInput}>
								<FormLabel htmlFor='fileInput'>Archivo .key</FormLabel>
								<Input id='fileInput' type='file' {...register('fileInput', { required: true })} />
								{errors.fileInput && <FormErrorMessage>.key is mandatory</FormErrorMessage>}
							</FormControl>
						</VStack>
						<ModalFooter justifyContent='center' pt={4}>
							<HStack spacing={6} w='full'>
								<Button onClick={onClose} variant='secondary' flex={1}>
									Cancel
								</Button>
								<Button type='submit' flex={1}>
									Confirm
								</Button>
							</HStack>
						</ModalFooter>
					</form>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default FireblocksFormModal;
