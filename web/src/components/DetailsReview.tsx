import type { FlexProps as ChakraFlexProps, TextProps as ChakraTextProps } from '@chakra-ui/react';
import {
	Box,
	Button,
	Divider,
	Flex,
	HStack,
	Link,
	Stack,
	Text,
	useBoolean,
	useDisclosure,
} from '@chakra-ui/react';
import type {
	AccountViewModel,
	RequestPublicKey,
	UpdateRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import { Account } from '@hashgraph/stablecoin-npm-sdk';
import { useEffect, useState } from 'react';
import type { FieldValues, UseFormGetValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { SDKService } from '../services/SDKService';
import ModalsHandler from './ModalsHandler';
import type { ModalsHandlerActionsProps } from './ModalsHandler';
import { SELECTED_WALLET_ACCOUNT_INFO, SELECTED_WALLET_COIN } from '../store/slices/walletSlice';
import AwaitingWalletSignature from './AwaitingWalletSignature';
import DatePickerController from './Form/DatePickerController';
import InputController from './Form/InputController';
import InputNumberController from './Form/InputNumberController';
import { RouterManager } from '../Router/RouterManager';
import Icon from './Icon';
import { KeySelector } from './KeySelector';
import TooltipCopy from './TooltipCopy';
import MaskData from 'maskdata';

export interface Detail {
	label: string;
	labelInBold?: boolean;
	value: any; // TODO: string | number | { primary: string; secondary: string }
	valueInBold?: boolean;
	copyButton?: boolean;
	copyValue?: string; // Optional: value to copy (overrides detail.value for copy)
	hashScanURL?: string;
}

export interface DetailsReviewProps {
	details: Detail[];
	divider?: boolean;
	title?: string | null;
	titleProps?: ChakraTextProps;
	contentProps?: ChakraFlexProps;
	isLoading?: boolean;
	editable?: boolean;
	getStableCoinDetails?: () => Promise<void>;
}

const allowedKeys = ['KYC key', 'Freeze key', 'Wipe key', 'Pause key', 'Fee schedule key'];

const baseFieldsCanEdit = [
	{
		id: 'Name',
		type: 'text',
	},
	{
		id: 'Symbol',
		type: 'text',
	},
	{
		id: 'Expiration time',
		type: 'date',
	},
	{
		id: 'Autorenew period',
		type: 'number',
	},
	{
		id: 'Metadata',
		type: 'text',
	},
];

const commonTextProps: ChakraTextProps = {
	fontSize: '14px',
	fontWeight: 500,
	lineHeight: '17px',
	color: 'brand.gray',
	wordBreak: 'break-all',
};

const textInBoldProps: ChakraTextProps = {
	...commonTextProps,
	fontWeight: 700,
	color: 'brand.black',
};

const daysToSeconds = (days: number): string => {
	return (days * 24 * 60 * 60).toString();
};

const formatKey = (
	keySelection: { value: number; label: string } | string,
	keyName: string,
	accountInfo: AccountViewModel,
	getValues: UseFormGetValues<FieldValues>,
): RequestPublicKey | undefined => {
	const values = getValues();

	// Handle object from KeySelector (has value property)
	if (typeof keySelection === 'object' && keySelection !== null && 'value' in keySelection) {
		if (keySelection.value === 1) {
			// Current user key
			return accountInfo.publicKey;
		}
		if (keySelection.value === 2) {
			// The smart contract
			return Account.NullPublicKey;
		}
		if (keySelection.value === 3) {
			// Other key
			const param = Object.keys(values).find((key) => key.includes(keyName + 'Other'));
			return {
				key: param ? values[param] : '',
			};
		}
	}

	// Handle string (legacy, for backward compatibility)
	if (typeof keySelection === 'string') {
		if (keySelection === 'Current user key') {
			return accountInfo.publicKey;
		}

		if (keySelection === 'Other key') {
			const param = Object.keys(values).find((key) => key.includes(keyName + 'Other'));
			return {
				key: param ? values[param] : '',
			};
		}

		if (keySelection === 'None') return undefined;
	}

	return Account.NullPublicKey;
};

const keyToString = (
	keySelection: any,
	keyName: string,
	accountInfo: AccountViewModel,
	getValues: UseFormGetValues<FieldValues>,
): string => {
	if (!keySelection) {
		return 'None';
	}

	// Handle object from KeySelector (has value property)
	if (typeof keySelection === 'object' && keySelection !== null && 'value' in keySelection) {
		if (keySelection.value === 1) {
			// Current user key
			return keySelection.label || 'Current user key';
		}
		if (keySelection.value === 2) {
			// The smart contract
			return keySelection.label || 'The smart contract';
		}
		if (keySelection.value === 3) {
			// Other key - show masked version
			const param = Object.keys(getValues()).find((key) => key.includes(keyName + 'Other'));
			if (param && getValues()[param]) {
				return maskPublicKeys(getValues()[param]);
			}
			return 'Other key';
		}
	}

	// Legacy string-based handling
	if (keySelection.label === 'Current user key' || keySelection.label === 'The smart contract') {
		return keySelection.label;
	}

	return 'Unknown key type';
};

const maskPublicKeys = (key: string): string => {
	const maskJSONOptions = {
		maskWith: '.',
		unmaskedStartCharacters: 4,
		unmaskedEndCharacters: 4,
	};
	return MaskData.maskPassword(key, maskJSONOptions);
};

const DetailsReview = ({
	details,
	divider = true,
	title,
	titleProps,
	contentProps,
	isLoading,
	editable = false,
	getStableCoinDetails,
}: DetailsReviewProps) => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const handleCloseConfirmationModal = () => {
		// Simply close the modal without navigating or changing edit mode
		onCloseModalAction();
	};

	const { control, setValue, reset, getValues } = useForm({
		mode: 'onChange',
	});

	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();

	const navigate = useNavigate();
	const handleCloseModal = () => {
		RouterManager.goBack(navigate);
	};

	const [editMode, setEditMode] = useBoolean(false);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	const [fieldsCanEdit, setFieldsCanEdit] = useState(() => [...baseFieldsCanEdit]);

	useEffect(() => {
		const newFields = [...baseFieldsCanEdit];
		if (editable) {
			details.forEach((item) => {
				if (allowedKeys.includes(item.label) && item.value !== 'NONE') {
					newFields.push({
						id: item.label,
						type: 'key',
					});
				}
			});
		}
		setFieldsCanEdit(newFields);
	}, [details, editable]);

	const handleEditMode = () => {
		if (!editMode) {
			setValue('name', details.find((item) => item.label === 'Name')?.value);
			setValue('symbol', details.find((item) => item.label === 'Symbol')?.value);
			setValue(
				'autorenew period',
				details.find((item) => item.label === 'Autorenew period')?.value,
			);
			setValue('expiration time', details.find((item) => item.label === 'Expiration time')?.value);
			setValue('metadata', details.find((item) => item.label === 'Metadata')?.value);

			fieldsCanEdit.find((fields) => fields.id === 'Freeze key') &&
				setValue(
					'freeze key',
					formatDetailToKey(details.find((item) => item.label === 'Freeze key')!),
				);

			fieldsCanEdit.find((fields) => fields.id === 'Pause key') &&
				setValue(
					'pause key',
					formatDetailToKey(details.find((item) => item.label === 'Pause key')!),
				);
			fieldsCanEdit.find((fields) => fields.id === 'Wipe key') &&
				setValue('wipe key', formatDetailToKey(details.find((item) => item.label === 'Wipe key')!));
			fieldsCanEdit.find((fields) => fields.id === 'KYC key') &&
				setValue('kyc key', formatDetailToKey(details.find((item) => item.label === 'KYC key')!));
			fieldsCanEdit.find((fields) => fields.id === 'Fee schedule key') &&
				setValue(
					'fee schedule key',
					formatDetailToKey(details.find((item) => item.label === 'Fee schedule key')!),
				);
		} else {
			reset();
		}

		setEditMode.toggle();
	};

	const formatDetailToKey = ({
		value,
		label,
		hashScanURL,
	}: {
		value: any; // Can be string or { primary: string; secondary: string }
		label: string;
		hashScanURL?: string;
	}) => {
		// Handle object format (new format with primary/secondary)
		// Now: primary = Account ID, secondary = Label (Current user account, Hedera Token Manager smart contract, etc)
		if (typeof value === 'object' && value?.secondary) {
			if (value.secondary.includes('Hedera Token Manager smart contract')) {
				return { value: 2, label: 'Hedera Token Manager smart contract' };
			}
			if (value.secondary.includes('Current user account')) {
				return { value: 1, label: 'Current user account' };
			}
			if (value.secondary.includes('Other account')) {
				// Extract the account ID from primary to save in the form
				setValue(`${label.toLowerCase()}Other`, value.primary);
				return { value: 3, label: 'Other account' };
			}
		}

		// Handle string format (legacy/other keys)
		const valueStr = typeof value === 'string' ? value : '';

		if (valueStr.includes('Hedera Token Manager smart contract')) {
			return { value: 2, label: 'Hedera Token Manager smart contract' };
		}

		// Check if it's the current user by comparing:
		// 1. The displayed value with "Current user account"
		// 2. The public key (first 6 chars)
		// 3. The account ID from the hashScanURL
		if (valueStr.includes('Current user account')) {
			return { value: 1, label: 'Current user account' };
		}

		if (accountInfo?.publicKey?.key && valueStr.substring(0, 6) === accountInfo.publicKey.key.substring(0, 6)) {
			return { value: 1, label: 'Current user account' };
		}

		// Check if the account ID in the URL matches the current user's account ID
		const accountIdFromUrl = hashScanURL?.split('account/')[1] || hashScanURL?.split('contract/')[1];
		if (accountIdFromUrl && accountIdFromUrl === accountInfo?.id) {
			return { value: 1, label: 'Current user account' };
		}

		setValue(`${label.toLowerCase()}Other`, accountIdFromUrl || valueStr);
		return { value: 3, label: 'Other account' };
	};

	if (isLoading && editMode) return <AwaitingWalletSignature />;

	const { t } = useTranslation(['global', 'stableCoinDetails', 'updateToken']);
	const currentExpirationTime: Detail | undefined = details.find(
		(obj) => obj.label === 'Expiration time',
	);
	// SDK validation: expiration time must be between now+1 day and now+730 days (2 years)
	const minimumExpirationTime: Date = new Date();
	minimumExpirationTime.setDate(minimumExpirationTime.getDate() + 1);

	const maximumExpirationTime: Date = new Date();
	maximumExpirationTime.setDate(maximumExpirationTime.getDate() + 730); // 2 years from now

	const handleUpdateToken: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		try {
			onLoading();
			if (!selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			// @ts-ignore
			const request: UpdateRequest = {
				tokenId: details.find((detail) => detail.label === 'Token id')?.value as string,
			};

			// Only send fields that have values (were edited)
			const formValues = getValues();

			if (formValues.name) request.name = formValues.name;
			if (formValues.symbol) request.symbol = formValues.symbol;
			if (formValues.metadata !== undefined) request.metadata = formValues.metadata;

			const autoRenewValue = formValues['autorenew period'];
			if (autoRenewValue) {
				// Parse "90 days" format
				const days = parseInt(autoRenewValue);
				if (!isNaN(days)) {
					request.autoRenewPeriod = daysToSeconds(days);
				}
			}

			const expirationValue = formValues['expiration time'];
			if (expirationValue) {
				let timestamp: number;
				// DatePickerController returns a Date object
				if (expirationValue instanceof Date) {
					timestamp = expirationValue.getTime(); // Returns milliseconds since epoch
				} else {
					// Fallback to parsing if it's a string
					timestamp = Date.parse(expirationValue);
				}

				if (!isNaN(timestamp)) {
					// Convert milliseconds to nanoseconds
					request.expirationTimestamp = (timestamp * 1000000).toString();
				}
			}
			// Only send keys that were edited
			if (formValues['freeze key']) {
				request.freezeKey = formatKey(
					formValues['freeze key'],
					'freeze key',
					accountInfo,
					getValues,
				);
			}
			if (formValues['wipe key']) {
				request.wipeKey = formatKey(
					formValues['wipe key'],
					'wipe key',
					accountInfo,
					getValues,
				);
			}
			if (formValues['pause key']) {
				request.pauseKey = formatKey(
					formValues['pause key'],
					'pause key',
					accountInfo,
					getValues,
				);
			}
			if (formValues['kyc key']) {
				request.kycKey = formatKey(formValues['kyc key'], 'kyc key', accountInfo, getValues);
			}
			if (formValues['fee schedule key']) {
				request.feeScheduleKey = formatKey(
					formValues['fee schedule key'],
					'fee schedule key',
					accountInfo,
					getValues,
				);
			}
			request.validate = () => [];
			await SDKService.updateStableCoin(request);
			setTimeout(() => {
				setEditMode.off();
				getStableCoinDetails && getStableCoinDetails();
			}, 3000);
			onSuccess();
		} catch (error: any) {
			console.log(JSON.stringify(error));
			setErrorTransactionUrl(error.transactionUrl);
			setErrorOperation(error.message);
			onError();
		}
	};

	return (
		<Box textAlign='left' data-testid='button-box'>
			<Flex justify='space-between' mb={6} alignItems='center'>
				{title && (
					<Text
						data-testid='details-review-title'
						fontSize='16px'
						fontWeight={600}
						color='brand.gray'
						{...titleProps}
					>
						{title}
					</Text>
				)}
				{editable && (
					<>
						{editMode ? (
							<Icon
								fontSize={16}
								name='X'
								onClick={handleEditMode}
								_hover={{ cursor: 'pointer' }}
							/>
						) : (
							<Icon
								fontSize={16}
								name='Pen'
								onClick={handleEditMode}
								_hover={{ cursor: 'pointer' }}
							/>
						)}
					</>
				)}
			</Flex>
			<Box>
				{details.map((detail: Detail, index: number, details: Detail[]) => (
					<Box key={`details-review-detail-${index}`}>
						<Flex
							data-testid={`details-review-detail-${index}`}
							justifyContent='space-between'
							{...contentProps}
						>
							<Text
								whiteSpace={'nowrap'}
								{...(detail.labelInBold ? textInBoldProps : commonTextProps)}
							>
								{detail.label}
							</Text>
							{editMode && fieldsCanEdit.map((field) => field.id).includes(detail.label) ? (
								<>
									{fieldsCanEdit.find((field) => field.id === detail.label)?.type === 'text' && (
										<InputController
											control={control}
											name={detail.label.toLowerCase()}
											placeholder={detail.label}
											containerStyle={{
												w: '300px',
											}}
										/>
									)}
									{fieldsCanEdit.find((field) => field.id === detail.label)?.type === 'number' && (
										<InputNumberController
											rules={{
												validate: {
													validation: (value: number) => {
														const res = t('updateToken:updatingValidation.autoRenewPeriod');
														return detail.label === t('stableCoinDetails:autoRenewPeriod') &&
															(value > 92 || value < 30)
															? res
															: true;
													},
												},
											}}
											control={control}
											name={detail.label.toLowerCase()}
											placeholder={detail.label}
											containerStyle={{
												w: '300px',
											}}
										/>
									)}
									{fieldsCanEdit.find((field) => field.id === detail.label)?.type === 'date' && (
										<DatePickerController
											control={control}
											name={detail.label.toLowerCase()}
											placeholder={detail.label}
											containerStyle={{
												w: '300px',
											}}
											minimumDate={minimumExpirationTime}
											maximumDate={maximumExpirationTime}
											customHeader={false}
											showMonthDropdown
											showYearDropdown
										/>
									)}
									{fieldsCanEdit.find((field) => field.id === detail.label)?.type === 'key' && (
										<Stack w='300px'>
											<KeySelector
												control={control}
												name={detail.label.toLowerCase()}
												label=''
												labelPlaceholder={detail.label}
											/>
										</Stack>
									)}
								</>
							) : (
								<>
									{typeof detail.value === 'string' && detail.value.includes('GMT') ? (
										<Text {...commonTextProps}>{new Date(detail.value).toDateString()}</Text>
									) : typeof detail.value === 'object' && detail.value?.primary && detail.value?.secondary ? (
										// Render two-line format for keys with primary (label) and secondary (Account ID)
										<HStack {...(detail.valueInBold ? textInBoldProps : commonTextProps)} alignItems='flex-start' spacing={2}>
											<Stack spacing={0} flex={1} alignItems='flex-end'>
												<Text fontWeight={600}>{detail.value.primary}</Text>
												<Text fontSize='12px' color='brand.gray' opacity={0.8}>
													{detail.value.secondary}
												</Text>
											</Stack>
											{detail.copyButton && (
												<TooltipCopy valueToCopy={detail.copyValue ?? detail.value.secondary ?? ''}>
													<Icon name='Copy' />
												</TooltipCopy>
											)}
											{detail.hashScanURL && (
												<Link isExternal={true} href={`${detail.hashScanURL}`}>
													<Icon name='ArrowSquareOut' />
												</Link>
											)}
										</HStack>
									) : typeof detail.value === 'string' || typeof detail.value === 'number' ? (
										<HStack {...(detail.valueInBold ? textInBoldProps : commonTextProps)}>
											<Text>{detail.value.toString()}</Text>
											{detail.copyButton && (
												<TooltipCopy valueToCopy={detail.copyValue ?? detail.value.toString() ?? ''}>
													<Icon name='Copy' />
												</TooltipCopy>
											)}
											{detail.hashScanURL && (
												<Link isExternal={true} href={`${detail.hashScanURL}`}>
													<Icon name='ArrowSquareOut' />
												</Link>
											)}
										</HStack>
									) : detail.value && 'toString' in detail.value && 'value' in detail.value ? (
										detail.value.toString()
									) : (
										detail.value
									)}
								</>
							)}
						</Flex>
						{divider && details.length !== index + 1 && (
							<Divider title='divider' mt='13px' mb='13px' />
						)}
					</Box>
				))}
				{editMode && (
					<HStack mt={10} justify={'flex-end'}>
						<Button onClick={handleEditMode} variant='secondary'>
							Cancel
						</Button>
						{/* @ts-ignore TODO: add T generic in controllers */}
						<Button onClick={onOpenModalAction}>Save</Button>
					</HStack>
				)}
			</Box>

			<ModalsHandler
				errorNotificationTitle={t('operations:modalErrorTitle')}
				errorNotificationDescription={errorOperation}
				errorTransactionUrl={errorTransactionUrl}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: handleCloseConfirmationModal,
					title: t('updateToken:modalAction.subtitle'),
					confirmButtonLabel: t('updateToken:modalAction.accept'),
					onConfirm: handleUpdateToken,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t('updateToken:modalAction.subtitle')}
						details={[
							{
								label: t('stableCoinDetails:name'),
								value: getValues().name,
								valueInBold: true,
							},
							{
								label: t('stableCoinDetails:symbol'),
								value: getValues().symbol,
								valueInBold: true,
							},
							{
								label: t('stableCoinDetails:metadata'),
								value: getValues().metadata,
								valueInBold: true,
							},
							{
								label: t('stableCoinDetails:autoRenewPeriod'),
								value: getValues()['autorenew period'],
								valueInBold: true,
							},
							{
								label: t('stableCoinDetails:expirationTime'),
								value: new Date(Date.parse(getValues()['expiration time'])).toString(),
								valueInBold: true,
							},
							{
								label: t('stableCoinDetails:kycKey'),
								value: keyToString(getValues()['kyc key'], 'kyc key', accountInfo, getValues),
								valueInBold: true,
							},
							{
								label: t('stableCoinDetails:freezeKey'),
								value: keyToString(getValues()['freeze key'], 'freeze key', accountInfo, getValues),
								valueInBold: true,
							},
							{
								label: t('stableCoinDetails:wipeKey'),
								value: keyToString(getValues()['wipe key'], 'wipe key', accountInfo, getValues),
								valueInBold: true,
							},
							{
								label: t('stableCoinDetails:pauseKey'),
								value: keyToString(getValues()['pause key'], 'pause key', accountInfo, getValues),
								valueInBold: true,
							},
							{
								label: t('stableCoinDetails:feeScheduleKey'),
								value: keyToString(
									getValues()['fee schedule key'],
									'fee schedule key',
									accountInfo,
									getValues,
								),
								valueInBold: true,
							},
						]}
					/>
				}
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={t('operations:modalSuccessDesc')}
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</Box>
	);
};

export default DetailsReview;
