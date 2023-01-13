import { Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { CreateRequest } from 'hedera-stable-coin-sdk';


import type { Control, FieldValues, UseFormReturn} from 'react-hook-form';
import { useWatch  } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputController from '../../components/Form/InputController';
import SwitchController from '../../components/Form/SwitchController';
// import { handleRequestValidation } from '../../utils/validationsHelper.js';


interface ProofOfReserveProps {
	form : UseFormReturn;
	control: Control<FieldValues>;
	request: CreateRequest;
}

const ProofOfReserve = (props: ProofOfReserveProps) => {
	const { control } = props;
	const { t } = useTranslation(['global', 'stableCoinCreation']);

	const isProofOfReserve = useWatch({
		control,
		name: 'proofOfReserve',
		
	});
	
	/* useEffect(() => {
		if (!isproofOfReserve) {
			form.resetField('PoRInitialAmount', { defaultValue: "" });
			form.resetField('PoR', { defaultValue: "" });
		}
	}, [isproofOfReserve]);
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
					/>
				</HStack>

				{isProofOfReserve === true ? (<HStack >
						<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
							{t('stableCoinCreation:proofOfReserve.haveDataFeed')}
						</Text>
						<SwitchController
							control={control}
							name={'hasDataFeed'}
							defaultValue={false}
						/>
					</HStack>) : (<></>		
				)}


				{(haveDataFeed === true && isProofOfReserve === true)  ?  (
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
						name={'reserveAddress'}
						label={t('stableCoinCreation:proofOfReserve.dataFeed')}
						placeholder={t('stableCoinCreation:proofOfReserve.dataFeedPlaceholder')}
						/>
					</HStack>
			

					
				):(<></>) }

				{ (haveDataFeed === false && isProofOfReserve === true)  ?  (
				
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
						name={'reserveInitialAmount'}
						label={t('stableCoinCreation:proofOfReserve.initialSupply')}
						placeholder={t('stableCoinCreation:proofOfReserve.initialSupply')}
						/>

				</HStack>
									
				):(<></>) }				
								
			</Stack>
		</VStack>
	);
};

export default ProofOfReserve;
