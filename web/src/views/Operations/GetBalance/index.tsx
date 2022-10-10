import { useState } from 'react';
import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import { validateAccount } from '../../../utils/validationsHelper';
import OperationLayout from './../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import SDKService from '../../../services/SDKService';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNT,
} from '../../../store/slices/walletSlice';

const GetBalanceOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const [balance, setBalance] = useState<number | null>();

	const { t } = useTranslation(['getBalance', 'global', 'operations']);

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const handleGetBalance: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
	}) => {
		const { targetAccount } = getValues();

		try {
			if (!selectedStableCoin?.memo || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			const balance = await SDKService.getBalance({
				proxyContractId: selectedStableCoin.memo,
				account,
				targetId: targetAccount,
				tokenId: selectedStableCoin.tokenId,
			});

			setBalance(balance?.[0]);
			onSuccess();
		} catch (error) {
			onError();
		}
	};

	return (
		<>
			<OperationLayout
				LeftContent={
					<>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t('getBalance:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('getBalance:operationTitle')}
						</Text>
						<Stack as='form' spacing={6} maxW='520px'>
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
								name='targetAccount'
								placeholder={t('getBalance:accountPlaceholder')}
								label={t('getBalance:accountLabel')}
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
					title: t('getBalance:modalAction.subtitle'),
					confirmButtonLabel: t('getBalance:modalAction.accept'),
					onConfirm: handleGetBalance,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t('getBalance:modalAction.subtitle')}
						details={[
							{
								label: t('getBalance:modalAction.account'),
								value: getValues().targetAccount,
							},
						]}
					/>
				}
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={t('getBalance:modalSuccessBalance', {
					account: getValues().targetAccount,
					balance,
				})}
			/>
		</>
	);
};

export default GetBalanceOperation;
