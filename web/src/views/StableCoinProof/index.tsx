import { Button, Flex, Heading, SimpleGrid, Text, useDisclosure, VStack } from '@chakra-ui/react';

import { UpdateReserveAddressRequest, UpdateReserveAmountRequest } from 'hedera-stable-coin-sdk';

import type { ReactNode } from 'react';
import { useState } from 'react';

import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import AwaitingWalletSignature from '../../components/AwaitingWalletSignature';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';
import ModalNotification from '../../components/ModalNotification';
import { propertyNotFound } from '../../constant';

import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import SDKService from '../../services/SDKService';
import {
	SELECTED_TOKEN_RESERVE_ADDRESS,
	SELECTED_TOKEN_RESERVE_AMOUNT,
	SELECTED_WALLET_COIN,
} from '../../store/slices/walletSlice';
import { handleRequestValidation } from '../../utils/validationsHelper';
import NoProofOfReserve from './components/NoProofOfReserve';

const StableCoinProof = () => {
	const [awaitingUpdate, setAwaitingUpdate] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const variant = awaitingUpdate ? 'loading' : success ? 'success' : 'error';

	const { t } = useTranslation(['proofOfReserve', 'global']);

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const reserveAddress = useSelector(SELECTED_TOKEN_RESERVE_ADDRESS);
	const reserveAmount = useSelector(SELECTED_TOKEN_RESERVE_AMOUNT);

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

	const { isLoading } = useRefreshCoinInfo();

	const form = useForm<FieldValues>({
		mode: 'onChange',
	});

	const { control, getValues } = form;

	const handleUpdateReserveAddress = async () => {
		const { reserveAddress } = getValues();
		if (selectedStableCoin?.tokenId) {
			updateReserveAddressRequest.tokenId = selectedStableCoin.tokenId.toString();
			updateReserveAddressRequest.reserveAddress = reserveAddress;

			try {
				onOpen();
				setAwaitingUpdate(true);
				await SDKService.updateReserveAddress(updateReserveAddressRequest);
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
		updateReserveAmountRequest.reserveAddress = reserveAddress?.toString() ?? '';
		updateReserveAmountRequest.reserveAmount = updateReserveAmount;

		try {
			onOpen();
			setAwaitingUpdate(true);
			await SDKService.updateReserveAmount(updateReserveAmountRequest);
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
			{isLoading && <AwaitingWalletSignature />}
			{selectedStableCoin && !isLoading && selectedStableCoin.reserveAddress && (
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
							current: reserveAmount?.toString() ?? '',
							input: (
								<InputController
									control={control}
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
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
									placeholder={
										t('proofOfReserve:updateReserveAmount.inputPlaceholder') ?? propertyNotFound
									}
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
							current: reserveAddress?.toString() ?? '',
							input: (
								<InputController
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
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
									placeholder={
										t('proofOfReserve:updateReserveAddress.inputPlaceholder') ?? propertyNotFound
									}
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
			{selectedStableCoin && !isLoading && !selectedStableCoin.reserveAddress && (
				<NoProofOfReserve />
			)}
		</BaseContainer>
	);
};

export default StableCoinProof;
