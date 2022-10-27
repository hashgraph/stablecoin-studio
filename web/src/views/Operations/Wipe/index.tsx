import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import InputNumberController from '../../../components/Form/InputNumberController';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import ModalsHandler from '../../../components/ModalsHandler';
import SDKService from '../../../services/SDKService';
import {
	SELECTED_WALLET_ACCOUNT_INFO,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNT,
} from '../../../store/slices/walletSlice';
import { formatAmount } from '../../../utils/inputHelper';
import { validateAccount, validateDecimals } from '../../../utils/validationsHelper';
import OperationLayout from './../OperationLayout';

const WipeOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);
	const infoAccount = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

	const [errorOperation, setErrorOperation] = useState();

	const { decimals = 0 } = selectedStableCoin || {};

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['wipe', 'global', 'operations']);

	const handleWipe: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		const { amount, destinationAccount } = getValues();
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}
			await SDKService.wipe({
				proxyContractId: selectedStableCoin.memo.proxyContract,
				account,
				tokenId: selectedStableCoin.tokenId,
				targetId: destinationAccount,
				amount: amount.toString(),
				publicKey: infoAccount.publicKey,
			});
			onSuccess();
		} catch (error: any) {
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
							{t('wipe:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('wipe:operationTitle')}
						</Text>
						<Stack as='form' spacing={6} maxW='520px'>
							<InputNumberController
								rules={{
									required: t('global:validations.required'),
									validate: {
										maxDecimals: (value: number) => {
											return validateDecimals(value, decimals) || t('wipe:decimalsValidation');
										},
									},
								}}
								isRequired
								control={control}
								name='amount'
								label={t('wipe:amountLabel')}
								placeholder={t('wipe:amountPlaceholder')}
								decimalScale={decimals}
							/>
							<InputController
								rules={{
									required: t('global:validations.required'),
									validate: {
										validAccount: (value: string) => {
											return validateAccount(value) || t('global:validations.invalidAccount');
										},
									},
								}}
								isRequired
								control={control}
								name='destinationAccount'
								placeholder={t('wipe:fromAccountPlaceholder')}
								label={t('wipe:fromAccountLabel')}
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
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={t('wipe:modalSuccessDesc', {
					amount: formatAmount({
						amount: getValues().amount ?? undefined,
						decimals: selectedStableCoin?.decimals,
					}),
					account: getValues().destinationAccount,
				})}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t('wipe:modalAction.subtitle'),
					confirmButtonLabel: t('wipe:modalAction.accept'),
					onConfirm: handleWipe,
				}}
				ModalActionChildren={
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
				}
			/>
		</>
	);
};

export default WipeOperation;
