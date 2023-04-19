import { Button, useDisclosure, Flex, GridItem, InputRightElement, Grid } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';
import { propertyNotFound } from '../../constant';
import { SelectController } from '../../components/Form/SelectController';
import Icon from '../../components/Icon';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import NoFeesManagement from './components/NoFeesManagement';
import {
	AddFixedFeeRequest,
	AddFractionalFeeRequest,
	UpdateCustomFeesRequest,
	GetStableCoinDetailsRequest,
	HBAR_DECIMALS,
	MAX_CUSTOM_FEES,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import type {
	RequestFractionalFee,
	RequestCustomFee,
	RequestFixedFee,
	StableCoinViewModel,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import { handleRequestValidation } from '../../utils/validationsHelper';
import SDKService from '../../services/SDKService';
import SelectCreatableController from '../../components/Form/SelectCreatableController';
import ModalNotification from '../../components/ModalNotification';

type FeeTypes = RequestFractionalFee | RequestFixedFee | RequestCustomFee;

const FeesManagement = () => {
	const [awaitingUpdate, setAwaitingUpdate] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const { t } = useTranslation(['feesManagement', 'global']);
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const variant = awaitingUpdate ? 'loading' : success ? 'success' : 'error';
	const { control, getValues, setValue, watch, handleSubmit, formState } = useForm({
		mode: 'onChange',
	});
	const {
		fields: fees,
		append,
		remove,
	} = useFieldArray({
		control,
		name: 'fees',
	});

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	const isMaxFees = useMemo(() => fees.length >= MAX_CUSTOM_FEES, [fees]);

	enum FeeTypeValue {
		FIXED,
		FRACTIONAL,
	}

	const initialFeeTypeValues: FeeTypeValue[] = [];

	const emptyFixedFee = new AddFixedFeeRequest({
		tokenId: selectedStableCoin!.tokenId!.toString(),
		collectorId: '',
		collectorsExempt: true,
		decimals: HBAR_DECIMALS,
		tokenIdCollected: '0.0.0',
		amount: '',
	});
	const initialFixedFee: AddFixedFeeRequest[] = [];

	const emptyFractionalFee = new AddFractionalFeeRequest({
		tokenId: selectedStableCoin!.tokenId!.toString(),
		collectorId: '',
		collectorsExempt: true,
		decimals: selectedStableCoin!.decimals!,
		percentage: '',
		amountNumerator: '',
		amountDenominator: '',
		min: '',
		max: '',
		net: false,
	});
	const initialFractionalFee: AddFractionalFeeRequest[] = [];

	const [FeeTypeValues, setFeeTypeValues] = useState(initialFeeTypeValues);
	const [fixedFee, setFixedFee] = useState(initialFixedFee);
	const [fractionalFee, setFractionalFee] = useState(initialFractionalFee);
	const [isLoading, setIsLoading] = useState<boolean[]>([]);

	const addFixedFee = (fee: AddFixedFeeRequest) => {
		const currentFixedFee = fixedFee;
		currentFixedFee.push(fee);
		setFixedFee(currentFixedFee);
	};
	const removeFixedFee = (i: number) => {
		const currentFixedFee = fixedFee;
		currentFixedFee.splice(i, 1);
		setFixedFee(currentFixedFee);
	};
	const changeFixedFee = (fee: AddFixedFeeRequest, i: number) => {
		const currentFixedFee = fixedFee;
		currentFixedFee[i] = fee;
		setFixedFee(currentFixedFee);
	};

	const addFractionalFee = (fee: AddFractionalFeeRequest) => {
		const currentFractionalFee = fractionalFee;
		currentFractionalFee.push(fee);
		setFractionalFee(currentFractionalFee);
	};
	const removeFractionalFee = (i: number) => {
		const currentFractionalFee = fractionalFee;
		currentFractionalFee.splice(i, 1);
		setFractionalFee(currentFractionalFee);
	};
	const changeFractionalFee = (fee: AddFractionalFeeRequest, i: number) => {
		const currentFractionalFee = fractionalFee;
		currentFractionalFee[i] = fee;
		setFractionalFee(currentFractionalFee);
	};

	const addFeeTypeValues = (feeType: FeeTypeValue) => {
		const currentFeeTypeValue = FeeTypeValues;
		currentFeeTypeValue.push(feeType);
		setFeeTypeValues(currentFeeTypeValue);
	};
	const removeFeeTypeValues = (i: number) => {
		const currentFeeTypeValue = FeeTypeValues;
		currentFeeTypeValue.splice(i, 1);
		setFeeTypeValues(currentFeeTypeValue);
	};
	const changeFeeTypeValues = (feeType: FeeTypeValue, i: number) => {
		const currentFeeTypeValue = FeeTypeValues;
		currentFeeTypeValue[i] = feeType;
		setFeeTypeValues(currentFeeTypeValue);
	};

	const feeTypeOption = {
		FIXED: {
			value: FeeTypeValue.FIXED,
			label: t('feeType.fixed'),
		},
		FRACTIONAL: {
			value: FeeTypeValue.FRACTIONAL,
			label: t('feeType.fractional'),
		},
	};
	const senderOrReceiverOption = {
		SENDER: {
			value: 0,
			label: 'Sender',
		},
		RECIEVER: {
			value: 1,
			label: 'Receiver',
		},
	};
	const collectorsExemptOption = {
		FALSE: {
			value: 0,
			label: 'False',
		},
		TRUE: {
			value: 1,
			label: 'True',
		},
	};
	const collectorIdOption = {
		HBAR: { label: 'HBAR', value: '0.0.0' },
		CURRENT_TOKEN: {
			label: t('feesManagement:tokensFeeOption:currentToken'),
			value: selectedStableCoin!.tokenId!.toString(),
		},
		CUSTOM: {
			label: 'Write your token',
			value: '',
			isDisabled: true,
		},
	};

	useEffect(() => {
		const parsedFees = selectedStableCoin!.customFees!.map((item: FeeTypes) => {
			const load = isLoading;
			load.push(false);
			setIsLoading(load);
			if ('amount' in item) {
				addFeeTypeValues(FeeTypeValue.FIXED);
				addFixedFee(
					new AddFixedFeeRequest({
						tokenId: selectedStableCoin!.tokenId!.toString(),
						collectorId: item.collectorId,
						collectorsExempt: item.collectorsExempt,
						decimals: item.decimals,
						tokenIdCollected: item.tokenIdCollected,
						amount: item.amount,
					}),
				);
				addFractionalFee(emptyFractionalFee);
				return {
					feeType: feeTypeOption.FIXED,
					amountOrPercentage: item.amount,
					collectorAccount: item.collectorId,
					collectorsExempt: item.collectorsExempt
						? collectorsExemptOption.TRUE
						: collectorsExemptOption.FALSE,
					tokenIdCollected: ((tokenId) => {
						switch (tokenId) {
							case collectorIdOption.HBAR.value:
								return collectorIdOption.HBAR;
							case collectorIdOption.CURRENT_TOKEN.value:
								return collectorIdOption.CURRENT_TOKEN;
							default:
								return {
									value: tokenId,
									label: tokenId,
								};
						}
					})(item.tokenIdCollected),
					senderOrReceiver: senderOrReceiverOption.SENDER,
				};
			}
			// TODO
			//  Fixed => sender
			//  fractional => ambos, pero actualmente solo reciever
			const itemFractional = item as RequestFractionalFee;
			addFeeTypeValues(FeeTypeValue.FRACTIONAL);
			addFixedFee(emptyFixedFee);
			addFractionalFee(
				new AddFractionalFeeRequest({
					tokenId: selectedStableCoin!.tokenId!.toString(),
					collectorId: itemFractional.collectorId,
					collectorsExempt: itemFractional.collectorsExempt,
					decimals: itemFractional.decimals,
					percentage: itemFractional.percentage,
					amountNumerator: itemFractional.amountNumerator,
					amountDenominator: itemFractional.amountDenominator,
					min: itemFractional.min,
					max: itemFractional.max,
					net: itemFractional.net,
				}),
			);
			return {
				feeType: feeTypeOption.FRACTIONAL,
				amountOrPercentage: itemFractional.percentage,
				collectorAccount: item.collectorId,
				collectorsExempt: item.collectorsExempt
					? collectorsExemptOption.TRUE
					: collectorsExemptOption.FALSE,
				senderOrReceiver: itemFractional.net
					? senderOrReceiverOption.SENDER
					: senderOrReceiverOption.RECIEVER,
				min: itemFractional.min,
				max: itemFractional.max,
				tokenIdCollected: collectorIdOption.CURRENT_TOKEN,
			};
		});

		setValue('fees', parsedFees);
	}, []);

	const selectorStyle = {
		wrapper: {
			border: '1px',
			borderColor: 'brand.black',
			borderRadius: '8px',
			height: 'min',
			width: 'full',
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

	const feeDataHeader = [
		t('feesManagement:columns:feeType'),
		t('feesManagement:columns:amountOrPercentage'),
		t('feesManagement:columns:feeToken'),
		t('feesManagement:columns:minimumAmount'),
		t('feesManagement:columns:maximumAmount'),
		t('feesManagement:columns:collectorAccount'),
		t('feesManagement:columns:collectorsExempt'),
		t('feesManagement:columns:assessmentMethod'),
		t('feesManagement:columns:actions'),
	];

	const handleAddNewRow = async () => {
		if (fees.length >= 10) return;

		addFeeTypeValues(FeeTypeValue.FIXED);
		addFixedFee(emptyFixedFee);
		addFractionalFee(emptyFractionalFee);
		const newLoader = isLoading;
		newLoader.push(false);
		setIsLoading(newLoader);
		// Default values when add new fee
		append({
			feeType: feeTypeOption.FIXED,
			collectorsExempt: collectorsExemptOption.TRUE,
			senderOrReceiver: senderOrReceiverOption.SENDER,
			tokenIdCollected: undefined,
			min: undefined,
			amount: undefined,
		});
	};

	async function handleRemoveRow(i: number): Promise<void> {
		removeFeeTypeValues(i);
		removeFixedFee(i);
		removeFractionalFee(i);
		const newLoader = isLoading;
		newLoader.splice(i, 1);
		setIsLoading(newLoader);
		remove(i);
	}

	async function handleTypeChange(i: number): Promise<void> {
		const fee = getValues().fees[i];
		changeFeeTypeValues(fee.feeType.value, i);
		if (fee.feeType.value === FeeTypeValue.FIXED) {
			changeFractionalFee(emptyFractionalFee, i);
			setValue(`fees.${i}.senderOrReceiver`, senderOrReceiverOption.SENDER);
		} else {
			changeFixedFee(emptyFixedFee, i);
			setValue(`fees.${i}.tokenIdCollected`, collectorIdOption.CURRENT_TOKEN);
		}
	}

	const handleUpdateTokenFees = async () => {
		const requestCustomFeeArray: RequestCustomFee[] = [];

		getValues().fees.forEach(async (fee: any, index: number) => {
			const feeType: FeeTypeValue = fee.feeType.value;
			const collectorAccount: string = fee.collectorAccount;
			const collectorsExempt: boolean = fee.collectorsExempt.value;
			const amountOrPercentage = fee.amountOrPercentage;

			switch (feeType) {
				case FeeTypeValue.FRACTIONAL: {
					const min: string = fee.min;
					const max: string = fee.max;
					const requestFractionalFee: RequestFractionalFee = {
						collectorId: collectorAccount,
						collectorsExempt,
						decimals: selectedStableCoin!.decimals!,
						amountNumerator: fractionalFee[index].amountNumerator ?? '',
						amountDenominator: fractionalFee[index].amountDenominator ?? '',
						min,
						max,
						net: false,
						percentage: amountOrPercentage, // TODO
					};
					requestCustomFeeArray.push(requestFractionalFee);
					break;
				}

				case FeeTypeValue.FIXED: {
					const amount: string = amountOrPercentage;
					let decimals;
					switch (fee.tokenIdCollected.value) {
						case collectorIdOption.HBAR.value:
							decimals = HBAR_DECIMALS;
							break;
						case selectedStableCoin!.tokenId!.toString():
							decimals = selectedStableCoin!.decimals!;
							break;
						default: {
							const detailsExternalStableCoin: StableCoinViewModel =
								await SDKService.getStableCoinDetails(
									new GetStableCoinDetailsRequest({
										id: fee.tokenIdCollected.value,
									}),
								);
							decimals = detailsExternalStableCoin.decimals ?? 0;
							break;
						}
					}

					const currency: string = fee.tokenIdCollected.value;

					const requestFixedFee: RequestFixedFee = {
						collectorId: collectorAccount,
						collectorsExempt,
						decimals,
						tokenIdCollected:
							currency === collectorIdOption.HBAR.value ? collectorIdOption.HBAR.value : currency,
						amount,
					};
					requestCustomFeeArray.push(requestFixedFee);
					break;
				}
			}
		});

		if (selectedStableCoin?.tokenId) {
			const updateCustomFeesRequest = new UpdateCustomFeesRequest({
				tokenId: selectedStableCoin!.tokenId!.toString(),
				customFees: requestCustomFeeArray,
			});

			try {
				onOpen();
				setAwaitingUpdate(true);
				await SDKService.updateCustomFees(updateCustomFeesRequest);
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
	const columnsSizes = '1fr 1fr 1.5fr 0.5fr 0.5fr 1fr 1fr 1fr 0.2fr';
	return (
		<BaseContainer title={t('feesManagement:title')}>
			{selectedStableCoin && selectedStableCoin.feeScheduleKey && (
				<Flex direction='column' bg='brand.gray100' pt={{ base: 4, lg: 14 }} pb={6}>
					<Grid
						templateColumns={columnsSizes}
						gap={{ base: 4 }}
						alignItems='center'
						textAlign='center'
						px={{ base: 4, lg: 14 }}
						paddingBottom={{ base: 4 }}
						borderBottom='0.5px solid'
						borderBottomColor='light.secondary'
					>
						{feeDataHeader.map((feeColumn: string, index: number) => (
							<GridItem key={`details-fee-${index}`} fontSize='14px' fontWeight='bold'>
								{feeColumn}
							</GridItem>
						))}
					</Grid>
					<Grid
						templateColumns={columnsSizes}
						gap={{ base: 4 }}
						alignItems='start'
						px={{ base: 4, lg: 14 }}
						paddingTop={{ base: 8 }}
					>
						{fees &&
							fees.map((field, i) => {
								return (
									<React.Fragment key={i}>
										<GridItem>
											<SelectController
												key={field.id}
												control={control}
												name={`fees.${i}.feeType` as const}
												options={Object.values(feeTypeOption)}
												overrideStyles={selectorStyle}
												addonLeft={true}
												variant='unstyled'
												isSearchable={false}
												onChangeAux={() => handleTypeChange(i)}
											/>
										</GridItem>
										<GridItem>
											<InputController
												key={field.id}
												control={control}
												rules={{
													required: t('global:validations.required') ?? propertyNotFound,
													validate: {
														validation: (value: string) => {
															if (FeeTypeValues[i] === FeeTypeValue.FIXED) {
																const _fixedFee = fixedFee[i];
																_fixedFee.amount = value;
																changeFixedFee(_fixedFee, i);
																const res = handleRequestValidation(_fixedFee.validate('amount'));
																return res;
															} else {
																const _fractionalFee = fractionalFee[i];
																_fractionalFee.percentage = value;
																_fractionalFee.amountNumerator = '';
																_fractionalFee.amountDenominator = '';
																changeFractionalFee(_fractionalFee, i);
																const res = handleRequestValidation(
																	_fractionalFee.validate('percentage'),
																);
																return res;
															}
														},
													},
												}}
												name={`fees.${i}.amountOrPercentage`}
												placeholder={t('amountPlaceholder') ?? propertyNotFound}
												isReadOnly={false}
												rightElement={
													watch(`fees.${i}.feeType`)?.value === feeTypeOption.FRACTIONAL.value && (
														<InputRightElement>
															<Icon name='Percent' />
														</InputRightElement>
													)
												}
											/>
										</GridItem>
										<GridItem>
											<SelectCreatableController
												key={field.id}
												addonLeft={true}
												rules={{
													required: t('global:validations.required') ?? propertyNotFound,
													validate: {
														validation: (option: any) => {
															if (!option.__isNew__) return true;
															const _fractionalFee = fractionalFee[i];
															_fractionalFee.tokenId = option.value as string;
															return handleRequestValidation(_fractionalFee.validate('tokenId'));
														},
														checkTokenID: async (option: any) => {
															if (!option.__isNew__) return true;
															const load = isLoading;
															load[i] = true;

															console.log(load);

															setIsLoading(load);
															console.log('loading', isLoading);

															try {
																await SDKService.getStableCoinDetails(
																	new GetStableCoinDetailsRequest({
																		id: option.value as string,
																	}),
																);
															} catch (e) {
																return t('global:validations.tokenIdNotExists', {
																	tokenId: option.value,
																}) as string;
															} finally {
																load[i] = false;
																setIsLoading(load);
															}
														},
													},
												}}
												addonDown={<Icon name='CaretDown' w={4} h={4} />}
												variant='outline'
												name={`fees.${i}.tokenIdCollected`}
												control={control}
												isLoading={isLoading[i]}
												isRequired={true}
												options={[...Object.values(collectorIdOption)]}
												placeholder={t('feesManagement:tokensFeeOption:placeholder')}
												isDisabled={watch(`fees.${i}.feeType`)?.value !== feeTypeOption.FIXED.value}
											/>
										</GridItem>
										<GridItem>
											<InputController
												key={field.id}
												control={control}
												rules={{
													validate: {
														validation: (value: string) => {
															if (value === undefined) return true;

															const _fractionalFee = fractionalFee[i];
															_fractionalFee.min = value;
															changeFractionalFee(_fractionalFee, i);
															const res =
																handleRequestValidation(_fractionalFee.validate('min')) &&
																(_fractionalFee.max
																	? handleRequestValidation(_fractionalFee.validate('max'))
																	: true);
															return res;
														},
													},
												}}
												name={`fees.${i}.min`}
												placeholder={t('minPlaceholder') ?? propertyNotFound}
												isReadOnly={false}
												disabled={
													watch(`fees.${i}.feeType`)?.value !== feeTypeOption.FRACTIONAL.value
												}
											/>
										</GridItem>
										<GridItem>
											<InputController
												key={field.id}
												control={control}
												rules={{
													validate: {
														validation: (value: string) => {
															if (value === undefined) return true;
															const _fractionalFee = fractionalFee[i];
															_fractionalFee.max = value;
															changeFractionalFee(_fractionalFee, i);

															const res = handleRequestValidation(_fractionalFee.validate('max'));
															return res;
														},
													},
												}}
												name={`fees.${i}.max`}
												placeholder={t('maxPlaceholder') ?? propertyNotFound}
												isReadOnly={false}
												disabled={
													watch(`fees.${i}.feeType`)?.value !== feeTypeOption.FRACTIONAL.value
												}
											/>
										</GridItem>
										<GridItem>
											<InputController
												key={field.id}
												rules={{
													required: t('global:validations.required') ?? propertyNotFound,
													validate: {
														validation: (value: string) => {
															if (FeeTypeValues[i] === FeeTypeValue.FIXED) {
																const _fixedFee = fixedFee[i];
																_fixedFee.collectorId = value;
																changeFixedFee(_fixedFee, i);
																const res = handleRequestValidation(
																	_fixedFee.validate('collectorId'),
																);
																return res;
															} else {
																const _fractionalFee = fractionalFee[i];
																_fractionalFee.collectorId = value;
																changeFractionalFee(_fractionalFee, i);
																const res = handleRequestValidation(
																	_fractionalFee.validate('collectorId'),
																);
																return res;
															}
														},
													},
												}}
												isRequired
												control={control}
												name={`fees.${i}.collectorAccount`}
												placeholder={t('collectorAccountPlaceholder') ?? propertyNotFound}
												isReadOnly={false}
											/>
										</GridItem>
										<GridItem>
											<SelectController
												key={field.id}
												control={control}
												name={`fees.${i}.collectorsExempt`}
												options={Object.values(collectorsExemptOption)}
												overrideStyles={selectorStyle}
												addonLeft={true}
												variant='unstyled'
												isSearchable={false}
											/>
										</GridItem>
										<GridItem>
											<SelectController
												key={field.id}
												control={control}
												name={`fees.${i}.senderOrReceiver`}
												options={Object.values(senderOrReceiverOption)}
												overrideStyles={selectorStyle}
												addonLeft={true}
												variant='unstyled'
												isSearchable={false}
												isDisabled={
													watch(`fees.${i}.feeType`)?.value !== feeTypeOption.FRACTIONAL.value
												}
											/>
										</GridItem>
										<GridItem textAlign='center' marginTop={{ base: 2 }}>
											<Icon
												name='Trash'
												color='brand.primary'
												cursor='pointer'
												fontSize='22px'
												onClick={() => handleRemoveRow(i)}
											/>
										</GridItem>
									</React.Fragment>
								);
							})}
					</Grid>
					<Flex
						justify='flex-end'
						pt={6}
						pb={6}
						justifyContent='space-between'
						px={{ base: 4, lg: 14 }}
					>
						<Button variant='primary' onClick={handleAddNewRow} isDisabled={isMaxFees}>
							{t('updateTokenFees.addRowButtonText')}
						</Button>
						<Button
							variant='primary'
							onClick={handleSubmit(handleUpdateTokenFees)}
							isDisabled={!formState.isValid}
						>
							{t('updateTokenFees.saveChangesButtonText')}
						</Button>
					</Flex>
				</Flex>
			)}
			<ModalNotification
				variant={variant}
				title={
					awaitingUpdate
						? 'Loading'
						: t('notification.title', {
								result: success ? 'Success' : 'Error',
						  })
				}
				description={
					awaitingUpdate ? undefined : t(`notification.description${success ? 'Success' : 'Error'}`)
				}
				isOpen={isOpen}
				onClose={onClose}
				onClick={onClose}
				errorTransactionUrl={error}
				closeButton={false}
				closeOnOverlayClick={false}
			/>
			{selectedStableCoin && !selectedStableCoin.feeScheduleKey && <NoFeesManagement />}
		</BaseContainer>
	);
};

export default FeesManagement;
