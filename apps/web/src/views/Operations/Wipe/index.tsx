import { Heading, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import ModalsHandler from '../../../components/ModalsHandler';
import SDKService from '../../../services/SDKService';
import {
	LAST_WALLET_SELECTED,
	SELECTED_WALLET_COIN,
	walletActions,
} from '../../../store/slices/walletSlice';

import { handleRequestValidation, validateDecimalsString } from '../../../utils/validationsHelper';
import OperationLayout from '../OperationLayout';
import { BigDecimal, SupportedWallets, WipeRequest } from '@hashgraph/stablecoin-npm-sdk';
import { useRefreshCoinInfo } from '../../../hooks/useRefreshCoinInfo';
import { propertyNotFound } from '../../../constant';
import { formatDateTime } from '../../../utils/inputHelper';
import DatePickerController from '../../../components/Form/DatePickerController';

const WipeOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const { decimals = 0 } = selectedStableCoin || {};

	const dispatch = useDispatch();

	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [request] = useState(
		new WipeRequest({
			amount: '0',
			targetId: '',
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
			startDate: undefined,
		}),
	);
	const selectedWallet = useSelector(LAST_WALLET_SELECTED);

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['wipe', 'global', 'operations', 'multiSig']);

	const successDescription =
		selectedWallet === SupportedWallets.MULTISIG
			? t('multiSig:opValidationMessage')
			: t('wipe:modalSuccessDesc', {
					amount: getValues().amount,
					account: getValues().destinationAccount,
			  });

	useRefreshCoinInfo();

	const handleWipe: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		try {
			onLoading();
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}
			await SDKService.wipe(request);
			const requestAmount = BigDecimal.fromString(request.amount, decimals);
			dispatch(
				walletActions.setSelectedStableCoin({
					...selectedStableCoin,
					totalSupply: selectedStableCoin.totalSupply?.subUnsafe(requestAmount),
				}),
			);
			onSuccess();
		} catch (error: any) {
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
							{t('wipe:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('wipe:operationTitle')}
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
											// return request.validate('amount') || t('wipe:decimalsValidation');
											request.amount = value;
											const res = handleRequestValidation(request.validate('amount'));
											return res;
										},
									},
								}}
								isRequired
								control={control}
								name={'amount'}
								label={t('wipe:amountLabel') ?? propertyNotFound}
								placeholder={t('wipe:amountPlaceholder') ?? propertyNotFound}
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
								placeholder={t('wipe:fromAccountPlaceholder') ?? propertyNotFound}
								label={t('wipe:fromAccountLabel') ?? propertyNotFound}
								onChangeAux={(e) => {
									request.targetId = e.target.value;
								}}
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
					title: t('wipe:modalAction.subtitle'),
					confirmButtonLabel: t('wipe:modalAction.accept'),
					onConfirm: handleWipe,
				}}
				ModalActionChildren={
					selectedWallet === SupportedWallets.MULTISIG ? (
						<DetailsReview
							title={t('wipe:modalAction.subtitle')}
							details={[
								{
									label: t('wipe:modalAction.fromAccount'),
									value: getValues().destinationAccount,
								},
								{
									label: t('wipe:modalAction.amount'),
									value: getValues().amount,
									valueInBold: true,
								},
								{
									label: t('multiSig:startDate'),
									value: formatDateTime({ dateTime: getValues().startDate, isUTC: false }),
								},
							]}
						/>
					) : (
						<DetailsReview
							title={t('wipe:modalAction.subtitle')}
							details={[
								{
									label: t('wipe:modalAction.fromAccount'),
									value: getValues().destinationAccount,
								},
								{
									label: t('wipe:modalAction.amount'),
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

export default WipeOperation;
