import { Heading, Stack, VStack } from '@chakra-ui/react';
import type { Control, FieldValues, UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputNumberController from '../../components/Form/InputNumberController';
import { SelectController } from '../../components/Form/SelectController';

interface OptionalDetailsProps {
	control: Control<FieldValues>;
	form: UseFormReturn;
}

const OptionalDetails = (props: OptionalDetailsProps) => {
	const { control, form } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const supplyTypes = [
		{
			value: 0,
			label: t('stableCoinCreation:optionalDetails.infinite'),
		},
		{
			value: 1,
			label: t('stableCoinCreation:optionalDetails.finite'),
		},
	];

	const selectorStyle = {
		wrapper: {
			border: '1px',
			borderColor: 'brand.black',
			borderRadius: '8px',
			height: 'min',
		},
		menuList: {
			maxH: '220px',
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 2,
			zIndex: 99,
		},
		valueSelected: {
			fontSize: '14px',
			fontWeight: '500',
		},
	};

	const isSupplyTypeFinite = form.getValues().supplyType?.value === 1;

	const initialSupply = useWatch({
		control,
		name: 'initialSupply',
	});

	const handleResetMaxSupply = () => {
		const { maxSupply, initialSupply } = form.getValues();

		if (maxSupply && initialSupply >= maxSupply) form.setValue('maxSupply', initialSupply);
	};

	return (
		<VStack h='full' justify={'space-between'} pt='80px'>
			<Stack minW={400}>
				<Heading
					data-testid='title'
					fontSize='16px'
					fontWeight='600'
					mb={10}
					lineHeight='15.2px'
					textAlign={'left'}
				>
					{t('stableCoinCreation:optionalDetails.title')}
				</Heading>
				<Stack as='form' spacing={6}>
					<InputNumberController
						rules={{
							validate: (value) => {
								return typeof value !== 'string' || t(`global:validations.required`);
							},
						}}
						isRequired
						control={control}
						name={'initialSupply'}
						label={t('stableCoinCreation:optionalDetails.initialSupply')}
						placeholder={t('stableCoinCreation:optionalDetails.placeholder', {
							placeholder: t('stableCoinCreation:optionalDetails.initialSupply'),
						})}
						onChangeAux={handleResetMaxSupply}
					/>
					<SelectController
						control={control}
						name={'supplyType'}
						options={supplyTypes}
						label={t('stableCoinCreation:optionalDetails.typeSupply')}
						placeholder={t('stableCoinCreation:optionalDetails.typeSupplyPlaceholder')}
						overrideStyles={selectorStyle}
						addonLeft={true}
						variant='unstyled'
						defaultValue={'0'}
					/>
					{isSupplyTypeFinite && (
						<InputNumberController
							rules={{
								required: t(`global:validations.required`),
								validate: {
									quantityOverTotalSupply: (value: number) => {
										return (
											(initialSupply.toString() && initialSupply <= value) ||
											t('global:validations.overMaxSupply')
										);
									},
								},
							}}
							isRequired
							control={control}
							name={'maxSupply'}
							label={t('stableCoinCreation:optionalDetails.maxSupply')}
							placeholder={t('stableCoinCreation:optionalDetails.placeholder', {
								placeholder: t('stableCoinCreation:optionalDetails.maxSupply'),
							})}
						/>
					)}
					<InputNumberController
						rules={{
							required: t(`global:validations.required`),
						}}
						isRequired
						control={control}
						name={'decimals'}
						label={t('stableCoinCreation:optionalDetails.decimals')}
						placeholder={t('stableCoinCreation:optionalDetails.placeholder', {
							placeholder: t('stableCoinCreation:optionalDetails.decimals'),
						})}
						maxValue={18}
						initialValue={6}
					/>
				</Stack>
			</Stack>
		</VStack>
	);
};

export default OptionalDetails;
