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
} from '@chakra-ui/react';
import type { AccountViewModel, RequestPublicKey, UpdateRequest } from 'hedera-stable-coin-sdk';
import { Account } from 'hedera-stable-coin-sdk';
import { useEffect } from 'react';
import type { FieldValues, UseFormGetValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { SDKService } from '../services/SDKService';
import { SELECTED_WALLET_ACCOUNT_INFO } from '../store/slices/walletSlice';
import AwaitingWalletSignature from './AwaitingWalletSignature';
import DatePickerController from './Form/DatePickerController';
import InputController from './Form/InputController';
import InputNumberController from './Form/InputNumberController';
import Icon from './Icon';
import { KeySelector } from './KeySelector';
import TooltipCopy from './TooltipCopy';

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

interface SubmitValues {
	name: string;
	symbol: string;
	'autorenew period': number;
	'expiration time': string;
	'kyc key'?: { value: number; label: string };
	'kyc keyOther'?: string;
	'freeze key'?: { value: number; label: string };
	'freeze keyOther'?: string;
	'wipe key'?: { value: number; label: string };
	'wipe keyOther'?: string;
	'pause key'?: { value: number; label: string };
	'pause keyOther'?: string;
	'fee schedule key'?: { value: number; label: string };
	'fee schedule keyOther'?: string;
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
	const { control, setValue, handleSubmit, reset, getValues } = useForm({
		mode: 'onChange',
	});

	const [editMode, setEditMode] = useBoolean(false);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
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

	const onSubmit = async (values: SubmitValues) => {
		// @ts-ignore
		const request: UpdateRequest = {
			tokenId: details.find((detail) => detail.label === 'Token id')?.value as string,
			name: values.name,
			symbol: values.symbol,
			autoRenewPeriod: daysToSeconds(values['autorenew period']),
			expirationTimestamp: Date.parse(values['expiration time']) * 1000000 + '',
		};
		if (values['freeze key']) {
			request.freezeKey = formatKey(
				values['freeze key'].label,
				'freeze key',
				accountInfo,
				getValues,
			);
		}

		if (values['wipe key']) {
			request.wipeKey = formatKey(values['wipe key'].label, 'wipe key', accountInfo, getValues);
		}
		if (values['pause key']) {
			request.pauseKey = formatKey(values['pause key'].label, 'pause key', accountInfo, getValues);
		}
		if (values['kyc key']) {
			request.kycKey = formatKey(values['kyc key'].label, 'kyc key', accountInfo, getValues);
		}
		if (values['fee schedule key']) {
			request.feeScheduleKey = formatKey(
				values['fee schedule key'].label,
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
	};

	if (isLoading && editMode) return <AwaitingWalletSignature />;

	const { t } = useTranslation(['global', 'stableCoinDetails']);
	const currentExpirationTime: Detail | undefined = details.find(
		(obj) => obj.label === 'Expiration time',
	);
	const maximumExpirationTime: Date = currentExpirationTime
		? new Date(currentExpirationTime.value)
		: new Date();
	maximumExpirationTime.setFullYear(maximumExpirationTime.getFullYear() + 5);

	return (
		<Box textAlign='left'>
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
														const res = t('stableCoinDetails:updatingValidation.autoRenewPeriod');
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
									) : 'toString' in detail.value && 'value' in detail.value ? (
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
						<Button onClick={handleSubmit(onSubmit)}>Save</Button>
					</HStack>
				)}
			</Box>
		</Box>
	);
};

export default DetailsReview;
