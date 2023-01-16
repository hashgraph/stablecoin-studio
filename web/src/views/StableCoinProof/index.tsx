import { RepeatIcon } from '@chakra-ui/icons';
import { Box, Grid, GridItem, VStack, Stack, Button, useDisclosure } from '@chakra-ui/react';

import {
	GetReserveAddressRequest,
	StableCoin,
	UpdateReserveAddressRequest,
	UpdateReserveAmountRequest,
	ReserveDataFeed,
	GetReserveAmountRequest,
} from 'hedera-stable-coin-sdk';

import { useEffect, useState } from 'react';

import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';
import ModalNotification from '../../components/ModalNotification';

import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import NoProofOfReserve from './components/NoProofOfReserve';

const StableCoinProof = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const variant = loading ? 'loading' : success ? 'success' : 'error';

	const { t } = useTranslation('proofOfReserve');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const [fetchedReserveAddress, setFetchedReserveAddress] = useState<string | undefined>(undefined);
	const [fetchedReserveAmount, setFetchedReserveAmount] = useState<string | undefined>(undefined);
	const [hasReserve, sethasReserve] = useState<boolean>(false);

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
		if (fetchedReserveAddress) {
			setValue('reserveAddress', fetchedReserveAddress);
		}
		if (fetchedReserveAmount) {
			setValue('currentReserveAmount', fetchedReserveAmount);
		}
	}, [fetchedReserveAddress, fetchedReserveAmount]);

	const updateProofOfReserveState = async () => {
		let request: GetReserveAddressRequest;
		if (selectedStableCoin?.tokenId) {
			request = new GetReserveAddressRequest({ tokenId: selectedStableCoin.tokenId.toString() });
			const result = await StableCoin.getReserveAddress(request);
			if (result === '0.0.0' || !result) {
				sethasReserve(false);
			} else {
				sethasReserve(true);
			}
			setFetchedReserveAddress(result);
			request = new GetReserveAmountRequest({ tokenId: selectedStableCoin.tokenId.toString() });
			const amount = await ReserveDataFeed.getReserveAmount(request);
			setFetchedReserveAmount(amount.value.toString());
		}
	};

	const handleUpdateReserveAddress = async () => {
		const { reserveAddress } = getValues();
		if (selectedStableCoin?.tokenId) {
			const request = new UpdateReserveAddressRequest({
				tokenId: selectedStableCoin.tokenId.toString(),
				reserveAddress,
			});

			try {
				onOpen();
				setLoading(true);
				const result = await StableCoin.updateReserveAddress(request);
				if (result) {
					await updateProofOfReserveState();
				}
				setError('');
				setLoading(false);
				setSuccess(true);
			} catch (error: any) {
				setLoading(false);
				console.log(error);
				setError(error?.transactionError?.transactionUrl);
				setSuccess(false);
				setLoading(false);
			}
		}
	};

	const handleUpdateReserveAmount = async () => {
		const { updateReserveAmount, reserveAddress } = getValues();

		const request = new UpdateReserveAmountRequest({
			reserveAddress,
			reserveAmount: updateReserveAmount,
		});

		try {
			onOpen();
			setLoading(true);
			const result = await ReserveDataFeed.updateReserveAmount(request);
			if (result) {
				await updateProofOfReserveState();
			}
			setError('');
			setLoading(false);
			setSuccess(true);
		} catch (error: any) {
			setLoading(false);
			console.log(error);
			setError(error?.transactionError?.transactionUrl);
			setSuccess(false);
			setLoading(false);
		}
	};

	return (
		<BaseContainer title={t('title')}>
			{selectedStableCoin && hasReserve && (
				<Box p={{ base: 4, md: '128px' }}>
					<VStack h='full' justify={'space-between'} pt='80px'>
						<Stack h='full'>
							<ModalNotification
								variant={variant}
								title={
									loading
										? 'Loading'
										: t('notification.title', { result: success ? 'Success' : 'Error' })
								}
								description={
									loading
										? undefined
										: t(`notification.description${success ? 'Success' : 'Error'}`)
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
										label={t('reserveAmount')}
										placeholder={t('reserveAmountToolTip')}
										isReadOnly={false}
									/>
								</GridItem>
								<GridItem>
									<InputController
										control={control}
										name={'reserveAddress'}
										label={t('reserveAddress')}
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
											isRequired
											control={control}
											name={'currentReserveAmount'}
											label={t('currentReserveAmount')}
											isReadOnly={true}
											disabled={true}
										/>

										<Button
											data-testid={`update-reserve-amount-button`}
											variant='secondary'
											onClick={handleUpdateReserveAmount}
										>
											{t('sendAmount')}
										</Button>
									</Stack>
								</GridItem>
							</Grid>
						</Stack>
					</VStack>
				</Box>
			)}
			{selectedStableCoin && !hasReserve && <NoProofOfReserve />}
		</BaseContainer>
	);
};

export default StableCoinProof;
