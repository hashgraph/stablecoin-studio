import { VStack, Button, useDisclosure, Heading, Text, SimpleGrid, Flex } from '@chakra-ui/react';

import {
	GetReserveAddressRequest,
	UpdateReserveAddressRequest,
	UpdateReserveAmountRequest,
	GetReserveAmountRequest,
} from 'hedera-stable-coin-sdk';

import type { ReactNode } from 'react';
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

	const { control, getValues } = form;

	// Update address and amount state when stable coin changes
	useEffect(() => {
		updateProofOfReserveState();
	}, [selectedStableCoin?.tokenId]);

	// Update address field when loaded
	useEffect(() => {
		if (!reserveAddress && (error || !success)) {
			dispatch(walletActions.setReserveAddress('Error'));
		}
	}, [reserveAddress]);
	useEffect(() => {
		if (!reserveAmount && (error || !success)) {
			dispatch(walletActions.setReserveAmount('Error'));
		}
	}, [reserveAmount]);

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
				dispatch(walletActions.setReserveAmount(amount?.value?.toString()));
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
		const { updateReserveAmount } = getValues();
		updateReserveAmountRequest.reserveAddress = reserveAddress ?? '';
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

	const GridItem = ({
		name,
		title,
		label,
		current,
		input,
		button,
	}: {
		name: string;
		title: string;
		label: string;
		current: string;
		input: ReactNode;
		button: ReactNode;
	}) => (
		<Flex direction='column' alignItems={'center'}>
			<VStack w='100%' alignItems={'start'} gap='6px' maxWidth={'500px'} alignSelf='center'>
				<Heading
					data-testid={name + '-title'}
					fontSize='24px'
					fontWeight='600'
					mb={8}
					lineHeight='15.2px'
					textAlign={'left'}
				>
					{title}
				</Heading>
				<Text data-testid={name + '-label'} style={{ fontWeight: '600' }}>
					{label}
				</Text>
				<Text
					pl='10px'
					data-testid={name + '-value'}
					color={current === 'Error' ? 'red' : ''}
					mb={5}
				>
					{current}
				</Text>
				{input}
				{button}
			</VStack>
		</Flex>
	);

	return (
		<BaseContainer title={t('proofOfReserve:title')}>
			{selectedStableCoin && fetching && <AwaitingWalletSignature />}
			{selectedStableCoin && !fetching && hasReserve && (
				<Flex
					direction='column'
					bg='brand.gray100'
					px={{ base: 4, lg: 14 }}
					pt={{ base: 4, lg: 14 }}
					pb={6}
				>
					<SimpleGrid columns={{ base: 2 }} gap={{ base: 10, lg: 20, md: 40 }} alignItems='center'>
						{GridItem({
							name: 'amount',
							title: t('proofOfReserve:updateReserveAmount.title'),
							label: t('proofOfReserve:updateReserveAmount.label'),
							current: reserveAmount ?? '',
							input: (
								<InputController
									control={control}
									rules={{
										required: t('global:validations.required')!,
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
									name={'updateReserveAmount'}
									placeholder={t('proofOfReserve:updateReserveAmount.inputPlaceholder')!}
									isReadOnly={false}
								/>
							),
							button: (
								<Button
									data-testid={`update-reserve-amount-button`}
									variant='primary'
									onClick={handleUpdateReserveAmount}
								>
									{t('proofOfReserve:updateReserveAmount.buttonText')}
								</Button>
							),
						})}
						{GridItem({
							name: 'address',
							title: t('proofOfReserve:updateReserveAddress.title'),
							label: t('proofOfReserve:updateReserveAddress.label'),
							current: reserveAddress ?? '',
							input: (
								<InputController
									rules={{
										required: t('global:validations.required')!,
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
									placeholder={t('proofOfReserve:updateReserveAddress.inputPlaceholder')!}
								/>
							),
							button: (
								<Button
									data-testid={`update-reserve-address-button`}
									variant='primary'
									onClick={handleUpdateReserveAddress}
								>
									{t('proofOfReserve:updateReserveAddress.buttonText')}
								</Button>
							),
						})}
					</SimpleGrid>
				</Flex>
			)}
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
			{selectedStableCoin && !fetching && !hasReserve && <NoProofOfReserve />}
		</BaseContainer>
	);
};

export default StableCoinProof;
