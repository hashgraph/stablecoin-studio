import { VStack } from '@chakra-ui/react';
import { CreateRequest } from 'hedera-stable-coin-sdk';
import type { Control, FieldValues } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { handleRequestValidation } from '../utils/validationsHelper';
import InputController from './Form/InputController';
import { SelectController } from './Form/SelectController';

const OTHER_KEY_VALUE = 3;

interface KeySelectorProps {
	control: Control<FieldValues>;
	name: string;
	label?: string;
	labelPlaceholder?: string;
	nameValidation?: string;
}

const optionsKeys = (t: (key: string) => string) => [
	{
		value: 1,
		label: t('stableCoinCreation:managementPermissions.currentUserKey'),
	},
	{
		value: 2,
		label: t('stableCoinCreation:managementPermissions.theSmartContract'),
	},
	{
		value: 3,
		label: t('stableCoinCreation:managementPermissions.otherKey'),
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

function toCamelCase(input: string): string {
	const words = input.toLowerCase().split(/[^\w]/);
	const camelCaseWords = words.map((word, index) => {
		if (index === 0) {
			return word;
		}
		return word.charAt(0).toUpperCase() + word.slice(1);
	});
	return camelCaseWords.join('');
}

export const KeySelector = ({ control, name, label, labelPlaceholder }: KeySelectorProps) => {
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const isOtherKeyOptionSelected = useWatch({
		control,
		name,
	});

	const availableOptions = () => {
		if (name === 'fee schedule key')
			return optionsKeys(t).filter((option) => ![2].includes(option.value));

		return optionsKeys(t);
	};

	const request = new CreateRequest({
		name: '',
		symbol: '',
		decimals: 6,
		createReserve: false,
	});

	const nameValidation = toCamelCase(name);

	return (
		<VStack>
			<SelectController
				control={control}
				name={name}
				options={availableOptions()}
				label={label}
				overrideStyles={selectorStyle}
				addonLeft={true}
				variant='unstyled'
			/>
			{isOtherKeyOptionSelected?.value === OTHER_KEY_VALUE && (
				<InputController
					rules={{
						required: t(`global:validations.required`)!,
						validate: {
							validation: (value: string) => {
								// @ts-ignore
								request[nameValidation] = value;
								// @ts-ignore
								const res = handleRequestValidation(request.validate(nameValidation));
								return res;
							},
						},
					}}
					isRequired
					control={control}
					name={name + 'Other'}
					placeholder={
						t('stableCoinCreation:managementPermissions.introduce', {
							name: labelPlaceholder,
						})!
					}
				/>
			)}
		</VStack>
	);
};
