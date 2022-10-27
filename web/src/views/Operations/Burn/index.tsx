import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../../components/DetailsReview';
import InputNumberController from '../../../components/Form/InputNumberController';
import OperationLayout from '../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import { useSelector, useDispatch } from 'react-redux';
import {
	SELECTED_WALLET_ACCOUNT_INFO,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNT,
	walletActions,
} from '../../../store/slices/walletSlice';
import SDKService from '../../../services/SDKService';
import { validateDecimals } from '../../../utils/validationsHelper';
import { useState, useEffect } from 'react';
import type { AppDispatch } from '../../../store/store.js';
import { useNavigate } from 'react-router-dom';
import { RouterManager } from '../../../Router/RouterManager';

const BurnOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);
	const infoAccount = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

	const [errorOperation, setErrorOperation] = useState();
	const navigate = useNavigate()
	const dispatch = useDispatch<AppDispatch>();

	const { decimals = 0, totalSupply } = selectedStableCoin || {};

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['burn', 'global', 'operations']);

	useEffect(() => {
		handleRefreshCoinInfo();
	}, [])
	
	const handleCloseModal = () => {
		RouterManager.goBack(navigate);
	}

	const handleBurn: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		const { amount } = getValues();
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}
			await SDKService.burn({
				proxyContractId: selectedStableCoin.memo.proxyContract,
				account,
				tokenId: selectedStableCoin.tokenId,
				amount,
				publicKey: infoAccount.publicKey
			});
			onSuccess();
		} catch (error: any) {
			setErrorOperation(error.toString());
			onError();
		}
	};

	const handleRefreshCoinInfo = async () => {
		const stableCoinDetails = await SDKService.getStableCoinDetails({
			id: selectedStableCoin?.tokenId || '',
		});
		console.log('cojo los detalles',stableCoinDetails)
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

	return (
		<>
			<OperationLayout
				LeftContent={
					<>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t('burn:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('burn:operationTitle')}
						</Text>
						<Stack as='form' spacing={6}>
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
								label={t('burn:amountLabel')}
								placeholder={t('burn:amountPlaceholder')}
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
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t('burn:modalAction.subtitle'),
					confirmButtonLabel: t('burn:modalAction.accept'),
					onConfirm: handleBurn,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t('burn:modalAction.subtitle')}
						details={[
							{
								label: t('burn:modalAction.amount'),
								value: getValues().amount,
								valueInBold: true,
							},
						]}
					/>
				}
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={t('operations:modalSuccessDesc')}
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</>
	);
};

export default BurnOperation;
