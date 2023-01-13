import { RepeatIcon } from '@chakra-ui/icons';
import { Box, Grid, GridItem, Heading, VStack ,Stack, Button} from '@chakra-ui/react';

import { GetReserveAddressRequest, StableCoin, UpdateReserveAddressRequest, UpdateReserveAmountRequest,ReserveDataFeed,GetReserveAmountRequest} from 'hedera-stable-coin-sdk';



import { useEffect, useState } from 'react';

import type { FieldValues} from 'react-hook-form';
import { useForm} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';

import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import { SELECTED_WALLET_ACCOUNT_INFO, SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';

const StableCoinProof =  () => {



const { t } = useTranslation('proofOfReserve');

const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
const account = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
const [reserveAddress,setReserveAddress] = useState <string|undefined>(undefined)
const [reserveAmount,setReserveAmount] = useState <string|undefined>(undefined)

useRefreshCoinInfo();

const form = useForm<FieldValues>({
	mode: 'onChange',
	
});

const {
	control,
	getValues,
	setValue
} = form;

useEffect( () => {
	updateReserveAddressState(selectedStableCoin, setReserveAddress);
	updateReserveAmountState(selectedStableCoin, setReserveAmount);
}, [selectedStableCoin?.tokenId]);

useEffect( () => {
	if (reserveAddress){
		setValue('reserveAddress',reserveAddress)
	}
}, [reserveAddress]);

const UpdateReserveAddress = async () => {
	const { reserveAddress} =
	getValues();
	if (selectedStableCoin?.tokenId){
		alert(reserveAddress)
		const request = new UpdateReserveAddressRequest({tokenId:selectedStableCoin.tokenId.toString(),reserveAddress})
		
		const status = await StableCoin.updateReserveAddress(request);
		alert(status);


	}
	
	
}

const updateReserveAmount = async () => {
	const { updateReserveAmount,reserveAddress} =
	getValues();
	alert(reserveAddress);
	alert(updateReserveAmount);
	const request = new UpdateReserveAmountRequest({ reserveAddress,
        reserveAmount:updateReserveAmount});	
	let status = await ReserveDataFeed.updateReserveAmount(request);
	alert(status)
	

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
							isReadOnly={false}	
						/>
						</GridItem>
						<GridItem  >
							
						<InputController
							control={control}
							name={'reserveAddress'}
							label={t('reserveAddress')}
							
							isReadOnly={false}	
							rightElement={<Button
								data-testid={`stepper-step-panel-button-secondary`}
								variant='secondary'
								onClick={UpdateReserveAddress}
								width='2em'
								placeContent={"center"}
							>
							<RepeatIcon />
							</Button>}
						/>
						
							
						</GridItem>

						<GridItem w='100%' >
						
							<Stack>
							<InputController
							isRequired
							control={control}
							name={'currentReserveAmount'}
							label={t('currentReserveAmount')}
							value={reserveAmount}
							isReadOnly={true}
							disabled={true}
						/>
						
						
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

async function updateReserveAddressState(selectedStableCoin: any, setReserveAddress:any) {
	let request: GetReserveAddressRequest;
	if (selectedStableCoin?.tokenId) {
		request = new GetReserveAddressRequest({ tokenId: selectedStableCoin.tokenId.toString() });
		setReserveAddress(await StableCoin.getReserveAddress(request));
	}
}


async function updateReserveAmountState(selectedStableCoin: any, setReserveAmount:any) {
	let request: GetReserveAmountRequest;
	if (selectedStableCoin?.tokenId) {
		request = new GetReserveAmountRequest({ tokenId:selectedStableCoin.tokenId });
	    const amount = (await ReserveDataFeed.getReserveAmount(request))
		console.log(amount)
		console.log(amount.value.toString())
		setReserveAmount(amount.value.toString());
	}
}