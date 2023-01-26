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
	Spinner,
	Text,
} from '@chakra-ui/react';
import type { ModalProps } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import SUCCESS_ICON from '../assets/svg/success.svg';
import ERROR_ICON from '../assets/svg/error.svg';
import WARNING_ICON from '../assets/svg/warning.svg';

const SUCCESS = 'success';
const WARNING = 'warning';
const ERROR = 'error';

interface ModalNotificationProps extends Omit<ModalProps, 'children'> {
	description?: string | null;
	icon?: string;
	isOpen: boolean;
	onClose: () => void;
	title: string|null;
	variant?: 'error' | 'success' | 'warning' | 'loading';
	onClick?: () => void;
	closeButton?: boolean;
	errorTransactionUrl?: string | null;
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
	const isLoading = (variant && variant === 'loading') ?? false;

	const getIcon = () => {
		if (icon) return icon;
		switch (variant) {
			case SUCCESS:
				return SUCCESS_ICON;
			case WARNING:
				return WARNING_ICON;
			case ERROR:
				return ERROR_ICON;
		}
	};

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
				{closeButton && !isLoading && <ModalCloseButton />}
				{(icon || variant) && !isLoading && (
					<ModalHeader alignSelf='center' p='0'>
						<Image
							data-testid='modal-notification-icon'
							src={getIcon()}
							width='54px'
							height='54px'
						/>
					</ModalHeader>
				)}
				{isLoading && (
					<Spinner w='54px' h='54px' justifyContent='center' alignSelf={'center'} color='#C6AEFA' thickness='4px'/>
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
						<Link href={errorTransactionUrl} isExternal textDecoration='underline'>
							{t('common.see-transaction')}
						</Link>
					)}
				</ModalBody>
				{!isLoading && (
					<ModalFooter alignSelf='center' pt='24px' pb='0'>
						<Button
							data-testid='modal-notification-button'
							onClick={onClick || onClose}
							variant='primary'
						>
							{t('common.accept')}
						</Button>
					</ModalFooter>
				)}
			</ModalContent>
		</Modal>
	);
};

export default ModalNotification;
