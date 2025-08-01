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

import { FreezeAccountRequest, SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';
import { useRefreshCoinInfo } from '../../../hooks/useRefreshCoinInfo';
import { propertyNotFound } from '../../../constant';
import { formatDateTime } from '../../../utils/inputHelper';
import DatePickerController from '../../../components/Form/DatePickerController';

const UnfreezeOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [request] = useState(
		new FreezeAccountRequest({
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
			targetId: '',
			startDate: undefined,
		}),
	);

	const { t } = useTranslation(['unfreeze', 'global', 'operations', 'multiSig']);
	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});
	const selectedWallet = useSelector(LAST_WALLET_SELECTED);

	useRefreshCoinInfo();

	const successDescription =
		selectedWallet === SupportedWallets.MULTISIG
			? t('multiSig:opValidationMessage')
			: t('operations:modalSuccessTitle');

	const handleUnfreeze: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		try {
			onLoading();
			if (!selectedStableCoin?.tokenId?.toString()) {
				onError();
				return;
			}

			await SDKService.unfreeze(request);
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
							{t('unfreeze:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('unfreeze:operationTitle')}
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
								placeholder={t('unfreeze:accountPlaceholder') ?? propertyNotFound}
								label={t('unfreeze:accountLabel') ?? propertyNotFound}
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
					title: t('unfreeze:modalAction.subtitle'),
					confirmButtonLabel: t('unfreeze:modalAction.accept'),
					onConfirm: handleUnfreeze,
				}}
				ModalActionChildren={
					selectedWallet === SupportedWallets.MULTISIG ? (
						<DetailsReview
							title={t('unfreeze:modalAction.subtitle')}
							details={[
								{
									label: t('unfreeze:modalAction.account'),
									value: getValues().targetAccount,
								},
								{
									label: t('multiSig:startDate'),
									value: formatDateTime({ dateTime: getValues().startDate, isUTC: false }),
								},
							]}
						/>
					) : (
						<DetailsReview
							title={t('unfreeze:modalAction.subtitle')}
							details={[
								{
									label: t('unfreeze:modalAction.account'),
									value: getValues().targetAccount,
								},
							]}
						/>
					)
				}
				successNotificationTitle={successDescription}
				successNotificationDescription={t('unfreeze:modalSuccess', {
					account: getValues().targetAccount,
				})}
			/>
		</>
	);
};

export default UnfreezeOperation;
