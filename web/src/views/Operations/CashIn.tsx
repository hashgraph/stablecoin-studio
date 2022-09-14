// @ts-nocheck
import { Heading, Text, Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
// import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import InputNumberController from '../../components/Form/InputNumberController';
import OperationLayout from './OperationLayout';

const CashInOperation = () => {
	const { control, watch } = useForm({
		mode: 'onChange',
	});
	const { t } = useTranslation(['cashIn', 'global']);

	console.log(watch());

	return (
		<OperationLayout
			LeftContent={
				<>
					<Heading size='sm'> Cash in operation </Heading>
					<Text>Operation details</Text>

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
						}}
						isRequired
						control={control}
						name='destinationAccount'
						placeholder={t('cashIn:destinationAccountPlaceholder')}
						label={t('cashIn:destinationAccountLabel')}
					/>
				</>
			}
			RightContent={
				<>
					<Detail />
				</>
			}
		/>
	);
};

const Detail = () => {
	return <Box></Box>;
};

export default CashInOperation;
