import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import InputNumberController from '../../../components/Form/InputNumberController';
import { validateAccount } from '../../../utils/validationsHelper';
import OperationLayout from '../OperationLayout';
import ModalsHandler from '../../../components/ModalsHandler';
import type { ModalsHandlerActionsProps } from '../../../components/ModalsHandler';

const BurnOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['burn', 'global', 'operations']);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleBurn: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		try {
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
							{t('burn:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('burn:operationTitle')}
						</Text>
						<Stack as='form' spacing={6}>
							<InputNumberController
								rules={{
									required: t('global:validations.required'),
									// TODO: Add validation of max decimals allowed by stable coin
								}}
								isRequired
								control={control}
								name='amount'
								label={t('burn:amountLabel')}
								placeholder={t('burn:amountPlaceholder')}
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
								name='originAccount'
								placeholder={t('burn:originAccountPlaceholder')}
								label={t('burn:originAccountLabel')}
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
					title: t('burn:modalAction.subtitle'),
					confirmButtonLabel: t('burn:modalAction.accept'),
					onConfirm: handleBurn,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t('burn:modalAction.subtitle')}
						details={[
							{
								label: t('burn:modalAction.originAccount'),
								value: getValues().originAccount,
							},
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
			/>
		</>
	);
};

export default BurnOperation;
