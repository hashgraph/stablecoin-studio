import { Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { CreateRequest } from 'hedera-stable-coin-sdk';


import type { Control, FieldValues, UseFormReturn} from 'react-hook-form';
import { useWatch  } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import SwitchController from '../../components/Form/SwitchController';
// import { handleRequestValidation } from '../../utils/validationsHelper.js';


interface ProofOfResearchProps {
	form : UseFormReturn;
	control: Control<FieldValues>;
	request: CreateRequest;
}

const ProofOfResearch = (props: ProofOfResearchProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const isProofOfResearch = useWatch({
		control,
		name: 'proofOfResearch',
		
	});
	
	/* useEffect(() => {
		if (!isProofOfResearch) {
			form.resetField('PoRInitialAmount', { defaultValue: "" });
			form.resetField('PoR', { defaultValue: "" });
		}
	}, [isProofOfResearch]);
	*/
	

	const haveDataFeed = useWatch({
	
		control,
		name: 'hasDataFeed',
	});
/*
	useEffect(() => {
		if (!haveDataFeed) {
			form.resetField('PoR', { defaultValue: "" });
		}else{
			form.resetField('PoRInitialAmount', { defaultValue: "" });
		}
	}, [haveDataFeed]);
*/	
	
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
			
				<HStack>
					<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
						{t('stableCoinCreation:proofOfResearch.description')}
					</Text>
					<SwitchController
						control={control}
						name={'proofOfResearch'}
						defaultValue={false}
					/>
				</HStack>

				{isProofOfResearch === true ? (<HStack >
						<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
							{t('stableCoinCreation:proofOfResearch.haveDataFeed')}
						</Text>
						<SwitchController
							control={control}
							name={'hasDataFeed'}
							defaultValue={false}
						/>
					</HStack>) : (<></>		
				)}


				{(haveDataFeed === true && isProofOfResearch === true)  ?  (
				<HStack >
						<InputController
						rules={{
							// required: t(`global:validations.required`),
							/* validate: {
								validation: (value: string) => {
									request.symbol = value;
									const res = handleRequestValidation(request.validate('symbol'));
									return res;
								},
							}, */
						}}
						
						control={control}
						name={'PoR'}
						label={t('stableCoinCreation:proofOfResearch.dataFeed')}
						placeholder={t('stableCoinCreation:proofOfResearch.dataFeedPlaceholder')}
						/>
					</HStack>
			

					
				):(<></>) }

				{ (haveDataFeed === false && isProofOfResearch === true)  ?  (
				
				<HStack >
					<InputController
						rules={{
							// required: t(`global:validations.required`),
							/* validate: {
								validation: (value: string) => {
									request.symbol = value;
									const res = handleRequestValidation(request.validate('symbol'));
									return res;
								},
							}, */
						}}
						
						control={control}
						name={'PoRInitialAmount'}
						label={t('stableCoinCreation:proofOfResearch.initialSupply')}
						placeholder={t('stableCoinCreation:proofOfResearch.initialSupply')}
						/>

				</HStack>
									
				):(<></>) }				
								
			</Stack>
		</VStack>
	);
};

export default ProofOfResearch;
