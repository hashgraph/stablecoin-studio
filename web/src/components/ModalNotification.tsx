import {
	Button,
	Image,
	Link,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
} from '@chakra-ui/react';
import type { ModalProps } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import SUCCESS_ICON from '../assets/svg/success.svg';
import ERROR_ICON from '../assets/svg/error.svg';

const SUCCESS = 'success';

interface ModalNotificationProps extends Omit<ModalProps, 'children'> {
	description?: string;
	icon?: string;
	isOpen: boolean;
	onClose: () => void;
	title: string;
	variant?: 'error' | 'success';
	onClick?: () => void;
	closeButton?: boolean;
	errorTransactionUrl?:string,
}

const ModalNotification = (props: ModalNotificationProps) => {
	const {
		description,
		icon,
		isOpen,
		onClick,
		onClose,
		title,
		variant,
		closeButton = true,
		errorTransactionUrl,
		...othersProps
	} = props;
	const { t } = useTranslation('global');

	const getIcon = () => icon || (variant === SUCCESS ? SUCCESS_ICON : ERROR_ICON);

	return (
		<Modal
			data-testid='modal-notification'
			isOpen={isOpen}
			onClose={onClose}
			isCentered
			blockScrollOnMount={false}
			{...othersProps}
		>
			<ModalOverlay />
			<ModalContent data-testid='modal-notification-content' pt='50' pb='50'>
				{closeButton && <ModalCloseButton />}
				{(icon || variant) && (
					<ModalHeader alignSelf='center' p='0'>
						<Image
							data-testid='modal-notification-icon'
							src={getIcon()}
							width='54px'
							height='54px'
						/>
					</ModalHeader>
				)}
				<ModalBody textAlign='center' pt='14px'>
					<Text
						data-testid='modal-notification-title'
						fontSize='14px'
						fontWeight={700}
						lineHeight='16px'
						color='brand.black'
					>
						{title}
					</Text>
					{description && (
						<Text
							data-testid='modal-notification-description'
							mt='8px'
							fontSize='12px'
							fontWeight={400}
							lineHeight='16px'
							color='brand.gray'
						>
							{description}
						</Text>
					)}
					{errorTransactionUrl && (
						<Link href={errorTransactionUrl} isExternal textDecoration="underline">
							{t('common.see-transaction')}
						</Link>
					)}
				</ModalBody>
				<ModalFooter alignSelf='center' pt='24px' pb='0'>
					<Button
						data-testid='modal-notification-button'
						onClick={onClick || onClose}
						variant='primary'
					>
						{t('common.accept')}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default ModalNotification;
