import { useState } from 'react';
import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import OperationLayout from '../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import { handleRequestValidation } from '../../../utils/validationsHelper';
import SDKService from '../../../services/SDKService';
import { SELECTED_WALLET_COIN } from '../../../store/slices/walletSlice';
import { useNavigate } from 'react-router-dom';
import { RouterManager } from '../../../Router/RouterManager';

import { KYCRequest } from '@hashgraph-dev/stablecoin-npm-sdk';
import { useRefreshCoinInfo } from '../../../hooks/useRefreshCoinInfo';
import { propertyNotFound } from '../../../constant';

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
		}),
	);

	const navigate = useNavigate();

	const { t } = useTranslation(['revokeKYC', 'global', 'operations']);
	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const handleCloseModal = () => {
		RouterManager.goBack(navigate);
	};

	useRefreshCoinInfo();

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
					<DetailsReview
						title={t('revokeKYC:modalAction.subtitle')}
						details={[
							{
								label: t('revokeKYC:modalAction.account'),
								value: getValues().targetAccount,
							},
						]}
					/>
				}
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={t('revokeKYC:modalSuccess', {
					account: getValues().targetAccount,
				})}
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</>
	);
};

export default RevokeKycOperation;
