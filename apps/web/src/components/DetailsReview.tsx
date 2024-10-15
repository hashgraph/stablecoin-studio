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
	value: any; // TODO: string | number
	valueInBold?: boolean;
	copyButton?: boolean;
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

let fieldsCanEdit = [
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
	keySelection: string,
	keyName: string,
	accountInfo: AccountViewModel,
	getValues: UseFormGetValues<FieldValues>,
): RequestPublicKey | undefined => {
	const values = getValues();

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

	return Account.NullPublicKey;
};

const keyToString = (
	keySelection: any,
	keyName: string,
	accountInfo: AccountViewModel,
	getValues: UseFormGetValues<FieldValues>,
): string => {
	if (keySelection) {
		if (keySelection.label === 'Current user key' || keySelection.label === 'The smart contract')
			return keySelection.label;
		return maskPublicKeys(formatKey(keySelection.label, keyName, accountInfo, getValues)!.key);
	} else {
		return 'None';
	}
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

	useEffect(() => {
		fieldsCanEdit = fieldsCanEdit.filter((field) => !field.id.includes('key'));
		editable &&
			details.forEach((item) => {
				if (allowedKeys.includes(item.label) && item.value !== 'NONE')
					fieldsCanEdit.push({
						id: item.label,
						type: 'key',
					});
			});
	}, [details]);

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
		value: string;
		label: string;
		hashScanURL?: string;
	}) => {
		if (value.includes('SMART')) {
			return { value: 1, label: 'The smart contract' };
		}

		if (value.substring(0, 6) === accountInfo?.publicKey?.key.substring(0, 6)) {
			return { value: 2, label: 'Current user key' };
		}

		setValue(`${label.toLowerCase()}Other`, hashScanURL?.split('account/')[1]);
		return { value: 3, label: 'Other key' };
	};

	if (isLoading && editMode) return <AwaitingWalletSignature />;

	const { t } = useTranslation(['global', 'stableCoinDetails', 'updateToken']);
	const currentExpirationTime: Detail | undefined = details.find(
		(obj) => obj.label === 'Expiration time',
	);
	const maximumExpirationTime: Date = currentExpirationTime
		? new Date(currentExpirationTime.value)
		: new Date();
	maximumExpirationTime.setFullYear(maximumExpirationTime.getFullYear() + 5);

	const handleUpdateToken: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		try {
			onLoading();
			if (
				!selectedStableCoin?.proxyAddress ||
				!selectedStableCoin?.proxyAdminAddress ||
				!selectedStableCoin?.tokenId
			) {
				onError();
				return;
			}
			// @ts-ignore
			const request: UpdateRequest = {
				tokenId: details.find((detail) => detail.label === 'Token id')?.value as string,
				name: getValues().name,
				symbol: getValues().symbol,
				metadata: getValues().metadata,
				autoRenewPeriod: daysToSeconds(getValues()['autorenew period']),
				expirationTimestamp: Date.parse(getValues()['expiration time']) * 1000000 + '',
			};
			if (getValues()['freeze key']) {
				request.freezeKey = formatKey(
					getValues()['freeze key'].label,
					'freeze key',
					accountInfo,
					getValues,
				);
			}
			if (getValues()['wipe key']) {
				request.wipeKey = formatKey(
					getValues()['wipe key'].label,
					'wipe key',
					accountInfo,
					getValues,
				);
			}
			if (getValues()['pause key']) {
				request.pauseKey = formatKey(
					getValues()['pause key'].label,
					'pause key',
					accountInfo,
					getValues,
				);
			}
			if (getValues()['kyc key']) {
				request.kycKey = formatKey(getValues()['kyc key'].label, 'kyc key', accountInfo, getValues);
			}
			if (getValues()['fee schedule key']) {
				request.feeScheduleKey = formatKey(
					getValues()['fee schedule key'].label,
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
											minimumDate={new Date(detail.value)}
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
									) : typeof detail.value === 'string' || typeof detail.value === 'number' ? (
										<HStack {...(detail.valueInBold ? textInBoldProps : commonTextProps)}>
											<Text>{detail.value.toString()}</Text>
											{detail.copyButton && (
												<TooltipCopy valueToCopy={detail.value.toString() ?? ''}>
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
					onClose: onCloseModalAction,
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
