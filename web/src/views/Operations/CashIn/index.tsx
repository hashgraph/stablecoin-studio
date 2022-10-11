import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import InputNumberController from '../../../components/Form/InputNumberController';
import SDKService from '../../../services/SDKService';
import { validateAccount, validateDecimals } from '../../../utils/validationsHelper';
import OperationLayout from './../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import { useSelector } from 'react-redux';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
} from '../../../store/slices/walletSlice';
import { HashPackAccount } from 'hedera-stable-coin-sdk';

const CashInOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const { decimals = 0, totalSupply } = selectedStableCoin || {};
	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});
	const { t } = useTranslation(['cashIn', 'global', 'operations']);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleCashIn: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		const { amount, destinationAccount } = getValues();
		try {
			if (!selectedStableCoin?.memo || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}
			await SDKService.cashIn({
				proxyContractId: selectedStableCoin.memo,
				account: new HashPackAccount(accountId),
				tokenId: selectedStableCoin.tokenId,
				targetId: destinationAccount, // destinationACc
				amount,
			});
			onSuccess();
		} catch (error) {
			console.error(error);
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
							<InputNumberController
								rules={{
									required: t('global:validations.required'),
									validate: {
										maxDecimals: (value: number) => {
											return (
												validateDecimals(value, decimals) ||
												t('global:validations.decimalsValidation')
											);
										},
										quantityOverTotalSupply: (value: number) => {
											return (
												(totalSupply && totalSupply >= value) ||
												t('global:validations.overTotalSupply')
											);
										},
									},
								}}
								decimalScale={decimals}
								isRequired
								control={control}
								name='amount'
								label={t('cashIn:amountLabel')}
								placeholder={t('cashIn:amountPlaceholder')}
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
								placeholder={t('cashIn:destinationAccountPlaceholder')}
								label={t('cashIn:destinationAccountLabel')}
							/>
						</Stack>
					</>
				}
				onConfirm={onOpenModalAction}
				confirmBtnProps={{ isDisabled: !formState.isValid }}
			/>
			<ModalsHandler
				errorNotificationTitle={t('operations:modalErrorTitle')}
				errorNotificationDescription={'error'} // TODO: show returned error from sdk
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t('cashIn:modalAction.subtitle'),
					confirmButtonLabel: t('cashIn:modalAction.accept'),
					onConfirm: handleCashIn,
				}}
				ModalActionChildren={
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
				}
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={t('operations:modalSuccessDesc')}
			/>
		</>
	);
};

export default CashInOperation;
