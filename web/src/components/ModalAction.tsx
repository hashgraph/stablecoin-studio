import {
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

interface ModalActionProps {
	cancelButtonLabel: string;
	children: ReactNode;
	confirmButtonLabel: string;
	isOpen: boolean;
	onCancel?: () => void;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
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
	} = props;

	return (
		<Modal data-testid='modal-action' isOpen={isOpen} onClose={onClose} size={'xl'} isCentered>
			<ModalOverlay />
			<ModalContent data-testid='modal-action-content' p='50'>
				<ModalCloseButton />
				<ModalHeader>
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
				<ModalBody textAlign='center' pt='14px'>
					{children}
				</ModalBody>
				<ModalFooter justifyContent={'space-between'} pb='0'>
					<Button
						data-testid='modal-action-cancel-button'
						onClick={onCancel || onClose}
						variant='secondary'
					>
						{cancelButtonLabel}
					</Button>
					<Button data-testid='modal-action-confirm-button' onClick={onConfirm} variant='primary'>
						{confirmButtonLabel}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default ModalAction;
