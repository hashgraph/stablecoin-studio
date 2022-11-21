import { useEffect, useState } from 'react';
import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import OperationLayout from './../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import { handleRequestValidation } from '../../../utils/validationsHelper';
import SDKService from '../../../services/SDKService';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNT,
	walletActions,
} from '../../../store/slices/walletSlice';
import { useNavigate } from 'react-router-dom';
import { RouterManager } from '../../../Router/RouterManager';
import type { AppDispatch } from '../../../store/store.js';
import { formatAmountWithDecimals } from '../../../utils/inputHelper';
import { GetAccountBalanceRequest, GetStableCoinDetailsRequest } from 'hedera-stable-coin-sdk';

const GetBalanceOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);

	const [balance, setBalance] = useState<string | null>();
	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [request] = useState(
		new GetAccountBalanceRequest({
			proxyContractId: selectedStableCoin?.memo?.proxyContract ?? '',
			account: {
				accountId: account.accountId
			},
			tokenId: selectedStableCoin?.tokenId ?? '',
			targetId: ''
		})
	);

	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { t } = useTranslation(['getBalance', 'global', 'operations']);
	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	useEffect(() => {
		handleRefreshCoinInfo();
	}, []);

	const handleCloseModal = () => {
		RouterManager.goBack(navigate);
	};

	const handleRefreshCoinInfo = async () => {
		const stableCoinDetails = await SDKService.getStableCoinDetails(
			new GetStableCoinDetailsRequest({
				id: selectedStableCoin?.tokenId ?? '',
			}) 
		);
		dispatch(
			walletActions.setSelectedStableCoin({
				tokenId: stableCoinDetails?.tokenId,
				initialSupply: stableCoinDetails?.initialSupply,
				totalSupply: stableCoinDetails?.totalSupply,
				maxSupply: stableCoinDetails?.maxSupply,
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

	const handleGetBalance: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
	}) => {
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			const balance = await SDKService.getBalance(request);
			setBalance(balance);
			onSuccess();
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl)
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
										validation: (value: string) => {
											request.targetId =  value;
											const res = handleRequestValidation(request.validate('targetId'));
											return res;
										},
									}
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
				errorNotificationDescription={errorOperation}
				errorTransactionUrl={errorTransactionUrl}
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
					balance: formatAmountWithDecimals({
						amount: balance ?? '',
						decimals: selectedStableCoin?.decimals ?? 0,
					}),
				})}
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</>
	);
};

export default GetBalanceOperation;
