import { useState } from 'react';
import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import OperationLayout from '../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';
import { handleRequestValidation } from '../../../utils/validationsHelper';
import SDKService from '../../../services/SDKService';
import { SELECTED_WALLET_COIN } from '../../../store/slices/walletSlice';
import { useNavigate } from 'react-router-dom';
import { RouterManager } from '../../../Router/RouterManager';
import { FreezeAccountRequest } from 'hedera-stable-coin-sdk';
import { useRefreshCoinInfo } from '../../../hooks/useRefreshCoinInfo';

const FreezeOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [request] = useState(
		new FreezeAccountRequest({
			tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
			targetId: '',
		}),
	);

	const navigate = useNavigate();

	const { t } = useTranslation(['freeze', 'global', 'operations']);
	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const handleCloseModal = () => {
		RouterManager.goBack(navigate);
	};
	useRefreshCoinInfo();

	const handleFreeze: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		try {
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId?.toString()) {
				onError();
				return;
			}
			await SDKService.freeze(request);
			onSuccess();
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
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
				errorTransactionUrl={errorTransactionUrl}
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
				successNotificationDescription={t('freeze:modalSuccess', {
					account: getValues().targetAccount,
				})}
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</>
	);
};

export default FreezeOperation;
