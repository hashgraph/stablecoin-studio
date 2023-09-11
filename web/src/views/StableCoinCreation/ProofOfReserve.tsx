import { Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { CreateRequest } from '@hashgraph-dev/stablecoin-npm-sdk';
import { useEffect } from 'react';

import type { Control, FieldValues, UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import SwitchController from '../../components/Form/SwitchController';
import { propertyNotFound } from '../../constant';
import { handleRequestValidation } from '../../utils/validationsHelper';

interface ProofOfReserveProps {
	form: UseFormReturn;
	control: Control<FieldValues>;
	request: CreateRequest;
}

const ProofOfReserve = (props: ProofOfReserveProps) => {
	const { control, form, request } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const proofOfReserve = useWatch({
		control,
		name: 'proofOfReserve',
	});

	const hasDataFeed = useWatch({
		control,
		name: 'hasDataFeed',
	});

	useEffect(() => {
		if (!proofOfReserve) {
			form.resetField('reserveInitialAmount');
			form.resetField('reserveAddress');
		}
	}, [proofOfReserve]);

	useEffect(() => {
		if (!hasDataFeed) {
			form.resetField('reserveAddress');
		} else {
			form.resetField('reserveInitialAmount');
		}
	}, [hasDataFeed]);

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
					{t('stableCoinCreation:proofOfReserve.title')}
				</Heading>

				<HStack>
					<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
						{t('stableCoinCreation:proofOfReserve.description')}
					</Text>
					<SwitchController
						control={control}
						name={'proofOfReserve'}
						defaultValue={false}
						link={t('stableCoinCreation:proofOfReserve.link')}
					/>
				</HStack>

				{proofOfReserve === true && (
					<HStack>
						<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
							{t('stableCoinCreation:proofOfReserve.haveDataFeed')}
						</Text>
						<SwitchController control={control} name={'hasDataFeed'} defaultValue={false} />
					</HStack>
				)}

				{hasDataFeed === true && proofOfReserve === true && (
					<HStack pt={'15px'}>
						<InputController
							rules={{
								required: t(`global:validations.required`) ?? propertyNotFound,
								validate: {
									validation: (value: string) => {
										request.createReserve = proofOfReserve;
										request.reserveAddress = value;
										const res = handleRequestValidation(request.validate('reserveAddress'));
										return res;
									},
								},
							}}
							isRequired
							control={control}
							name={'reserveAddress'}
							label={t('stableCoinCreation:proofOfReserve.dataFeed') ?? propertyNotFound}
							placeholder={
								t('stableCoinCreation:proofOfReserve.dataFeedPlaceholder') ?? propertyNotFound
							}
						/>
					</HStack>
				)}

				{!hasDataFeed && proofOfReserve === true && (
					<HStack pt={'15px'}>
						<InputController
							rules={{
								required: t(`global:validations.required`) ?? propertyNotFound,
								validate: {
									validation: (value: string) => {
										request.createReserve = proofOfReserve;
										request.reserveInitialAmount = value;
										const res = handleRequestValidation(request.validate('reserveInitialAmount'));
										return res;
									},
								},
							}}
							isRequired
							control={control}
							name={'reserveInitialAmount'}
							label={t('stableCoinCreation:proofOfReserve.initialSupplyPor') ?? propertyNotFound}
							placeholder={
								t('stableCoinCreation:proofOfReserve.initialSupplyPor') ?? propertyNotFound
							}
						/>
					</HStack>
				)}
			</Stack>
		</VStack>
	);
};

export default ProofOfReserve;
