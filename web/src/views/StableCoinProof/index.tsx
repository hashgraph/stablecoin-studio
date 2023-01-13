import { RepeatIcon } from '@chakra-ui/icons';
import { Box, Grid, GridItem, Heading, VStack ,Stack, Button, Icon, HStack} from '@chakra-ui/react';
import { StableCoin, UpdateReserveAddressRequest, UpdateReserveAmountRequest } from 'hedera-stable-coin-sdk';

import type { FieldValues} from 'react-hook-form';
import { useForm} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';

import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import { SELECTED_WALLET_ACCOUNT_INFO, SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';

const StableCoinProof = () => {


const { t } = useTranslation('proofOfReserve');

const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
const account = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

useRefreshCoinInfo();

const form = useForm<FieldValues>({
	mode: 'onChange',
});


// No estan los modulos exportados
/*
const request = new GetReserveAddressRequest(selectedStableCoin.id)
const reserveAddress = await StableCoin.getReserveAddress(request);
*/

const {
	control,
	getValues,
} = form;

const UpdateReserveAddress = async () => {
	const { reserveAddress} =
	getValues();
	if (selectedStableCoin){
		
		/*
		const request = new UpdateReserveAddressRequest({tokenId:selectedStableCoin.tokenId,reserveAddress:reserveAddress})
		StableCoin.updateReserveAddress(request);
		*/
	}
	
	alert("Hola");
}

const updateReserveAmount = async () => {
	const { reserveAmount} =
	getValues();
	
	/* Habilittar con la exportacion de modulos
	const request = new UpdateReserveAmountRequest(reserveAddress,reserveAmount);	
	ReserveDataFeedInPort.updateReserveAmount(request);
	*/

	/* Añadir a las llamadas
	try {
			console.log(request);
			onOpen();
			setLoading(true);
			await SDKService.createStableCoin(request);
			setLoading(false);
			setSuccess(true);
		} catch (error: any) {
			setLoading(false);
			console.log(error);
			setError(error.transactionError.transactionUrl);
			setSuccess(false);
			setLoading(false);
		} */
	alert("Send Amount");

}

return (
		<BaseContainer title={t('title')}>
			<Box p={{ base: 4, md: '128px' }}>
				<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
					{t('subtitle')}
				</Heading>
				<VStack h='full' justify={'space-between'} pt='80px'>
					<Stack h='full'> 
					<Grid templateColumns='repeat(2, 1fr)' gap={6}>
						<GridItem  >
						<InputController
							control={control}
							name={'updateReserveAmount'}
							label={t('reserveAmount')}
							placeholder={t('reserveAmountToolTip')}
							value=''
							isReadOnly={true}	
						/>
						</GridItem>
						<GridItem  >
							<HStack>
						<InputController
							control={control}
							name={'reserveAddress'}
							label={t('reserveAddress')}
							value={"0x00000000000"}
							isReadOnly={false}	
							rightElement={<Button
								data-testid={`stepper-step-panel-button-secondary`}
								variant='secondary'
								onClick={UpdateReserveAddress}
								rightIcon={<RepeatIcon />}
								width='2em'
							>
							
							</Button>}
						/>
						
										</HStack>
						</GridItem>

						<GridItem w='100%' >
						
							<Stack>
							<InputController
							isRequired
							control={control}
							name={'currentReserveAmount'}
							label={t('currentReserveAmount')}
							value=''
							isReadOnly={false}
						/>
						</Stack>
						<Stack>
						<Button
											data-testid={`stepper-step-panel-button-secondary`}
											variant='secondary'											
											onClick={updateReserveAmount}
											
										>
											{t('sendAmount')}
										</Button>
										</Stack>
						
						</GridItem>
	
				</Grid>
				</Stack>
			</VStack>
			</Box>
		</BaseContainer>
	);
};

export default StableCoinProof;
