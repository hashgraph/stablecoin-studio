import {
	Button,
	useDisclosure,
	Flex,
	Stack,
	GridItem,
	SimpleGrid,
	InputRightElement,
} from '@chakra-ui/react';

import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import AwaitingWalletSignature from '../../components/AwaitingWalletSignature';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';
import { propertyNotFound } from '../../constant';
import { SelectController } from '../../components/Form/SelectController';
import Icon from '../../components/Icon';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import NoFeesManagement from './components/NoFeesManagement';
import FeeSelectController from './components/FeeSelectController';

import { AddFixedFeeRequest, 
		 AddFractionalFeeRequest,
		 RequestCustomFee, 
		 RequestFixedFee, 
		 RequestFractionalFee, 
		 UpdateCustomFeesRequest 
} from 'hedera-stable-coin-sdk';
import { handleRequestValidation } from '../../utils/validationsHelper';
import ModalInput from '../../components/ModalInput';
import SDKService from '../../services/SDKService';

const MAX_FEES = 10;

type a = RequestFractionalFee | RequestFixedFee | RequestCustomFee;

const FeesManagement = () => {
	const [awaitingUpdate, setAwaitingUpdate] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const {
		isOpen: isOpenCustomToken,
		onOpen: onOpenCustomToken,
		onClose: onCloseCustomToken,
	} = useDisclosure();
	const variant = awaitingUpdate ? 'loading' : success ? 'success' : 'error';

	const { control, getValues, setValue, watch } = useForm({
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
	const [updateCustomFeesRequest] = useState<UpdateCustomFeesRequest>(
		new UpdateCustomFeesRequest({
			tokenId: selectedStableCoin!.tokenId!.toString(),
			customFees: [],
		}),
	);

	const defaultFee = {
		feeType: undefined,
		min: undefined,
		amount: undefined,
	};

	const fixedFee = new AddFixedFeeRequest({
		tokenId: selectedStableCoin!.tokenId!.toString(),
		collectorId: '0.0.1',
		collectorsExempt: false,
		decimals: 0,
		tokenIdCollected: '0.0.0',
		amount: '1',
	});

	const fractionalFee = new AddFractionalFeeRequest({
		tokenId: selectedStableCoin!.tokenId!.toString(),
		collectorId: '0.0.1',
		collectorsExempt: false,
		decimals: 0,
		amountNumerator: '4',
		amountDenominator: '2',
		min: '1',
		max: '5',
		net: false,
	});

	// TODO: Add useEffect to load current customFees from stablecoin
	useEffect(() => {
		setValue('fees', selectedStableCoin!.customFees!);
	}, []);

	const isMaxFees = useMemo(() => fees.length >= MAX_FEES, [fees]);

	const { t } = useTranslation(['feesManagement', 'global']);

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

	const feeDataHeader = [
		t('feesManagement:columns:feeType'),
		t('feesManagement:columns:amount'),
		t('feesManagement:columns:minimumAmount'),
		t('feesManagement:columns:maximumAmount'),
		t('feesManagement:columns:collectorAccount'),
		t('feesManagement:columns:collectorsExempt'),
		t('feesManagement:columns:assessmentMethod'),
		t('feesManagement:columns:tokenFee'),
		t('feesManagement:columns:actions'),
	];

	const handleSelectFee = async (event: any) => {
		console.log(event.value);
		if (event.value === '') {
			// TODO
			onOpenCustomToken();
			console.log('show modal');
		}
	};
	const handleAddNewRow = async () => {
		if (fees.length >= 10) return;

		append(fees[0]);
	};

	async function handleRemoveRow(i: number): Promise<void> {
		remove(i);
	}

	const handleUpdateTokenFees = async () => {
		// console.log(`${JSON.stringify(getValues())}`);
		// console.log(`${JSON.stringify(JSON.parse(JSON.stringify(getValues()))["object Object"])}`);	
		const formData = JSON.parse(JSON.stringify(getValues()))["object Object"];

		const requestCustomFeeArray : RequestCustomFee[] = [];
		for (let i=0; i < formData.length; i++) {
			const feeType: string = formData[i].feeType.label;
			const collectorAccount: string = formData[i].collectorAccount;
			const collectorsExempt: boolean = formData[i].collectorsExempt.label;
	
			switch(feeType){
				case "Fractional": 
				{
					const min: string = formData[i].min;
					const max: string = formData[i].max;

					const requestFractionalFee = {
						collectorId: collectorAccount,
						collectorsExempt: collectorsExempt,
						decimals: 2,
						amountNumerator: "1",
						amountDenominator: "20",
						min: min,
						max: max,
						net: false
					} as RequestFractionalFee;
					requestCustomFeeArray.push(requestFractionalFee);
					break;
				}
				
				case "Fixed":
				{
					const amount: string = formData[i].amountOrPercentage;
					const requestFixedFee = ({
						collectorId: collectorAccount,
						collectorsExempt: collectorsExempt,
						decimals: 2,
						tokenIdCollected: '0.0.0',
						amount: amount
					}) as RequestFixedFee;
					requestCustomFeeArray.push(requestFixedFee);
					break;
				}
			}
		}

		if (selectedStableCoin?.tokenId) {
			updateCustomFeesRequest.customFees = requestCustomFeeArray;

			try {
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
	}	

	enum FeeType {
		FIXED,
		FRACTIONAL,
	}

	return (
		<BaseContainer title={t('feesManagement:title')}>
			{selectedStableCoin && selectedStableCoin.feeScheduleKey && (
				<Flex
					direction='column'
					bg='brand.gray100'
					px={{ base: 4, lg: 14 }}
					pt={{ base: 4, lg: 14 }}
					pb={6}
				>
					<SimpleGrid columns={{ base: 9 }} gap={{ base: 4 }} alignItems='center'>
						{feeDataHeader.map((feeColumn: string, index: number) => (
							<GridItem key={`details-fee-${index}`} fontSize='14px' fontWeight='bold'>
								{feeColumn}
							</GridItem>
						))}

						{fees &&
							fees.map((field, i) => {
								return (
									<React.Fragment key={i}>
										<GridItem>
											<SelectController
												key={field.id}
												control={control}
												name={`fees.${i}.feeType` as const}
												options={[
													{
														value: FeeType.FIXED,
														label: t('feeType.fixed'),
													},
													{
														value: FeeType.FRACTIONAL,
														label: t('feeType.fractional'),
													},
												]}
												overrideStyles={selectorStyle}
												addonLeft={true}
												variant='unstyled'
												defaultValue={field !== undefined ? ('amount' in field ? '0' : '1') : '0'}
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
															// if fixed
															fixedFee.amount = value;
															const res = handleRequestValidation(fixedFee.validate('amount'));
															// else fractional
															// const res = handleRequestValidation(fractionalFee.validate('amount'));
															return res;
															// return true;
														},
													},
												}}
												name={`fees.${i}.amountOrPercentage`}
												placeholder={t('amountPlaceholder') ?? propertyNotFound}
												// defaultValue={
												// 	field !== undefined ? ('amount' in field ? field.amount : '') : ''
												// }
												isReadOnly={false}
												rightElement={
													watch(`fees.${i}.feeType`)?.value === FeeType.FRACTIONAL && (
														<InputRightElement>
															<Icon name='Percent' />
														</InputRightElement>
													)
												}
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
															fractionalFee.min = value;
															const res = handleRequestValidation(fractionalFee.validate('min'));
															return res;
														},
													},
												}}
												name={`fees.${i}.min`}
												placeholder={t('minPlaceholder') ?? propertyNotFound}
												// defaultValue={
												// 	customFees[i] !== undefined && customFees[i].min
												// 		? customFees[i].min._value.toString()
												// 		: ''
												// }
												isReadOnly={false}
												disabled={watch(`fees.${i}.feeType`)?.value !== FeeType.FRACTIONAL}
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
															fractionalFee.max = value;
															const res = handleRequestValidation(fractionalFee.validate('max'));
															return res;
														},
													},
												}}
												name={`fees.${i}.max`}
												placeholder={t('maxPlaceholder') ?? propertyNotFound}
												// defaultValue={
												// 	customFees[i] !== undefined && customFees[i].max
												// 		? customFees[i].max._value.toString()
												// 		: ''
												// }
												isReadOnly={false}
												disabled={watch(`fees.${i}.feeType`)?.value !== FeeType.FRACTIONAL}
											/>
										</GridItem>
										<GridItem>
											<InputController
												key={field.id}
												rules={{
													required: t('global:validations.required') ?? propertyNotFound,
													validate: {
														validation: (value: string) => {
															fixedFee.collectorId = value;
															const res = handleRequestValidation(fixedFee.validate('collectorId'));
															return res;
														},
													},
												}}
												isRequired
												control={control}
												name={`fees.${i}.collectorAccount`}
												placeholder={t('collectorAccountPlaceholder') ?? propertyNotFound}
												 defaultValue={
													field !== undefined ? ('collectorId' in field ? field.collectorId as string : '') : ''
												 	// customFees[i] !== undefined && customFees[i].collectorId !== undefined
												 	//	? customFees[i].collectorId.value.toString()
												 	//	: ''
												}
												isReadOnly={false}
											/>
										</GridItem>
										<GridItem>
											<SelectController
												key={field.id}
												control={control}
												name={`fees.${i}.collectorsExempt`}
												options={collectorsExempt}
												overrideStyles={selectorStyle}
												addonLeft={true}
												variant='unstyled'
												 defaultValue={
													field !== undefined ? ('collectorsExempt' in field ? field.collectorsExempt ? 1 : 0 : 0) : 0
												 	/* customFees[i] !== undefined
												 		? customFees[i].collectorsExempt
												 			? '1'
												 			: '0'
												 		: '1' */
												}
											/>
										</GridItem>
										<GridItem>
											<SelectController
												key={field.id}
												control={control}
												name={`fees.${i}.senderOrReceiver`}
												options={[
													{
														value: 0,
														label: 'sender',
													},
													{
														value: 1,
														label: 'receiver',
													},
												]}
												overrideStyles={selectorStyle}
												addonLeft={true}
												variant='unstyled'
												// defaultValue={
												// 	customFees[i] !== undefined
												// 		? customFees[i].amountDenominator
												// 			? customFees[i].net
												// 				? '0'
												// 				: '1'
												// 			: '0'
												// 		: '0'
												// }
											/>
										</GridItem>
										<GridItem>
											<FeeSelectController
												key={field.id}
												styles={selectorStyle}
												name={`fees.${i}.moneda`}
												control={control}
												options={[
													{ label: 'HBAR', value: 'HBAR' },
													{
														label: t('feesManagement:tokensFeeOption:currentToken'),
														value: selectedStableCoin!.tokenId!.toString(),
													},
													{
														label: t('feesManagement:tokensFeeOption:customToken'),
														value: '',
													},
												]}
												onChangeAux={handleSelectFee}
											/>
										</GridItem>
										<GridItem>
											<Icon name='Trash' fontSize='22px' onClick={() => handleRemoveRow(i)} />
										</GridItem>
										{isOpenCustomToken && (
											<ModalInput
												setValue={(tokenId: string) => {
													setValue(`fees.${i}.moneda`, tokenId);
													console.log(getValues());
												}}
												isOpen={isOpenCustomToken}
												onClose={onCloseCustomToken}
												placeholderInput='0.0.0'
												title={'Introduce tokenId'}
											/>
										)}
									</React.Fragment>
								);
							})}
					</SimpleGrid>
					<Flex justify='flex-end' pt={6} px={6} pb={6}>
						<Stack direction='row' spacing={6}>
							<Button variant='primary' onClick={handleUpdateTokenFees}>
								{t('updateTokenFees.saveChangesButtonText')}
							</Button>
							<Button variant='primary' onClick={handleAddNewRow} isDisabled={isMaxFees}>
								{t('updateTokenFees.addRowButtonText')}
							</Button>
						</Stack>
					</Flex>
				</Flex>
			)}

			{selectedStableCoin && !selectedStableCoin.feeScheduleKey && <NoFeesManagement />}
		</BaseContainer>
	);
};

export default FeesManagement;
