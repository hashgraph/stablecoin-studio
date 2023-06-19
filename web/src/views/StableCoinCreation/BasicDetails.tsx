import { Heading, Stack, VStack, useDisclosure } from '@chakra-ui/react';
import type { Control, FieldValues, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import { Network, GetTokenManagerListRequest } from '@hashgraph-dev/stablecoin-npm-sdk';
import type { CreateRequest } from '@hashgraph-dev/stablecoin-npm-sdk';
import { handleRequestValidation } from '../../utils/validationsHelper';
import { propertyNotFound } from '../../constant';
import { useEffect, useState } from 'react';
import SDKService from '../../services/SDKService';
import type { Option } from '../../components/Form/SelectCreatableController';
import SelectCreatableController from '../../components/Form/SelectCreatableController';
import AwaitingWalletSignature from '../../components/AwaitingWalletSignature';
import ModalNotification from '../../components/ModalNotification';

interface BasicDetailsProps {
	control: Control<FieldValues>;
	request: CreateRequest;
	setValue: UseFormSetValue<FieldValues>;
}

const BasicDetails = (props: BasicDetailsProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [optionshederaTokenManagerAddresses, setOptionsHederaTokenManagerAddresses] = useState<
		Option[]
	>([]);
	const [gettingHederaTokenManager, setGettingHederaTokenManager] = useState<boolean>(false);

	const { request } = props;

	useEffect(() => {
		const optionsHederaTokenManager = async () => {
			setGettingHederaTokenManager(true);

			try {
				const hederaTokenManagerOption: any = await Promise.race([
					SDKService.getHederaTokenManagerList(
						new GetTokenManagerListRequest({
							factoryId: await Network.getFactoryAddress(),
						}),
					),
					new Promise((resolve, reject) => {
						setTimeout(() => {
							reject(
								new Error("TokenManager contracts list couldn't be obtained in a reasonable time."),
							);
						}, 10000);
					}),
				]).catch((e) => {
					console.log(e.message);
					onOpen();
					throw e;
				});

				const AllOptions: any[] = [];
				const options = hederaTokenManagerOption.map((item: any) => {
					return { label: item.value, value: item.value };
				});

				options.forEach((option: any) => {
					AllOptions.push(option);
				});

				AllOptions.sort((token1, token2) =>
					+token1.value.split('.').slice(-1)[0] > +token2.value.split('.').slice(-1)[0] ? -1 : 1,
				);
				AllOptions.push({
					value: '',
					label: 'Enter your own HederaTokenManager implementation',
					isDisabled: true,
				});

				setOptionsHederaTokenManagerAddresses(AllOptions);

				setGettingHederaTokenManager(false);
			} catch (e) {
				setGettingHederaTokenManager(false);

				throw e;
			}
		};
		optionsHederaTokenManager().catch(console.error);
	}, []);

	return (
		<VStack h='full' justify={'space-between'} pt='80px'>
			{gettingHederaTokenManager && <AwaitingWalletSignature />}
			{!gettingHederaTokenManager && (
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
							label={t('stableCoinCreation:basicDetails.hederaTokenManager')}
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
										if (!option || !option.value) return false;
										// if (!option.__isNew__) return true;
										request.hederaTokenManager = option.value as string;
										const res = handleRequestValidation(request.validate('hederaTokenManager'));
										return res;
									},
								},
							}}
							variant='unstyled'
							name={`hederaTokenManagerId`}
							control={control}
							isRequired={true}
							defaultValue={'0'}
							options={[...Object.values(optionshederaTokenManagerAddresses)]}
							placeholder={t('stableCoinCreation:basicDetails:hederaTokenManagerPlaceholder')}
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
							placeholder={
								t('stableCoinCreation:basicDetails.symbolPlaceholder') ?? propertyNotFound
							}
						/>
					</Stack>
				</Stack>
			)}
			<ModalNotification
				variant={'error'}
				title={t('stableCoinCreation:basicDetails.modalErrorTitle')}
				description={t('stableCoinCreation:basicDetails.modalErrorDescription')}
				isOpen={isOpen}
				onClose={onClose}
				closeOnOverlayClick={false}
				closeButton={true}
			/>
		</VStack>
	);
};

export default BasicDetails;
