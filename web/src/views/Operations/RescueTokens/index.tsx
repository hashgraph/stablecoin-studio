import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import OperationLayout from '../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import { handleRequestValidation } from '../../../utils/validationsHelper';
import { useSelector } from 'react-redux';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNT,
} from '../../../store/slices/walletSlice';
import SDKService from '../../../services/SDKService';
import { useState } from 'react';
import { formatAmount } from '../../../utils/inputHelper';

import { useNavigate } from 'react-router-dom';
import { RouterManager } from '../../../Router/RouterManager';
import { RescueStableCoinRequest } from 'hedera-stable-coin-sdk';
import { useRefreshCoinInfo } from '../../../hooks/useRefreshCoinInfo';

const RescueTokenOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);

	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [request] = useState(
		new RescueStableCoinRequest({
			proxyContractId: selectedStableCoin?.memo?.proxyContract ?? '',
			account: {
				accountId: account.accountId
			},
			tokenId: selectedStableCoin?.tokenId ?? '',
			amount:  '0'
		})
	);

	const navigate = useNavigate();

	// const { decimals = 0 } = selectedStableCoin || {};

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['rescueTokens', 'global', 'operations']);

	const handleCloseModal = () => {
		RouterManager.goBack(navigate);
	};
	
	useRefreshCoinInfo();
	
	const handleRescueToken: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
	}) => {
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}
			await SDKService.rescue(request);
			onSuccess();
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
			setErrorOperation(error.toString());
			onError();
		}
	};

	return (
		<>
			<OperationLayout
				LeftContent={
					<>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t('rescueTokens:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('rescueTokens:operationTitle')}
						</Text>
						<Stack as='form' spacing={6}>
							<InputController
								rules={{
									required: t(`global:validations.required`),
									validate: {
										validation: (value: string) => {
											request.amount = value;
											const res = handleRequestValidation(request.validate('amount'));
											return res;
										},
									}
								}}
								isRequired
								control={control}
								name={'amount'}
								label={t('rescueTokens:amountLabel')}
								placeholder={t('rescueTokens:amountPlaceholder')}
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
					title: t('rescueTokens:modalAction.subtitle'),
					confirmButtonLabel: t('rescueTokens:modalAction.accept'),
					onConfirm: handleRescueToken,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t('rescueTokens:modalAction.subtitle')}
						details={[
							{
								label: t('rescueTokens:modalAction.originAccount'),
								value: getValues().originAccount,
							},
							{
								label: t('rescueTokens:modalAction.amount'),
								value: getValues().amount,
								valueInBold: true,
							},
						]}
					/>
				}
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={t('rescueTokens:modalSuccessDesc', {
					amount: formatAmount({
						amount: getValues().amount ?? undefined,
						decimals: selectedStableCoin?.decimals,
					}),
				})}
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</>
	);
};

export default RescueTokenOperation;
