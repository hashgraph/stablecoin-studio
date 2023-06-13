import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import OperationLayout from '../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET_COIN } from '../../../store/slices/walletSlice';
import SDKService from '../../../services/SDKService';
import { handleRequestValidation, validateDecimalsString } from '../../../utils/validationsHelper';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouterManager } from '../../../Router/RouterManager';
import { BurnRequest } from '@hashgraph-dev/stablecoin-npm-sdk';
import { useRefreshCoinInfo } from '../../../hooks/useRefreshCoinInfo';
import { propertyNotFound } from '../../../constant';

const BurnOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	const { decimals = 0 } = selectedStableCoin || {};
	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [request] = useState(
		new BurnRequest({
			amount: '0',
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
		}),
	);
	const navigate = useNavigate();
	useRefreshCoinInfo();

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['burn', 'global', 'operations']);

	const handleCloseModal = () => {
		RouterManager.goBack(navigate);
	};

	const handleBurn: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		try {
			onLoading();
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}
			await SDKService.burn(request);
			onSuccess();
		} catch (error: any) {
			console.log(JSON.stringify(error));
			setErrorTransactionUrl(error.transactionUrl);
			setErrorOperation(error.message);
			onError();
		}
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
							<InputController
								rules={{
									required: t(`global:validations.required`) ?? propertyNotFound,
									validate: {
										validDecimals: (value: string) => {
											return (
												validateDecimalsString(value, decimals) ||
												(t('global:validations.decimalsValidation') ?? propertyNotFound)
											);
										},
										validation: (value: string) => {
											request.amount = value;
											const res = handleRequestValidation(request.validate('amount'));

											return res;
										},
									},
								}}
								isRequired
								control={control}
								name={'amount'}
								label={t('burn:amountLabel') ?? propertyNotFound}
								placeholder={t('burn:amountPlaceholder') ?? propertyNotFound}
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
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={t('burn:modalSuccessDesc', {
					amount: getValues().amount,
					account: getValues().destinationAccount,
				})}
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
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</>
	);
};

export default BurnOperation;
