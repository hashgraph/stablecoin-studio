import { Heading, Stack, VStack } from '@chakra-ui/react';
import type { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import { useSelector } from 'react-redux';
import { CreateRequest, Network, GetERC20ListRequest } from 'hedera-stable-coin-sdk';
import { SELECTED_WALLET_PAIRED } from '../../store/slices/walletSlice';
import { handleRequestValidation } from '../../utils/validationsHelper';
import { propertyNotFound } from '../../constant';
import { useEffect, useState } from 'react';
import SDKService from '../../services/SDKService';
import type { Option } from '../../components/Form/SelectCreatableController';
import SelectCreatableController from '../../components/Form/SelectCreatableController';

interface BasicDetailsProps {
	control: Control<FieldValues>;
	request: CreateRequest;
}

const BasicDetails = (props: BasicDetailsProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);
	const pairingData = useSelector(SELECTED_WALLET_PAIRED);
	const [optionshederaERC20Addresses, setOptionsHederaERC20Addresses] = useState<Option[]>([]);

	const { request } = props;

	useEffect(() => {
		const optionsHederaERC20 = async () => {
			const hederaERC20Option = await SDKService.getHederaERC20List(
				new GetERC20ListRequest({
					factoryId: await Network.getFactoryAddress(),
				}),
			);
			const AllOptions: any[] = [];
			AllOptions.push({
				value: '',
				label: 'Enter your own HederaERC20 implementation',
				isDisabled: true,
			});

			const options = hederaERC20Option.map((item) => {
				return { label: item.value, value: item.value };
			});

			options.forEach((option) => {
				AllOptions.push(option);
			});

			setOptionsHederaERC20Addresses(AllOptions.reverse());
		};
		optionsHederaERC20().catch(console.error);
	}, []);

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
					{t('stableCoinCreation:basicDetails.title')}
				</Heading>
				<Stack as='form' spacing={6}>
					<SelectCreatableController
						label={t('stableCoinCreation:basicDetails.hederaERC20')}
						overrideStyles={{
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
						}}
						addonLeft={true}
						rules={{
							required: t(`global:validations.required`) ?? propertyNotFound,
							validate: {
								validation: (option: any) => {
									if (!option.__isNew__) return true;
									request.hederaERC20 = option.value as string;
									const res = handleRequestValidation(request.validate('hederaERC20'));
									return res;
								},
							},
						}}
						variant='unstyled'
						name={`hederaERC20Id`}
						control={control}
						isRequired={true}
						options={[...Object.values(optionshederaERC20Addresses)]}
						placeholder={t('stableCoinCreation:basicDetails:hederaERC20Placeholder')}
					/>

					<InputController
						rules={{
							required: t(`global:validations.required`) ?? propertyNotFound,
							validate: {
								validation: (value: string) => {
									request.name = value;
									const res = handleRequestValidation(request.validate('name'));
									return res;
								},
							},
						}}
						isRequired
						control={control}
						name={'name'}
						label={t('stableCoinCreation:basicDetails.name') ?? propertyNotFound}
						placeholder={t('stableCoinCreation:basicDetails.namePlaceholder') ?? propertyNotFound}
					/>
					<InputController
						rules={{
							required: t(`global:validations.required`) ?? propertyNotFound,
							validate: {
								validation: (value: string) => {
									request.symbol = value;
									const res = handleRequestValidation(request.validate('symbol'));
									return res;
								},
							},
						}}
						isRequired
						control={control}
						name={'symbol'}
						label={t('stableCoinCreation:basicDetails.symbol') ?? propertyNotFound}
						placeholder={t('stableCoinCreation:basicDetails.symbolPlaceholder') ?? propertyNotFound}
					/>
					<InputController
						isRequired
						control={control}
						name={'autorenewAccount'}
						label={t('stableCoinCreation:basicDetails.autorenewAccount') ?? propertyNotFound}
						placeholder={
							t('stableCoinCreation:basicDetails.autorenewAccountPlaceholder') ?? propertyNotFound
						}
						value={pairingData ? pairingData.account?.id.toString() : ''}
						isReadOnly
					/>
				</Stack>
			</Stack>
		</VStack>
	);
};

export default BasicDetails;
