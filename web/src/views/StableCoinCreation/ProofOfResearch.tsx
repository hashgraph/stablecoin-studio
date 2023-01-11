import { Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { CreateRequest } from 'hedera-stable-coin-sdk';

import { Control, FieldValues, useWatch,  } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import SwitchController from '../../components/Form/SwitchController';
// import { handleRequestValidation } from '../../utils/validationsHelper.js';



interface ProofOfResearchProps {
	control: Control<FieldValues>;
	request: CreateRequest;
}

const ProofOfResearch = (props: ProofOfResearchProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	console.log(props.request.dataFeedAddress);
	
	const isProofOfResearch = useWatch({
	
		control,
		name: 'proofOfResearch',
	});
	
	const isHaveDataFeed = useWatch({
	
		control,
		name: 'hasDataFeed',
	});
	
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
					{t('stableCoinCreation:proofOfResearch.title')}
				</Heading>
				<Stack as='form' spacing={6}>
				<HStack mb={4}>
					<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
						{t('stableCoinCreation:proofOfResearch.description')}
					</Text>
					<SwitchController
						control={control}
						name={'proofOfResearch'}
						defaultValue={false}
					/>
				</HStack>

				{isProofOfResearch === false ? (<></>) : (
					<HStack mb={4}>
						<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
							{t('stableCoinCreation:proofOfResearch.haveDataFeed')}
						</Text>
						<SwitchController
							control={control}
							name={'hasDataFeed'}
							defaultValue={false}
						/>
					</HStack>
				)}


				{(isHaveDataFeed === true) && (isHaveDataFeed === true)  ?  (
					<HStack mb={4}>
						<InputController
						rules={{
							required: t(`global:validations.required`),
							/* validate: {
								validation: (value: string) => {
									request.symbol = value;
									const res = handleRequestValidation(request.validate('symbol'));
									return res;
								},
							}, */
						}}
						isRequired
						control={control}
						name={'dataFeedAddress'}
						label={t('stableCoinCreation:proofOfResearch.dataFeed')}
						placeholder={t('stableCoinCreation:proofOfResearch.dataFeedPlaceholder')}
						/>
					</HStack>
				):(<></>) }


					

				</Stack>
			</Stack>
		</VStack>
	);
};

export default ProofOfResearch;
