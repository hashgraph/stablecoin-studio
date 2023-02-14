import { VStack, Button, useDisclosure, Heading, Text, SimpleGrid, Flex, Box, Spacer, Divider, TableContainer, Table, TableCaption, Tr, Th, Td, Tbody, Thead, Center } from '@chakra-ui/react';

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
import { SelectController } from '../../components/Form/SelectController';
import Icon from '../../components/Icon';

import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import SDKService from '../../services/SDKService';
import {
	SELECTED_TOKEN_RESERVE_ADDRESS,
	SELECTED_TOKEN_RESERVE_AMOUNT,
	SELECTED_WALLET_COIN,
} from '../../store/slices/walletSlice';
import { AddFixedFeeRequest, AddFractionalFeeRequest } from 'hedera-stable-coin-sdk';
import { handleRequestValidation } from '../../utils/validationsHelper';
import NoFeesManagement from './components/NoFeesManagement';

const StableCoinProof = () => {
	const [awaitingUpdate, setAwaitingUpdate] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const variant = awaitingUpdate ? 'loading' : success ? 'success' : 'error';

	const { t } = useTranslation(['feesManagement', 'global']);

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const reserveAddress = useSelector(SELECTED_TOKEN_RESERVE_ADDRESS);
	const reserveAmount = useSelector(SELECTED_TOKEN_RESERVE_AMOUNT);

	const [fixedFeeRequest] = useState(
		new AddFixedFeeRequest({
			tokenId: '',
			collectorId: '',
			tokenIdCollected: '',
			amount: '0',
			decimals: 2,
			collectorsExempt: true
		}),
	);

	const [fractionalFeeRequest] = useState(
		new AddFractionalFeeRequest({
			tokenId: '',
			collectorId: '',
			amountNumerator: '0',
			amountDenominator: '0',
			min: '0',
			max: '0',
			decimals: 2,
			net: false,
			collectorsExempt: true			
		}),
	);

	const feeTypes = [
		{
			value: 0,
			label: t('feeType.fixed'),
		},
		{
			value: 1,
			label: t('feeType.fractional'),
		},
	];

	const collectorsExempt = [
		{
			value: 0,
			label: 'false',
		},
		{
			value: 1,
			label: 'true',
		},
	];

	const senderOrReceiver = [
		{
			value: 0,
			label: 'sender',
		},
		{
			value: 1,
			label: 'receiver',
		},
	];

	const selectorStyle = {
		wrapper: {
			border: '1px',
			borderColor: 'brand.black',
			borderRadius: '8px',
			height: 'min',
			width: '120px'
		},
		menuList: {
			maxH: '220px',
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 2,
			zIndex: 99,
		},
		valueSelected: {
			fontSize: '14px',
			fontWeight: '500',
		},
	};

	const isLoading = useRefreshCoinInfo();

	const form = useForm<FieldValues>({
		mode: 'onChange',
	});

	const { control, getValues } = form;

	function getCustomFees() {
		const customFees = new Array(10);
		selectedStableCoin?.customFees!.forEach((x, i) => {
			customFees[i] = JSON.parse(JSON.stringify(x));
		});		
		return customFees;
	}

	const handleUpdateTokenFees = async () => {
		const formData = getValues();
		console.log(formData);
		for (let i=0; i < 10; i++) {
			const feeType = formData[`feeType-${i}`].value;
			console.log(`feeType-${i}: ${feeType}`);
			const collectorsExempt = formData[`collectorsExempt-${i}`].value;
			console.log(`collectorsExempt-${i}: ${collectorsExempt}`);
			const amountOrPercentage = formData[`amountOrPercentage-${i}`];
			console.log(`amountOrPercentage-${i}: ${amountOrPercentage}`);
		}
	};	

	const feeData = [
		t('feesManagement:columns:feeType'),
		t('feesManagement:columns:amount'),
		t('feesManagement:columns:minimumAmount'),
		t('feesManagement:columns:maximumAmount'),
		t('feesManagement:columns:collectorAccount'),
		t('feesManagement:columns:collectorsExempt'),
		t('feesManagement:columns:assessmentMethod'),
		t('feesManagement:columns:actions')
	]
	
	const customFees = getCustomFees();

	return (
		<BaseContainer title={t('feesManagement:title')}>
			{isLoading && <AwaitingWalletSignature />}
			{selectedStableCoin && !isLoading && selectedStableCoin.feeScheduleKey && (
				<Flex
					px={{ base: 3, lg: 10 }}
					pt={{ base: 3, lg: 10}}
					bg='brand.gray100'>
					<Box flex={1}>			
						<TableContainer>
							<Table variant='simple'>
								<Thead>
									<Tr>
										{feeData.map((feeColumn: string, index: number) => (
											<Td key={`details-fee-${index}`}
												fontSize='14px'
												fontWeight='bold'>
												{feeColumn}
											</Td>
										))}
									</Tr>
								</Thead>
								<Tbody>
									{[...Array(10).fill(0)].map((_, i: number) => (
										<Tr key={`fee-${i}`}>
											<Td>
												<SelectController
													control={control}
													name={`feeType-${i}`}
													options={feeTypes}
													overrideStyles={selectorStyle}
													addonLeft={true}
													variant='unstyled'
													defaultValue={customFees[i] !== undefined ? customFees[i].amountDenominator ? '1' : '0' : '0'}
												/>
											</Td>
											<Td>
												<InputController
													control={control}
													rules={{
														required: t('global:validations.required') ?? propertyNotFound,
														validate: {
															validation: (value: string) => {
																fixedFeeRequest.amount = value;
																const res = handleRequestValidation(
																	fixedFeeRequest.validate('amount'),
																);
																return res;
															},
														},
													}}
													name={`amountOrPercentage-${i}`}
													placeholder={
														t('amountPlaceholder') ?? propertyNotFound
													}
													defaultValue={customFees[i] !== undefined ? customFees[i].amount ? customFees[i].amount._value : '' : ''}
													isReadOnly={false}
												/>
											</Td>
											<Td>
												<InputController
													control={control}
													rules={{
														required: t('global:validations.required') ?? propertyNotFound,
														validate: {
															validation: (value: string) => {
																fractionalFeeRequest.min = value;
																const res = handleRequestValidation(
																	fractionalFeeRequest.validate('min'),
																);
																return res;
															},
														},
													}}
													name={`min-${i}`}
													placeholder={
														t('minPlaceholder') ?? propertyNotFound
													}
													defaultValue={customFees[i] !== undefined && customFees[i].min ? customFees[i].min._value.toString() : ''}
													isReadOnly={false}
												/>																								
											</Td>
											<Td>
											<InputController
													control={control}
													rules={{
														required: t('global:validations.required') ?? propertyNotFound,
														validate: {
															validation: (value: string) => {
																fractionalFeeRequest.max = value;
																const res = handleRequestValidation(
																	fractionalFeeRequest.validate('max'),
																);
																return res;
															},
														},
													}}
													name={`max-${i}`}
													placeholder={
														t('maxPlaceholder') ?? propertyNotFound
													}
													defaultValue={customFees[i] !== undefined && customFees[i].max ? customFees[i].max._value.toString() : ''}
													isReadOnly={false}
												/>																				
											</Td>
											<Td>
												<InputController
													rules={{
														required: t('global:validations.required') ?? propertyNotFound,
														validate: {
															validation: (value: string) => {
																fixedFeeRequest.collectorId = value;
																const res = handleRequestValidation(fixedFeeRequest.validate('collectorId'));
																return res;
															},
														},
													}}
													isRequired
													control={control}
													name={`collectorAccount-${i}`}
													placeholder={t('collectorAccountPlaceholder') ?? propertyNotFound}
													defaultValue={customFees[i] !== undefined ? customFees[i].collectorId.value.toString() : ''}
													isReadOnly={false}		
												/>										
											</Td>
											<Td>
												<SelectController
													control={control}
													name={`collectorsExempt-${i}`}
													options={collectorsExempt}
													overrideStyles={selectorStyle}
													addonLeft={true}
													variant='unstyled'
													defaultValue={customFees[i] !== undefined ? customFees[i].collectorsExempt ? '1' : '0' : '1'}
												/>
											</Td>
											<Td>
												<SelectController
													control={control}
													name={`senderOrReceiver-${i}`}
													options={senderOrReceiver}
													overrideStyles={selectorStyle}
													addonLeft={true}
													variant='unstyled'
													defaultValue={customFees[i] !== undefined ? customFees[i].amountDenominator ? customFees[i].net ? '0' : '1'  : '0' : '0'}
												/>												
											</Td>
											<Td><Icon name="Trash" fontSize='22px'/></Td>
											{/* <Td display={customFees[i] !== undefined ? 'block' : 'none'}><Icon name="Trash" fontSize='22px'/></Td> */}
										</Tr>
									))} 
								</Tbody>
							</Table>
						</TableContainer>					
						<Flex>
  							<Spacer />
  							<Box p='6'>
  								<Button	data-testid={`update-token-fees-button`}
										variant='primary'
										onClick={handleUpdateTokenFees}>
											{t('updateTokenFees.buttonText')}
								</Button>	
  							</Box>
						</Flex>
					</Box>
				</Flex>
			)}
			
			{selectedStableCoin && !isLoading && !selectedStableCoin.feeScheduleKey &&  (
				<NoFeesManagement />
			)}
		</BaseContainer>
	);
};

export default StableCoinProof;
