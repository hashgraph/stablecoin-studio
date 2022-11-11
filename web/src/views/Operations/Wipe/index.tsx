import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
// import InputNumberController from '../../../components/Form/InputNumberController';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import ModalsHandler from '../../../components/ModalsHandler';
import SDKService from '../../../services/SDKService';
import {
	// SELECTED_WALLET_ACCOUNT_INFO,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNT,
	walletActions,
} from '../../../store/slices/walletSlice';
import type { AppDispatch } from '../../../store/store.js';
import { formatAmount } from '../../../utils/inputHelper';
import { handleRequestValidation } from '../../../utils/validationsHelper';
import OperationLayout from './../OperationLayout';
import { useNavigate } from 'react-router-dom';
import { RouterManager } from '../../../Router/RouterManager';
import { WipeStableCoinRequest } from 'hedera-stable-coin-sdk';

const WipeOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);
	// const infoAccount = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

	const [errorOperation, setErrorOperation] = useState();
	const [request] = useState(
		new WipeStableCoinRequest({
			account: {
				accountId: account.accountId,
			},
			amount: '0',
			proxyContractId: selectedStableCoin?.memo?.proxyContract ?? '',
			targetId: '',
			tokenId: selectedStableCoin?.tokenId ?? '',
		}),
	);
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['wipe', 'global', 'operations']);

	useEffect(() => {
		handleRefreshCoinInfo();
	}, []);

	const handleCloseModal = () => {
		RouterManager.goBack(navigate);
	};

	const handleRefreshCoinInfo = async () => {
		const stableCoinDetails = await SDKService.getStableCoinDetails({
			id: selectedStableCoin?.tokenId || '',
		});
		dispatch(
			walletActions.setSelectedStableCoin({
				tokenId: stableCoinDetails?.tokenId,
				initialSupply: Number(stableCoinDetails?.initialSupply),
				totalSupply: Number(stableCoinDetails?.totalSupply),
				maxSupply: Number(stableCoinDetails?.maxSupply),
				name: stableCoinDetails?.name,
				symbol: stableCoinDetails?.symbol,
				decimals: stableCoinDetails?.decimals,
				id: stableCoinDetails?.tokenId,
				treasuryId: stableCoinDetails?.treasuryId,
				autoRenewAccount: stableCoinDetails?.autoRenewAccount,
				memo: stableCoinDetails?.memo,
				adminKey:
					stableCoinDetails?.adminKey && JSON.parse(JSON.stringify(stableCoinDetails.adminKey)),
				kycKey: stableCoinDetails?.kycKey && JSON.parse(JSON.stringify(stableCoinDetails.kycKey)),
				freezeKey:
					stableCoinDetails?.freezeKey && JSON.parse(JSON.stringify(stableCoinDetails.freezeKey)),
				wipeKey:
					stableCoinDetails?.wipeKey && JSON.parse(JSON.stringify(stableCoinDetails.wipeKey)),
				supplyKey:
					stableCoinDetails?.supplyKey && JSON.parse(JSON.stringify(stableCoinDetails.supplyKey)),
			}),
		);
	};
	const handleWipe: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		// const { amount, destinationAccount } = getValues();
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}
			await SDKService.wipe(request);
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
							<InputController
								rules={{
									required: t('global:validations.required'),
									validate: {
										validation: (value: string) => {
											// return request.validate('amount') || t('wipe:decimalsValidation');
											request.amount = value;
											const res = handleRequestValidation(request.validate('amount'));
											return res;
										},
									},
								}}
								isRequired
								control={control}
								name='amount'
								label={t('wipe:amountLabel')}
								placeholder={t('wipe:amountPlaceholder')}
							/>
							<InputController
								rules={{
									required: t('global:validations.required'),
									validate: {
										validation: (value: string) => {
											request.targetId =  value;
											const res = handleRequestValidation(request.validate('targetId'));
											return res;
										},
									}
								}}
								isRequired
								control={control}
								name='destinationAccount'
								placeholder={t('wipe:fromAccountPlaceholder')}
								label={t('wipe:fromAccountLabel')}
								onChangeAux={(e) => {
									request.targetId = e.target.value;
								}}
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
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</>
	);
};

export default WipeOperation;
