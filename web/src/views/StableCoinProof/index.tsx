import { RepeatIcon } from '@chakra-ui/icons';
import { Box, Grid, GridItem, VStack, Stack, Button, useDisclosure } from '@chakra-ui/react';

import {
	GetReserveAddressRequest,
	UpdateReserveAddressRequest,
	UpdateReserveAmountRequest,
	GetReserveAmountRequest,
} from 'hedera-stable-coin-sdk';

import { useEffect, useState } from 'react';

import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AwaitingWalletSignature from '../../components/AwaitingWalletSignature';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';
import ModalNotification from '../../components/ModalNotification';

import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import SDKService from '../../services/SDKService';
import {
	SELECTED_TOKEN_RESERVE_ADDRESS,
	SELECTED_TOKEN_RESERVE_AMOUNT,
	SELECTED_WALLET_COIN,
	walletActions,
} from '../../store/slices/walletSlice';
import { handleRequestValidation } from '../../utils/validationsHelper';
import NoProofOfReserve from './components/NoProofOfReserve';

const StableCoinProof = () => {
	const dispatch = useDispatch();
	const [awaitingUpdate, setAwaitingUpdate] = useState<boolean>(false);
	const [fetching, setFetching] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const variant = awaitingUpdate ? 'loading' : success ? 'success' : 'error';

	const { t } = useTranslation(['proofOfReserve', 'global']);

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const reserveAddress = useSelector(SELECTED_TOKEN_RESERVE_ADDRESS);
	const reserveAmount = useSelector(SELECTED_TOKEN_RESERVE_AMOUNT);

	const [hasReserve, sethasReserve] = useState<boolean>(false);
	const [updateReserveAddressRequest] = useState<UpdateReserveAddressRequest>(
		new UpdateReserveAddressRequest({
			tokenId: '',
			reserveAddress: '',
		}),
	);
	const [updateReserveAmountRequest] = useState<UpdateReserveAmountRequest>(
		new UpdateReserveAmountRequest({
			reserveAddress: '',
			reserveAmount: '',
		}),
	);

	useRefreshCoinInfo();

	const form = useForm<FieldValues>({
		mode: 'onChange',
	});

	const { control, getValues, setValue } = form;

	// Update address and amount state when stable coin changes
	useEffect(() => {
		updateProofOfReserveState();
	}, [selectedStableCoin?.tokenId]);

	// Update address field when loaded
	useEffect(() => {
		if (reserveAddress) {
			setValue('reserveAddress', reserveAddress);
		} else if(error || !success) {
			setValue('reserveAddress', 'Error');
		}
		if (reserveAmount) {
			setValue('currentReserveAmount', reserveAmount);
		} else if (error || !success) {
			setValue('currentReserveAmount', 'Error');
		}
	}, [reserveAddress, reserveAmount]);

	const updateProofOfReserveState = async () => {
		let request: GetReserveAddressRequest;
		try {
			setFetching(true);
			if (selectedStableCoin?.tokenId) {
				request = new GetReserveAddressRequest({ tokenId: selectedStableCoin.tokenId.toString() });
				const result = await SDKService.getReserveAddress(request);
				if (result === '0.0.0' || !result) {
					sethasReserve(false);
				} else {
					sethasReserve(true);
				}
				dispatch(walletActions.setReserveAddress(result));
				request = new GetReserveAmountRequest({ tokenId: selectedStableCoin.tokenId.toString() });
				const amount = await SDKService.getReserveAmount(request);
				dispatch(walletActions.setReserveAmount(amount.value.toString()));
			}
		} catch (error) {
			console.error(error);
		} finally {
			setFetching(false);
		}
	};

	const handleUpdateReserveAddress = async () => {
		const { reserveAddress } = getValues();
		if (selectedStableCoin?.tokenId) {
			updateReserveAddressRequest.tokenId = selectedStableCoin.tokenId.toString();
			updateReserveAddressRequest.reserveAddress = reserveAddress;

			try {
				onOpen();
				setAwaitingUpdate(true);
				const result = await SDKService.updateReserveAddress(updateReserveAddressRequest);
				if (result) {
					await updateProofOfReserveState();
				}
				setError('');
				setAwaitingUpdate(false);
				setSuccess(true);
			} catch (error: any) {
				setAwaitingUpdate(false);
				console.log(error);
				setError(error?.transactionError?.transactionUrl);
				setSuccess(false);
				setAwaitingUpdate(false);
			}
		}
	};

	const handleUpdateReserveAmount = async () => {
		const { updateReserveAmount, reserveAddress } = getValues();

		updateReserveAmountRequest.reserveAddress = reserveAddress;
		updateReserveAmountRequest.reserveAmount = updateReserveAmount;

		try {
			onOpen();
			setAwaitingUpdate(true);
			const result = await SDKService.updateReserveAmount(updateReserveAmountRequest);
			if (result) {
				await updateProofOfReserveState();
			}
			setError('');
			setAwaitingUpdate(false);
			setSuccess(true);
		} catch (error: any) {
			setAwaitingUpdate(false);
			console.log(error);
			setError(error?.transactionError?.transactionUrl);
			setSuccess(false);
			setAwaitingUpdate(false);
		}
	};

	return (
		<BaseContainer title={t('proofOfReserve:title')}>
			{selectedStableCoin && fetching && <AwaitingWalletSignature />}
			{selectedStableCoin && !fetching && hasReserve && (
				<Box p={{ base: 4, md: '128px' }}>
					<VStack h='full' justify={'space-between'} pt='80px'>
						<Stack h='full'>
							<ModalNotification
								variant={variant}
								title={
									awaitingUpdate
										? 'Loading'
										: t('proofOfReserve:notification.title', {
												result: success ? 'Success' : 'Error',
										  })
								}
								description={
									awaitingUpdate
										? undefined
										: t(`proofOfReserve:notification.description${success ? 'Success' : 'Error'}`)
								}
								isOpen={isOpen}
								onClose={onClose}
								onClick={onClose}
								errorTransactionUrl={error}
								closeButton={false}
								closeOnOverlayClick={false}
							/>
							<Grid templateColumns='repeat(2, 1fr)' gap={6}>
								<GridItem>
									<InputController
										control={control}
										name={'updateReserveAmount'}
										label={t('proofOfReserve:reserveAmount')}
										placeholder={t('proofOfReserve:reserveAmountToolTip')}
										isReadOnly={false}
									/>
								</GridItem>
								<GridItem>
									<InputController
										rules={{
											required: t('global:validations.required'),
											validate: {
												validation: (value: string) => {
													updateReserveAddressRequest.reserveAddress = value;
													const res = handleRequestValidation(
														updateReserveAddressRequest.validate('reserveAddress'),
													);
													return res;
												},
											},
										}}
										control={control}
										name={'reserveAddress'}
										label={t('proofOfReserve:reserveAddress')}
										right='1em'
										isReadOnly={false}
										rightElement={
											<Button
												data-testid={`update-reserve-address-button`}
												variant='secondary'
												onClick={handleUpdateReserveAddress}
												width='1em'
												placeContent={'center'}
											>
												<RepeatIcon />
											</Button>
										}
									/>
								</GridItem>

								<GridItem w='100%'>
									<Stack>
										<InputController
											rules={{
												required: t('global:validations.required'),
												validate: {
													validation: (value: string) => {
														updateReserveAmountRequest.reserveAmount = value;
														const res = handleRequestValidation(
															updateReserveAmountRequest.validate('reserveAmount'),
														);
														return res;
													},
												},
											}}
											control={control}
											name={'currentReserveAmount'}
											label={t('proofOfReserve:currentReserveAmount')}
											isReadOnly={true}
											disabled={true}
										/>

										<Button
											data-testid={`update-reserve-amount-button`}
											variant='secondary'
											onClick={handleUpdateReserveAmount}
										>
											{t('proofOfReserve:sendAmount')}
										</Button>
									</Stack>
								</GridItem>
							</Grid>
						</Stack>
					</VStack>
				</Box>
			)}
			{selectedStableCoin && !fetching && !hasReserve && <NoProofOfReserve />}
		</BaseContainer>
	);
};

export default StableCoinProof;
