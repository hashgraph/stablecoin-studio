import { Heading, Stack, VStack } from '@chakra-ui/react';
import type { CreateRequest } from '@hashgraph-dev/stablecoin-npm-sdk';
import { TokenSupplyType } from '@hashgraph-dev/stablecoin-npm-sdk';
import type { Control, FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import InputNumberController from '../../components/Form/InputNumberController';
import { SelectController } from '../../components/Form/SelectController';
import { propertyNotFound } from '../../constant';
import { handleRequestValidation } from '../../utils/validationsHelper';

interface OptionalDetailsProps {
	control: Control<FieldValues>;
	form: UseFormReturn;
	request: CreateRequest;
}

const OptionalDetails = (props: OptionalDetailsProps) => {
	const { control, form, request } = props;
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
	request.supplyType = isSupplyTypeFinite ? TokenSupplyType.FINITE : TokenSupplyType.INFINITE;

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
					<InputController
						rules={{
							validate: {
								validation: (value: string) => {
									request.initialSupply = value;
									const res = handleRequestValidation(request.validate('initialSupply'));
									return res;
								},
							},
						}}
						isRequired
						control={control}
						name={'initialSupply'}
						label={t('stableCoinCreation:optionalDetails.initialSupply') ?? propertyNotFound}
						placeholder={
							t('stableCoinCreation:optionalDetails.placeholder', {
								placeholder: t('stableCoinCreation:optionalDetails.initialSupply'),
							}) ?? propertyNotFound
						}
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
						<InputController
							rules={{
								required: t(`global:validations.required`) ?? propertyNotFound,
								validate: {
									validation: (value: string) => {
										request.maxSupply = value;
										const res = handleRequestValidation(request.validate('maxSupply'));
										return res;
									},
								},
							}}
							isRequired
							control={control}
							name={'maxSupply'}
							label={t('stableCoinCreation:optionalDetails.maxSupply') ?? propertyNotFound}
							placeholder={
								t('stableCoinCreation:optionalDetails.placeholder', {
									placeholder: t('stableCoinCreation:optionalDetails.maxSupply'),
								}) ?? propertyNotFound
							}
						/>
					)}
					<InputNumberController
						rules={{
							required: t(`global:validations.required`) ?? propertyNotFound,
							validate: {
								validation: (value: string) => {
									request.decimals = value;
									const res = handleRequestValidation(request.validate('decimals'));
									return res;
								},
							},
						}}
						isRequired
						control={control}
						name={'decimals'}
						label={t('stableCoinCreation:optionalDetails.decimals') ?? propertyNotFound}
						placeholder={
							t('stableCoinCreation:optionalDetails.placeholder', {
								placeholder: t('stableCoinCreation:optionalDetails.decimals'),
							}) ?? propertyNotFound
						}
						maxValue={18}
						initialValue={6}
					/>
					<InputController
						rules={{
							required: t(`global:validations.required`) ?? propertyNotFound,
							validate: {
								validation: (value: string) => {
									request.metadata = value;
									const res = handleRequestValidation(request.validate('metadata'));
									return res;
								},
							},
						}}						
						control={control}
						name={'metadata'}
						label={t('stableCoinCreation:optionalDetails.metadata') ?? propertyNotFound}
						placeholder={
							t('stableCoinCreation:optionalDetails.placeholder', {
								placeholder: t('stableCoinCreation:optionalDetails.metadata'),
							}) ?? propertyNotFound
						}
					/>
				</Stack>
			</Stack>
		</VStack>
	);
};

export default OptionalDetails;
