import { VStack } from '@chakra-ui/react';
import type { CreateRequest } from 'hedera-stable-coin-sdk';
import type { Control, FieldValues } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../../components/Form/InputController';
import { SelectController } from '../../../components/Form/SelectController';
import { handleRequestValidation } from '../../../utils/validationsHelper';

export const OTHER_KEY_VALUE = 3;

interface KeySelectorProps {
	control: Control<FieldValues>;
	name: string;
	label: string;
	request: CreateRequest;
}

const KeySelector = ({ control, name, label, request }: KeySelectorProps) => {
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const optionsKeys = [
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
		{
			value: 4,
			label: t('stableCoinCreation:managementPermissions.none'),
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

	const isOtherKeyOptionSelected = useWatch({
		control,
		name,
	});

	const availableOptions = () => {
		if (name === 'adminKey')
			return optionsKeys.filter((option) => option.value !== 2 && option.value !== 3);

		return optionsKeys;
	};

	return (
		<VStack>
			<SelectController
				control={control}
				name={name}
				options={availableOptions()}
				defaultValue={name === 'adminKey' ? '0' : '1'}
				label={label}
				overrideStyles={selectorStyle}
				addonLeft={true}
				variant='unstyled'
			/>
			{isOtherKeyOptionSelected?.value === OTHER_KEY_VALUE && (
				<InputController
					rules={{
						required: t(`global:validations.required`),
						validate: {
							validation: (value: string) => {
								// @ts-ignore
								request[name] = value;
								// @ts-ignore
								// @ts-ignore
								const res = handleRequestValidation(request.validate(name));
								return res;
							},
						},
					}}
					isRequired
					control={control}
					name={name + 'Other'}
					placeholder={t('stableCoinCreation:managementPermissions.introduce', {
						name: label,
					})}
				/>
			)}
		</VStack>
	);
};

export default KeySelector;
