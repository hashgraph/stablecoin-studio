import { useState } from 'react';
import { Heading, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import OperationLayout from '../OperationLayout';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import ModalsHandler from '../../../components/ModalsHandler';
import { handleRequestValidation } from '../../../utils/validationsHelper';
import SDKService from '../../../services/SDKService';
import { LAST_WALLET_SELECTED, SELECTED_WALLET_COIN } from '../../../store/slices/walletSlice';

import { KYCRequest, SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';
import { useRefreshCoinInfo } from '../../../hooks/useRefreshCoinInfo';
import { propertyNotFound } from '../../../constant';
import { formatDateTime } from '../../../utils/inputHelper';
import DatePickerController from '../../../components/Form/DatePickerController';

const RevokeKycOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [request] = useState(
		new KYCRequest({
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
			targetId: '',
			startDate: undefined,
		}),
	);

	const { t } = useTranslation(['revokeKYC', 'global', 'operations', 'multiSig']);
	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});
	const selectedWallet = useSelector(LAST_WALLET_SELECTED);

	useRefreshCoinInfo();

	const successDescription =
		selectedWallet === SupportedWallets.MULTISIG
			? t('multiSig:opValidationMessage')
			: t('revokeKYC:modalSuccess', {
					account: getValues().targetAccount,
			  });

	const handleRevokeKyc: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		try {
			onLoading();
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId?.toString()) {
				onError();
				return;
			}

			await SDKService.revokeKyc(request);
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
							{t('revokeKYC:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('revokeKYC:operationTitle')}
						</Text>
						<Stack as='form' spacing={6} maxW='520px'>
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
								name='targetAccount'
								placeholder={t('revokeKYC:accountPlaceholder') ?? propertyNotFound}
								label={t('revokeKYC:accountLabel') ?? propertyNotFound}
							/>
							{selectedWallet === SupportedWallets.MULTISIG ? (
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
							) : (
								<></>
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
					title: t('revokeKYC:modalAction.subtitle'),
					confirmButtonLabel: t('revokeKYC:modalAction.accept'),
					onConfirm: handleRevokeKyc,
				}}
				ModalActionChildren={
					selectedWallet === SupportedWallets.MULTISIG ? (
						<DetailsReview
							title={t('multiSig:modalAction.subtitle')}
							details={[
								{
									label: t('revokeKYC:modalAction.account'),
									value: getValues().targetAccount,
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
							title={t('revokeKYC:modalAction.subtitle')}
							details={[
								{
									label: t('revokeKYC:modalAction.account'),
									value: getValues().targetAccount,
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

export default RevokeKycOperation;
