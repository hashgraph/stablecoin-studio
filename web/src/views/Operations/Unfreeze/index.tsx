import { useEffect, useState } from 'react';
import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import OperationLayout from '../OperationLayout';
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
import { FreezeAccountRequest, GetStableCoinDetailsRequest } from 'hedera-stable-coin-sdk';

const UnfreezeOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);

	const [errorOperation, setErrorOperation] = useState();
	const [request] = useState(
		new FreezeAccountRequest({
			proxyContractId: selectedStableCoin?.memo?.proxyContract ?? '',
			account: {
				accountId: account.accountId,
			},
			tokenId: selectedStableCoin?.tokenId ?? '',
			targetId: '',
		}),
	);

	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { t } = useTranslation(['unfreeze', 'global', 'operations']);
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
			}),
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
				paused: stableCoinDetails?.paused,
				deleted: stableCoinDetails?.deleted,
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

	const handleUnfreeze: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			await SDKService.unfreeze(request);		
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
							{t('unfreeze:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('unfreeze:operationTitle')}
						</Text>
						<Stack as='form' spacing={6} maxW='520px'>
							<InputController
								rules={{
									required: t('global:validations.required'),
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
								placeholder={t('unfreeze:accountPlaceholder')}
								label={t('unfreeze:accountLabel')}
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
					title: t('unfreeze:modalAction.subtitle'),
					confirmButtonLabel: t('unfreeze:modalAction.accept'),
					onConfirm: handleUnfreeze,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t('unfreeze:modalAction.subtitle')}
						details={[
							{
								label: t('unfreeze:modalAction.account'),
								value: getValues().targetAccount,
							},
						]}
					/>
				}
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={t('unfreeze:modalSuccess',{
					account: getValues().targetAccount,
				
				})}
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</>
	);
};

export default UnfreezeOperation;
