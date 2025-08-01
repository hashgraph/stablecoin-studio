import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import DatePickerController from '../../../components/Form/DatePickerController';
import SDKService from '../../../services/SDKService';
import { handleRequestValidation, validateDecimalsString } from '../../../utils/validationsHelper';
import OperationLayout from './../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import { useDispatch, useSelector } from 'react-redux';
import {
	LAST_WALLET_SELECTED,
	SELECTED_WALLET_COIN,
	walletActions,
} from '../../../store/slices/walletSlice';
import { useState } from 'react';
import { BigDecimal, CashInRequest, SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';
import { useRefreshCoinInfo } from '../../../hooks/useRefreshCoinInfo';
import { propertyNotFound } from '../../../constant';
import { formatDateTime } from '../../../utils/inputHelper';

const CashInOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const { decimals = 0 } = selectedStableCoin || {};
	const selectedWallet = useSelector(LAST_WALLET_SELECTED);

	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();

	const dispatch = useDispatch();

	const [request] = useState(
		new CashInRequest({
			amount: '0',
			targetId: '',
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
			startDate: undefined,
		}),
	);

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['cashIn', 'global', 'operations', 'multiSig']);

	useRefreshCoinInfo();

	const successDescription =
		selectedWallet === SupportedWallets.MULTISIG
			? t('multiSig:opValidationMessage')
			: t('operations:modalSuccessDesc');

	const handleCashIn: ModalsHandlerActionsProps['onConfirm'] = async ({
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
			await SDKService.cashIn(request);
			const requestAmount = BigDecimal.fromString(request.amount, decimals);
			dispatch(
				walletActions.setSelectedStableCoin({
					...selectedStableCoin,
					totalSupply: selectedStableCoin.totalSupply?.addUnsafe(requestAmount),
				}),
			);
			onSuccess();
		} catch (error: any) {
			console.log(JSON.stringify(error));
			setErrorTransactionUrl(error.transactionUrl);
			setErrorOperation(error.message);
			onError();
		}
	};

	return (
		<>
			<OperationLayout
				LeftContent={
					<>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t('cashIn:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('cashIn:operationTitle')}
						</Text>
						<Stack as='form' spacing={6} maxW='520px'>
							<InputController
								rules={{
									required: t(`global:validations.required`) ?? propertyNotFound,
									validate: {
										validDecimals: (value: string) => {
											return (
												validateDecimalsString(value, decimals) ||
												(t('global:validations.decimalsValidation') ?? propertyNotFound)
											);
										},
										validation: (value: string) => {
											request.amount = value;
											const res = handleRequestValidation(request.validate('amount'));
											return res;
										},
									},
								}}
								isRequired
								control={control}
								name={'amount'}
								label={t('cashIn:amountLabel') ?? propertyNotFound}
								placeholder={t('cashIn:amountPlaceholder') ?? propertyNotFound}
							/>
							<InputController
								rules={{
									required: t('global:validations.required') ?? propertyNotFound,
									validate: {
										validation: (value: string) => {
											request.targetId = value;
											const res = handleRequestValidation(request.validate('targetId'));
											return res;
										},
									},
								}}
								isRequired
								control={control}
								name='destinationAccount'
								placeholder={t('cashIn:destinationAccountPlaceholder') ?? propertyNotFound}
								label={t('cashIn:destinationAccountLabel') ?? propertyNotFound}
							/>
							{selectedWallet === SupportedWallets.MULTISIG && (
								<DatePickerController
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
										validate: {
											validation: (value: Date) => {
												request.startDate = formatDateTime({ dateTime: value });
												const res = handleRequestValidation(request.validate('startDate'));
												return res;
											},
										},
									}}
									isRequired
									showTimeSelect
									placeholderText='Select date and time'
									dateFormat="yyyy-MM-dd'T'HH:mm:ss"
									control={control}
									name='startDate'
									label={t('multiSig:startDate') ?? propertyNotFound}
									minimumDate={new Date()}
									timeFormat='HH:mm'
									timeIntervals={15}
								/>
							)}
						</Stack>
					</>
				}
				onConfirm={onOpenModalAction}
				confirmBtnProps={{ isDisabled: !formState.isValid }}
			/>
			<ModalsHandler
				errorNotificationTitle={t('operations:modalErrorTitle')}
				errorNotificationDescription={errorOperation}
				errorTransactionUrl={errorTransactionUrl}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t('cashIn:modalAction.subtitle'),
					confirmButtonLabel: t('cashIn:modalAction.accept'),
					onConfirm: handleCashIn,
				}}
				ModalActionChildren={
					selectedWallet === SupportedWallets.MULTISIG ? (
						<DetailsReview
							title={t('cashIn:modalAction.subtitle')}
							details={[
								{
									label: t('cashIn:modalAction.destinationAccount'),
									value: getValues().destinationAccount,
								},
								{
									label: t('cashIn:modalAction.amount'),
									value: getValues().amount,
									valueInBold: true,
								},
								{
									label: t('multiSig:modalAction.startDate'),
									value: formatDateTime({ dateTime: getValues().startDate, isUTC: false }),
									valueInBold: true,
								},
							]}
						/>
					) : (
						<DetailsReview
							title={t('cashIn:modalAction.subtitle')}
							details={[
								{
									label: t('cashIn:modalAction.destinationAccount'),
									value: getValues().destinationAccount,
								},
								{
									label: t('cashIn:modalAction.amount'),
									value: getValues().amount,
									valueInBold: true,
								},
							]}
						/>
					)
				}
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={successDescription}
			/>
		</>
	);
};

export default CashInOperation;
