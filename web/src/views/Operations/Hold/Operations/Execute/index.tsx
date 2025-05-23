import { Heading, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET_COIN } from '../../../../../store/slices/walletSlice';
import { useState } from 'react';
import { ExecuteHoldRequest } from '@hashgraph/stablecoin-npm-sdk';
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
import DetailsReview from '../../../../../components/DetailsReview';
import InputNumberController from '../../../../../components/Form/InputNumberController';

export const ExecuteOperationHold = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	const { decimals = 0 } = selectedStableCoin || {};
	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [request] = useState(
		new ExecuteHoldRequest({
			amount: '0',
			holdId: 0,
			sourceId: '',
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
			targetId: '',
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
			await SDKService.executeHold(request);
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
							{t('operations:hold.execute.title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('operations:hold.execute.operationTitle')}
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
								label={t('operations:hold.execute.amountLabel') ?? propertyNotFound}
								placeholder={t('operations:hold.execute.amountPlaceholder') ?? propertyNotFound}
							/>
							<InputNumberController
								rules={{
									required: t(`global:validations.required`) ?? propertyNotFound,
									validate: {
										validation: (value: number) => {
											request.holdId = value;
											const res = handleRequestValidation(request.validate('holdId'));
											return res;
										},
									},
								}}
								isRequired
								control={control}
								name={'holdId'}
								label={t('operations:hold.execute.holdIdLabel') ?? propertyNotFound}
								placeholder={t('operations:hold.execute.holdIdPlaceholder') ?? propertyNotFound}
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
								name={'targetId'}
								label={t('operations:hold.execute.targetIdLabel') ?? propertyNotFound}
								placeholder={t('operations:hold.execute.targetIdPlaceholder') ?? propertyNotFound}
							/>
							<InputController
								rules={{
									required: t(`global:validations.required`) ?? propertyNotFound,
									validate: {
										validation: (value: string) => {
											request.sourceId = value;
											const res = handleRequestValidation(request.validate('sourceId'));
											return res;
										},
									},
								}}
								isRequired
								control={control}
								name={'sourceId'}
								label={t('operations:hold.execute.sourceIdLabel') ?? propertyNotFound}
								placeholder={t('operations:hold.execute.sourceIdPlaceholder') ?? propertyNotFound}
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
				successNotificationDescription={t('operations:hold.execute.modalSuccessDesc')}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t('operations:hold.execute.modalAction.subtitle'),
					confirmButtonLabel: t('operations:hold.execute.modalAction.accept'),
					onConfirm: handleCreateHold,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t('burn:modalAction.subtitle')}
						details={[
							{
								label: t('operations:hold.execute.modalAction.amount'),
								value: getValues().amount,
								valueInBold: true,
							},
							{
								label: t('operations:hold.execute.modalAction.holdId'),
								value: getValues().holdId,
								valueInBold: true,
							},
							{
								label: t('operations:hold.execute.modalAction.target'),
								value: getValues().targetId,
								valueInBold: true,
							},
							{
								label: t('operations:hold.execute.modalAction.source'),
								value: getValues().sourceId,
								valueInBold: true,
							},
						]}
					/>
				}
			/>
		</>
	);
};
