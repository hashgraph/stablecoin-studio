import {
	Button,
	HStack,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface ModalActionProps {
	cancelButtonLabel: string;
	children: ReactNode;
	confirmButtonLabel: string;
	isOpen: boolean;
	onCancel?: () => void;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	isDisabled?: boolean;
}

const ModalAction = (props: ModalActionProps) => {
	const {
		cancelButtonLabel,
		children,
		confirmButtonLabel,
		isOpen,
		onCancel,
		onClose,
		onConfirm,
		title,
		isDisabled = false,
	} = props;

	return (
		<Modal
			data-testid='modal-action'
			isOpen={isOpen}
			onClose={onClose}
			size={'xl'}
			isCentered
			closeOnEsc={false}
			closeOnOverlayClick={false}
		>
			<ModalOverlay />
			<ModalContent data-testid='modal-action-content' p='50' w='500px'>
				<ModalCloseButton />
				<ModalHeader px={0}>
					<Text
						data-testid='modal-action-title'
						fontSize='19px'
						fontWeight={700}
						lineHeight='16px'
						color='brand.black'
					>
						{title}
					</Text>
				</ModalHeader>
				<ModalBody textAlign='center' pt='14px' px={0}>
					{children}
				</ModalBody>
				<ModalFooter p='0' justifyContent='center'>
					<HStack spacing={6} pt={8} w='full'>
						<Button
							data-testid='modal-action-cancel-button'
							onClick={onCancel || onClose}
							variant='secondary'
							flex={1}
						>
							{cancelButtonLabel}
						</Button>
						<Button
							data-testid='modal-action-confirm-button'
							onClick={onConfirm}
							flex={1}
							isDisabled={isDisabled}
						>
							{confirmButtonLabel}
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default ModalAction;
