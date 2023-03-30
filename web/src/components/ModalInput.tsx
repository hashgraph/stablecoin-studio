import {
	Button,
	Image,
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
import HederaSpinner from './HederaSpinner';
import InputController from './Form/InputController';
import { useForm } from 'react-hook-form';
import { propertyNotFound } from '../constant';

interface ModalInputProps extends Omit<ModalProps, 'children'> {
	description?: string | null;
	placeholderInput: string;
	icon?: string;
	isOpen: boolean;
	onClose: () => void;
	title: string | null;
	onClick?: () => void;
	closeButton?: boolean;
	setValue?: (field: string) => void;
}

const ModalInput = (props: ModalInputProps) => {
	const {
		description,
		icon,
		isOpen,
		onClick,
		onClose,
		title,
		variant,
		closeButton = true,
		placeholderInput,
		setValue,
		...othersProps
	} = props;
	const { t } = useTranslation('global');
	const isLoading = (variant && variant === 'loading') ?? false;
	const form = useForm();
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
							// src={getIcon()}
							width='54px'
							height='54px'
						/>
					</ModalHeader>
				)}
				{isLoading && <HederaSpinner />}
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
					<InputController
						control={form.control}
						rules={{
							required: t('global:validations.required') ?? propertyNotFound,
							validate: {
								validation: (value: string) => {
									// fractionalFeeRequest.fee.max = value;
									// const res = handleRequestValidation(
									// 	fractionalFeeRequest.fee.validate('max'),
									// );
									// return res;
									return true;
								},
							},
						}}
						name={`tokenId`}
						placeholder={placeholderInput}
						isReadOnly={false}
					/>
				</ModalBody>
				{!isLoading && (
					<ModalFooter alignSelf='center' pt='24px' pb='0'>
						<Button
							data-testid='modal-notification-button'
							onClick={() => {
								onClose();
								setValue?.(form.getValues('tokenId'));
							}}
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

export default ModalInput;
