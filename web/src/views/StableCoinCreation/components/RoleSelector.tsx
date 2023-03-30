import { VStack } from '@chakra-ui/react';
import type { CreateRequest } from 'hedera-stable-coin-sdk';
import type { Control, FieldValues } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../../components/Form/InputController';
import { SelectController } from '../../../components/Form/SelectController';
import { propertyNotFound } from '../../../constant';
import { handleRequestValidation } from '../../../utils/validationsHelper';

export const OTHER_ACCOUNT_VALUE = 2;

interface RoleSelectorProps {
	control: Control<FieldValues>;
	name: string;
	label: string;
	request: CreateRequest;
}

const RoleSelector = ({ control, name, label, request }: RoleSelectorProps) => {
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const optionsRoles = [
		{
			value: 1,
			label: t('stableCoinCreation:managementPermissions.currentUserAccount'),
		},
		{
			value: 2,
			label: t('stableCoinCreation:managementPermissions.otherAccount'),
		},
		{
			value: 3,
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

	const isOtherAccountOptionSelected = useWatch({
		control,
		name,
	});

	const availableOptions = () => {
		return optionsRoles;
	};

	return (
		<VStack>
			<SelectController
				control={control}
				name={name}
				options={availableOptions()}
				defaultValue={'0'}
				label={label}
				overrideStyles={selectorStyle}
				addonLeft={true}
				variant='unstyled'
			/>
			{isOtherAccountOptionSelected?.value === OTHER_ACCOUNT_VALUE && (
				<InputController
					rules={{
						required: t(`global:validations.required`) ?? propertyNotFound,
						validate: {
							validation: (value: string) => {
								// @ts-ignore
								request[name] = value;
								// @ts-ignore
								const res = handleRequestValidation(request.validate(name));
								return res;
							},
						},
					}}
					isRequired
					control={control}
					name={name + 'Other'}
					placeholder={
						t('stableCoinCreation:managementPermissions.accountPlaceholder') ?? propertyNotFound
					}
				/>
			)}
		</VStack>
	);
};

export default RoleSelector;
