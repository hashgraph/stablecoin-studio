import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../../components/DetailsReview';
import InputNumberController from '../../../components/Form/InputNumberController';
import { validateDecimals } from '../../../utils/validationsHelper';
import OperationLayout from '../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import { useSelector } from 'react-redux';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNT,
} from '../../../store/slices/walletSlice';
import SDKService from '../../../services/SDKService';

const RescueTokenOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);

	const { decimals = 0 } = selectedStableCoin || {};

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['rescueTokens', 'global', 'operations']);

	const handleRescueToken: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
	}) => {
		const { amount } = getValues();
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}
			await SDKService.rescue({
				proxyContractId: selectedStableCoin.memo.proxyContract,
				account,
				tokenId: selectedStableCoin.tokenId,
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
							{t('rescueTokens:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('rescueTokens:operationTitle')}
						</Text>
						<Stack as='form' spacing={6}>
							<InputNumberController
								rules={{
									required: t('global:validations.required'),
									validate: {
										maxDecimals: (value: number) => {
											return (
												validateDecimals(value, decimals) || t('rescueTokens:decimalsValidation')
											);
										},
									},
								}}
								isRequired
								control={control}
								name='amount'
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
				errorNotificationDescription={'error'} // TODO: show returned error from sdk
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
				successNotificationDescription={t('operations:modalSuccessDesc')}
			/>
		</>
	);
};

export default RescueTokenOperation;
