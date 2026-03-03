import { Heading, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET_COIN } from '../../../../../store/slices/walletSlice';
import { useState } from 'react';
import { BigDecimal, CreateHoldRequest } from '@hashgraph/stablecoin-npm-sdk';
import { useRefreshCoinInfo } from '../../../../../hooks/useRefreshCoinInfo';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ModalsHandler, {
	type ModalsHandlerActionsProps,
} from '../../../../../components/ModalsHandler';
import SDKService from '../../../../../services/SDKService';
import OperationLayout from '../../../OperationLayout';
import InputController from '../../../../../components/Form/InputController';
import { propertyNotFound } from '../../../../../constant';
import {
	handleRequestValidation,
	validateDecimalsString,
} from '../../../../../utils/validationsHelper';
import DatePickerController from '../../../../../components/Form/DatePickerController';
import DetailsReview from '../../../../../components/DetailsReview';
import { formatDateTime } from '../../../../../utils/inputHelper';

export const CreateOperationHold = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	// const dispatch = useDispatch();

	const { decimals = 0 } = selectedStableCoin || {};
	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [request] = useState(
		new CreateHoldRequest({
			amount: '0',
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
			escrow: '',
			expirationDate: '',
			targetId: undefined,
		}),
	);

	useRefreshCoinInfo();

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['hold', 'global', 'operations', 'multiSig']);

	const handleCreateHold: ModalsHandlerActionsProps['onConfirm'] = async ({
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
			console.log(
				'request',
				request,
				new CreateHoldRequest({
					...request,
					amount: BigDecimal.fromString(request.amount, decimals).toString(),
					expirationDate: Math.floor(
						new Date(getValues().expirationDate).getTime() / 1000,
					).toString(),
				}),
			);
			await SDKService.createHold(
				new CreateHoldRequest({
					...request,
					amount: BigDecimal.fromString(request.amount, decimals).toString(),
					expirationDate: Math.floor(
						new Date(getValues().expirationDate).getTime() / 1000,
					).toString(),
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
							{t('operations:hold.create.title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('operations:hold.create.operationTitle')}
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
								label={t('operations:hold.create.amountLabel') ?? propertyNotFound}
								placeholder={t('operations:hold.create.amountPlaceholder') ?? propertyNotFound}
							/>
							<DatePickerController
								rules={{
									required: t('global:validations.required') ?? propertyNotFound,
								}}
								isRequired
								showTimeSelect
								placeholderText={
									t('operations:hold.create.expirationDatePlaceholder') ?? propertyNotFound
								}
								dateFormat="yyyy-MM-dd'T'HH:mm:ss"
								control={control}
								name='expirationDate'
								label={t('operations:hold.create.expirationDateLabel') ?? propertyNotFound}
								minimumDate={new Date()}
								timeFormat='HH:mm'
								timeIntervals={15}
							/>
							<InputController
								rules={{
									required: t(`global:validations.required`) ?? propertyNotFound,
									validate: {
										validation: (value: string) => {
											request.escrow = value;
											const res = handleRequestValidation(request.validate('escrow'));
											return res;
										},
									},
								}}
								isRequired
								control={control}
								name={'escrow'}
								label={t('operations:hold.create.escrowLabel') ?? propertyNotFound}
								placeholder={t('operations:hold.create.escrowPlaceholder') ?? propertyNotFound}
							/>
							<InputController
								rules={{
									required: t(`global:validations.required`) ?? propertyNotFound,
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
								name={'target'}
								label={t('operations:hold.create.destinationLabel') ?? propertyNotFound}
								placeholder={t('operations:hold.create.destinationPlaceholder') ?? propertyNotFound}
							/>
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
				successNotificationDescription={t('operations:hold.create.modalSuccessDesc')}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t('operations:hold.create.modalAction.subtitle'),
					confirmButtonLabel: t('operations:hold.create.modalAction.accept'),
					onConfirm: handleCreateHold,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t('burn:modalAction.subtitle')}
						details={[
							{
								label: t('operations:hold.create.modalAction.amount'),
								value: getValues().amount,
								valueInBold: true,
							},
							{
								label: t('operations:hold.create.modalAction.expirationDate'),
								value: formatDateTime({ dateTime: getValues().expirationDate, isUTC: false }),
								valueInBold: true,
							},
							{
								label: t('operations:hold.create.modalAction.escrow'),
								value: getValues().escrow,
								valueInBold: true,
							},
							{
								label: t('operations:hold.create.modalAction.destination'),
								value: getValues().target,
								valueInBold: true,
							},
						]}
					/>
				}
			/>
		</>
	);
};
