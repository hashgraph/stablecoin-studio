import { Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DetailsReview from '../../../components/DetailsReview';
import InputController from '../../../components/Form/InputController';
import InputNumberController from '../../../components/Form/InputNumberController';
import { validateAccount } from '../../../utils/validationsHelper';
import type { OperationModalActionProps } from '../OperationModals';
import OperationModals from '../OperationModals';
import OperationLayout from './../OperationLayout';

const CashInOperation = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});

	const { t } = useTranslation(['cashIn', 'global']);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleCashIn: OperationModalActionProps['onConfirm'] = ({ onSuccess, onError }) => {
		// TODO: integrate with sdk to do cashin
		onSuccess();
	};

	return (
		<>
			<OperationLayout
				LeftContent={
					<>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t('cashIn:title')}
						</Heading>
						<Text color='brand.gray' data-testid='operation-title'>
							{t('cashIn:operationTitle')}
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
								label={t('cashIn:amountLabel')}
								placeholder={t('cashIn:amountPlaceholder')}
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
								placeholder={t('cashIn:destinationAccountPlaceholder')}
								label={t('cashIn:destinationAccountLabel')}
							/>
						</Stack>
					</>
				}
				RightContent={
					<Stack bg='brand.white' spacing={10}>
						<Heading fontSize='16px' color='brand.secondary' data-testid='details-title'>
							{t('cashIn:details.title')}
						</Heading>

						<DetailsReview
							title={t('cashIn:details.basicTitle')}
							titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
							details={[
								{
									label: t('cashIn:details.name'),
									value: '',
								},
								{
									label: t('cashIn:details.symbol'),
									value: '',
								},
								{
									label: t('cashIn:details.decimals'),
									value: '',
								},
							]}
						/>
						<DetailsReview
							title={t('cashIn:details.optionalTitle')}
							titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
							details={[
								{
									label: t('cashIn:details.initialSupply'),
									value: '',
								},
								{
									label: t('cashIn:details.totalSupply'),
									value: '',
								},
								{
									label: t('cashIn:details.supplyType'),
									value: '',
								},
							]}
						/>
					</Stack>
				}
				onConfirm={onOpenModalAction}
				confirmBtnProps={{ isDisabled: !formState.isValid }}
			/>
			<OperationModals
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t('cashIn:modalAction.subtitle'),
					confirmButtonLabel: t('cashIn:modalAction.accept'),
					onConfirm: handleCashIn,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t('cashIn:modalAction.subtitle')}
						details={[
							{
								label: t('cashIn:modalAction.destinationAccount'),
								value: getValues().destinationAccount,
							},
							{
								label: t('cashIn:modalAction.amount'),
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

export default CashInOperation;
