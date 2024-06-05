import { Heading, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import OperationLayout from '../OperationLayout';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import ModalsHandler from '../../../components/ModalsHandler';
import { useDispatch, useSelector } from 'react-redux';
import {
	LAST_WALLET_SELECTED,
	SELECTED_WALLET_COIN,
	walletActions,
} from '../../../store/slices/walletSlice';
import SDKService from '../../../services/SDKService';
import { handleRequestValidation, validateDecimalsString } from '../../../utils/validationsHelper';
import { useState } from 'react';
import { BigDecimal, BurnRequest, SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';
import { useRefreshCoinInfo } from '../../../hooks/useRefreshCoinInfo';
import { propertyNotFound } from '../../../constant';
import { formatDateTime } from '../../../utils/inputHelper';
import DatePickerController from '../../../components/Form/DatePickerController';

const BurnOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	const dispatch = useDispatch();

	const { decimals = 0 } = selectedStableCoin || {};
	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [request] = useState(
		new BurnRequest({
			amount: '0',
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
			startDate: undefined,
		}),
	);
	const selectedWallet = useSelector(LAST_WALLET_SELECTED);

	useRefreshCoinInfo();

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['burn', 'global', 'operations', 'multiSig']);

	const handleBurn: ModalsHandlerActionsProps['onConfirm'] = async ({
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
			await SDKService.burn(request);
			const requestAmount = BigDecimal.fromString(request.amount, decimals);
			dispatch(
				walletActions.setSelectedStableCoin({
					...selectedStableCoin,
					totalSupply: selectedStableCoin.totalSupply?.subUnsafe(requestAmount),
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

	const successDescription =
		selectedWallet === SupportedWallets.MULTISIG
			? t('multiSig:opValidationMessage')
			: t('burn:modalSuccessDesc', {
					amount: getValues().amount,
					account: getValues().destinationAccount,
			  });

	return (
		<>
			<OperationLayout
				LeftContent={
					<>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t('burn:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('burn:operationTitle')}
						</Text>
						<Stack as='form' spacing={6}>
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
								label={t('burn:amountLabel') ?? propertyNotFound}
								placeholder={t('burn:amountPlaceholder') ?? propertyNotFound}
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
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={successDescription}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t('burn:modalAction.subtitle'),
					confirmButtonLabel: t('burn:modalAction.accept'),
					onConfirm: handleBurn,
				}}
				ModalActionChildren={
					selectedWallet === SupportedWallets.MULTISIG ? (
						<DetailsReview
							title={t('burn:modalAction.subtitle')}
							details={[
								{
									label: t('burn:modalAction.amount'),
									value: getValues().amount,
									valueInBold: true,
								},
								{
									label: t('multiSig:startDate'),
									value: formatDateTime({ dateTime: getValues().startDate, isUTC: false }),
									valueInBold: true,
								},
							]}
						/>
					) : (
						<DetailsReview
							title={t('burn:modalAction.subtitle')}
							details={[
								{
									label: t('burn:modalAction.amount'),
									value: getValues().amount,
									valueInBold: true,
								},
							]}
						/>
					)
				}
			/>
		</>
	);
};

export default BurnOperation;
