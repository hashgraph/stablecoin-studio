import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import InputNumberController from '../../../components/Form/InputNumberController';
import { validateAccount } from '../../../utils/validationsHelper';
import OperationModals, { OperationModalActionProps } from '../OperationModals';
import OperationLayout from './../OperationLayout';

const WipeOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['wipe', 'global']);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleWipe: OperationModalActionProps['onConfirm'] = ({ onSuccess, onError }) => {
		// TODO: integrate with sdk to do cashin
		onSuccess();
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
						<Stack as='form' spacing={6}>
							<InputNumberController
								rules={{
									required: t('global:validations.required'),
									// TODO: Add validation of max decimals allowed by stable coin
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
										validAccount: (value: string) => {
											return validateAccount(value) || t('global:validations.invalidAccount');
										},
									},
								}}
								isRequired
								control={control}
								name='destinationAccount'
								placeholder={t('wipe:fromAccountPlaceholder')}
								label={t('wipe:fromAccountLabel')}
							/>
						</Stack>
					</>
				}
				onConfirm={onOpenModalAction}
				confirmBtnProps={{ isDisabled: !formState.isValid }}
			/>
			<OperationModals
				modalSuccessDesc={t('wipe:modalSuccessDesc', {
					amount: getValues().amount,
					account: getValues().destinationAccount,
				})}
				modalErrorDesc={'error'} // TODO: save error from sdk
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
			/>
		</>
	);
};

export default WipeOperation;
