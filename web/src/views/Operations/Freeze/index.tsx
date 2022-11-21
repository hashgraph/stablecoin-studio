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

const FreezeOperation = () => {
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

	const { t } = useTranslation(['freeze', 'global', 'operations']);
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

	const handleFreeze: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}

			await SDKService.freeze(request);		
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
							{t('freeze:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('freeze:operationTitle')}
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
								placeholder={t('freeze:accountPlaceholder')}
								label={t('freeze:accountLabel')}
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
					title: t('freeze:modalAction.subtitle'),
					confirmButtonLabel: t('freeze:modalAction.accept'),
					onConfirm: handleFreeze,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t('freeze:modalAction.subtitle')}
						details={[
							{
								label: t('freeze:modalAction.account'),
								value: getValues().targetAccount,
							},
						]}
					/>
				}
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={t('freeze:modalSuccess',{
					account: getValues().targetAccount,
				
				})}
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</>
	);
};

export default FreezeOperation;
