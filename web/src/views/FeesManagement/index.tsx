import {
	Button,
	useDisclosure,
	Flex,
	Box,
	Td,
	Stack,
	Grid,
	GridItem,
	Tr,
	SimpleGrid,
} from '@chakra-ui/react';

import type { ChangeEvent } from 'react';
import { useState } from 'react';

import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AwaitingWalletSignature from '../../components/AwaitingWalletSignature';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';
import { propertyNotFound } from '../../constant';
import type { Option } from '../../components/Form/SelectController';
import { SelectController } from '../../components/Form/SelectController';
import Icon from '../../components/Icon';

import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import {
	SELECTED_TOKEN_RESERVE_ADDRESS,
	SELECTED_TOKEN_RESERVE_AMOUNT,
	SELECTED_WALLET_COIN,
	walletActions,
} from '../../store/slices/walletSlice';
import {
	AddFixedFeeRequest,
	AddFractionalFeeRequest,
	BigDecimal,
	CustomFee,
} from 'hedera-stable-coin-sdk';
import { handleRequestValidation } from '../../utils/validationsHelper';
import NoFeesManagement from './components/NoFeesManagement';
import FeeSelectController from './components/FeeSelectController';
const FeesManagement = () => {
	const [awaitingUpdate, setAwaitingUpdate] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const variant = awaitingUpdate ? 'loading' : success ? 'success' : 'error';

	const { t } = useTranslation(['feesManagement', 'global']);
	const dispatch = useDispatch();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	const [fixedFeeRequest] = useState(
		new AddFixedFeeRequest({
			tokenId: '',
			collectorId: '',
			tokenIdCollected: '',
			amount: '0',
			decimals: 2,
			collectorsExempt: true,
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
			collectorsExempt: true,
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
			width: '120px',
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
	const styles = {
		menuList: {
			maxH: '220px',
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 2,
			zIndex: 99,
		},
		wrapper: {
			border: '1px',
			borderColor: 'brand.black',
			borderRadius: '8px',
			height: 'min',
			width: '120px',
		},
		valueSelected: {
			fontSize: '14px',
			fontWeight: '500',
		},
		// wrapperOpened: { borderWidth: '0' },
		container: {
			// minW: '244px',
			w: 'fit-content',
		},
	};

	const isLoading = useRefreshCoinInfo();

	const form = useForm<FieldValues>({
		mode: 'onChange',
	});

	const { control, getValues } = form;

	function getCustomFees() {
		const customFees = new Array(selectedStableCoin?.customFees?.length);
		selectedStableCoin?.customFees!.forEach((x, i) => {
			customFees[i] = JSON.parse(JSON.stringify(x));
		});
		return customFees;
	}

	const handleAddNewRow = async () => {
		if (selectedStableCoin?.customFees) {
			const customFees = [...selectedStableCoin?.customFees, new CustomFee()];
			dispatch(
				walletActions.setSelectedStableCoin({
					...selectedStableCoin,
					customFees,
				}),
			);
		}
	};

	const handleUpdateTokenFees = async () => {
		const formData = getValues();
		for (let i = 0; i < 10; i++) {
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
		'Moneda',
		t('feesManagement:columns:actions'),
	];

	const customFees = getCustomFees();

	const [options, setOptions] = useState<Option[]>([
		{ label: 'HBAR', value: 'HBAR' },
		{ label: 'Current token', value: selectedStableCoin!.tokenId!.toString() },
		{ label: 'Another token', value: '' },
	]);
	const onChangeFee = (event: ChangeEvent<HTMLInputElement>) => {
		console.log(event);
	};
	console.log(feeData);

	return (
		<BaseContainer title={t('feesManagement:title')}>
			{isLoading && <AwaitingWalletSignature />}
			{selectedStableCoin && !isLoading && selectedStableCoin.feeScheduleKey && (
				<Flex
					direction='column'
					bg='brand.gray100'
					px={{ base: 4, lg: 14 }}
					pt={{ base: 4, lg: 14 }}
					pb={6}
				>
					<SimpleGrid columns={{ base: 9 }} gap={{ base: 4 }}>
						{feeData.map((feeColumn: string, index: number) => (
							<GridItem key={`details-fee-${index}`} fontSize='14px' fontWeight='bold'>
								{feeColumn}
							</GridItem>
						))}

						{customFees.map((_, i: number) => {
							return (
								<>
									<GridItem>
										<SelectController
											control={control}
											name={`feeType-${i}`}
											options={feeTypes}
											overrideStyles={selectorStyle}
											addonLeft={true}
											variant='unstyled'
											defaultValue={
												customFees[i] !== undefined
													? customFees[i].amountDenominator
														? '1'
														: '0'
													: '0'
											}
										/>
									</GridItem>
									<GridItem>
										<InputController
											control={control}
											rules={{
												required: t('global:validations.required') ?? propertyNotFound,
												validate: {
													validation: (value: string) => {
														fixedFeeRequest.amount = value;
														const res = handleRequestValidation(fixedFeeRequest.validate('amount'));
														return res;
													},
												},
											}}
											name={`amountOrPercentage-${i}`}
											placeholder={t('amountPlaceholder') ?? propertyNotFound}
											defaultValue={
												customFees[i] !== undefined
													? customFees[i].amount
														? customFees[i].amount._value
														: ''
													: ''
											}
											isReadOnly={false}
										/>
									</GridItem>
									<GridItem>
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
											placeholder={t('minPlaceholder') ?? propertyNotFound}
											defaultValue={
												customFees[i] !== undefined && customFees[i].min
													? customFees[i].min._value.toString()
													: ''
											}
											isReadOnly={false}
										/>
									</GridItem>
									<GridItem>
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
											placeholder={t('maxPlaceholder') ?? propertyNotFound}
											defaultValue={
												customFees[i] !== undefined && customFees[i].max
													? customFees[i].max._value.toString()
													: ''
											}
											isReadOnly={false}
										/>
									</GridItem>
									<GridItem>
										<InputController
											rules={{
												required: t('global:validations.required') ?? propertyNotFound,
												validate: {
													validation: (value: string) => {
														fixedFeeRequest.collectorId = value;
														const res = handleRequestValidation(
															fixedFeeRequest.validate('collectorId'),
														);
														return res;
													},
												},
											}}
											isRequired
											control={control}
											name={`collectorAccount-${i}`}
											placeholder={t('collectorAccountPlaceholder') ?? propertyNotFound}
											defaultValue={
												customFees[i] !== undefined && customFees[i].collectorId !== undefined
													? customFees[i].collectorId.value.toString()
													: ''
											}
											isReadOnly={false}
										/>
									</GridItem>
									<GridItem>
										<SelectController
											control={control}
											name={`collectorsExempt-${i}`}
											options={collectorsExempt}
											overrideStyles={selectorStyle}
											addonLeft={true}
											variant='unstyled'
											defaultValue={
												customFees[i] !== undefined
													? customFees[i].collectorsExempt
														? '1'
														: '0'
													: '1'
											}
										/>
									</GridItem>
									<GridItem>
										<SelectController
											control={control}
											name={`senderOrReceiver-${i}`}
											options={senderOrReceiver}
											overrideStyles={selectorStyle}
											addonLeft={true}
											variant='unstyled'
											defaultValue={
												customFees[i] !== undefined
													? customFees[i].amountDenominator
														? customFees[i].net
															? '0'
															: '1'
														: '0'
													: '0'
											}
										/>
									</GridItem>
									<GridItem>
										<FeeSelectController
											styles={selectorStyle}
											name='moneda'
											control={control}
											options={options}
											onChangeAux={onChangeFee}
										/>
									</GridItem>
									<GridItem>
										<Icon name='Trash' fontSize='22px' />
									</GridItem>
								</>
							);
						})}
					</SimpleGrid>
					<Flex justify='flex-end' pt={6} px={6} pb={6}>
						<Stack direction='row' spacing={6}>
							<Button variant='primary' onClick={handleUpdateTokenFees}>
								{t('updateTokenFees.saveChangesButtonText')}
							</Button>
							<Button
								variant='primary'
								onClick={handleAddNewRow}
								isDisabled={customFees.length > 9}
							>
								{t('updateTokenFees.addRowButtonText')}
							</Button>
						</Stack>
					</Flex>
				</Flex>
			)}

			{selectedStableCoin && !isLoading && !selectedStableCoin.feeScheduleKey && (
				<NoFeesManagement />
			)}
		</BaseContainer>
	);
};

export default FeesManagement;
