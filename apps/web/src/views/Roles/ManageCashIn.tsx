import { Heading, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import {
	CheckSupplierLimitRequest,
	DecreaseSupplierAllowanceRequest,
	GetSupplierAllowanceRequest,
	IncreaseSupplierAllowanceRequest,
	ResetSupplierAllowanceRequest,
	SupportedWallets,
} from '@hashgraph/stablecoin-npm-sdk';
import { useNavigate } from 'react-router-dom';
import { LAST_WALLET_SELECTED, SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';
import ModalsHandler from '../../components/ModalsHandler';
import SDKService from '../../services/SDKService';
import OperationLayout from '../Operations/OperationLayout';
import InputController from '../../components/Form/InputController';
import { handleRequestValidation, validateDecimalsString } from '../../utils/validationsHelper';
import { propertyNotFound } from '../../constant';
import type { Detail } from '../../components/DetailsReview';
import DetailsReview from '../../components/DetailsReview';
import { RouterManager } from '../../Router/RouterManager';
import { SelectController } from '../../components/Form/SelectController';
import { cashinLimitOptions } from './constants';
import DatePickerController from '../../components/Form/DatePickerController';
import { formatDateTime } from '../../utils/inputHelper';

const styles = {
	menuList: {
		maxH: '220px',
		overflowY: 'auto',
		bg: 'brand.white',
		boxShadow: 'down-black',
		p: 4,
	},
	wrapper: {
		border: '1px',
		borderColor: 'brand.black',
		borderRadius: '8px',
		height: 'initial',
	},
};

const ManageCashIn = () => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const { decimals = 0 } = selectedStableCoin || {};
	const [limit, setLimit] = useState<string>();
	const [errorOperation, setErrorOperation] = useState();
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const selectedWallet = useSelector(LAST_WALLET_SELECTED);
	const navigate = useNavigate();

	const { control, getValues, formState, watch } = useForm({
		mode: 'onChange',
	});
	const [request, setRequest] = useState<
		| IncreaseSupplierAllowanceRequest
		| GetSupplierAllowanceRequest
		| ResetSupplierAllowanceRequest
		| DecreaseSupplierAllowanceRequest
	>();
	const supplierLimitOption = watch('actionType')?.value;
	const { t } = useTranslation(['roles', 'global', 'operations']);
	const isIncreaseOrDecreaseOperaion = useMemo(
		() => supplierLimitOption === 'INCREASE' || supplierLimitOption === 'DECREASE',
		[supplierLimitOption],
	);
	const isResetOperation = useMemo(() => supplierLimitOption === 'RESET', [supplierLimitOption]);
	useEffect(() => {
		switch (supplierLimitOption) {
			case 'INCREASE':
				setRequest(
					new IncreaseSupplierAllowanceRequest({
						tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
						targetId: '',
						amount: '0',
						startDate: undefined,
					}),
				);
				break;
			case 'DECREASE':
				setRequest(
					new DecreaseSupplierAllowanceRequest({
						tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
						targetId: '',
						amount: '0',
						startDate: undefined,
					}),
				);
				break;

			case 'RESET':
				setRequest(
					new ResetSupplierAllowanceRequest({
						targetId: '',
						tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
						startDate: undefined,
					}),
				);
				break;
			case 'CHECK':
			default:
				setRequest(
					new GetSupplierAllowanceRequest({
						tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
						targetId: '',
					}),
				);
				break;
		}
	}, [supplierLimitOption]);
	const handleCashIn: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		try {
			onLoading();
			if (!selectedStableCoin?.tokenId) {
				onError();
				return;
			}
			const values = getValues();
			switch (supplierLimitOption) {
				case 'INCREASE':
					await SDKService.increaseSupplierAllowance(
						new IncreaseSupplierAllowanceRequest({
							tokenId: selectedStableCoin.tokenId.toString(),
							targetId: values.account,
							amount: values.amount ? values.amount.toString() : '',
							startDate: values.startDate ? values.startDate.toISOString() : undefined,
						}),
					);
					break;
				case 'DECREASE':
					await SDKService.decreaseSupplierAllowance(
						new DecreaseSupplierAllowanceRequest({
							tokenId: selectedStableCoin.tokenId.toString(),
							targetId: values.account,
							amount: values.amount ? values.amount.toString() : '',
							startDate: values.startDate ? values.startDate.toISOString() : undefined,
						}),
					);
					break;
				case 'RESET':
					await SDKService.resetSupplierAllowance(
						new ResetSupplierAllowanceRequest({
							targetId: values.account,
							tokenId: selectedStableCoin.tokenId.toString(),
							startDate: values.startDate ? values.startDate.toISOString() : undefined,
						}),
					);
					break;
				case 'CHECK':
					// eslint-disable-next-line no-case-declarations
					const isUnlimitedAllowance = await Promise.race([
						SDKService.isUnlimitedSupplierAllowance(
							new CheckSupplierLimitRequest({
								tokenId: selectedStableCoin.tokenId.toString(),
								targetId: values.account,
							}),
						),
						new Promise((resolve, reject) => {
							setTimeout(() => {
								reject(
									new Error(
										"Account's supplier allowance information couldn't be obtained in a reasonable time.",
									),
								);
							}, 10000);
						}),
					]).catch((e) => {
						console.log(e.message);
						onOpenModalAction();
						throw e;
					});
					if (!isUnlimitedAllowance) {
						const response: any = await Promise.race([
							SDKService.checkSupplierAllowance(
								new GetSupplierAllowanceRequest({
									tokenId: selectedStableCoin.tokenId.toString(),
									targetId: values.account,
								}),
							),
							new Promise((resolve, reject) => {
								setTimeout(() => {
									reject(
										new Error(
											"Account's supplier allowance information couldn't be obtained in a reasonable time.",
										),
									);
								}, 10000);
							}),
						]).catch((e) => {
							console.log(e.message);
							onOpenModalAction();
							throw e;
						});
						setLimit(response.value.toString());
					}
					break;
			}
			onSuccess();
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
			setErrorOperation(error.message);
			onError();
		}
	};
	const handleCloseModal = () => {
		RouterManager.goBack(navigate);
	};
	const action = 'editRole';

	const getDetails: () => Detail[] = () => {
		const details: Detail[] = [
			{
				label: t(`roles:${action}.selectLabel`),
				value: supplierLimitOption,
				valueInBold: true,
			},
		];
		if (isIncreaseOrDecreaseOperaion) {
			details.push({
				label: t(`roles:${action}.amountLabel`),
				value: getValues().amount,
			});
		}

		return details;
	};
	return (
		<>
			<OperationLayout
				LeftContent={
					<>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t('roles:editRole:title')}
						</Heading>
						<Stack as='form' spacing={6} maxW='520px'>
							<SelectController
								rules={{
									required: t('global:validations.required') ?? propertyNotFound,
								}}
								isRequired
								control={control}
								name='actionType'
								label={t(`roles:${action}.selectLabel`)}
								placeholder={t(`roles:${action}.selectPlaceholder`)}
								options={cashinLimitOptions}
								addonLeft={true}
								overrideStyles={styles}
								variant='unstyled'
							/>
							<InputController
								rules={{
									required: t('global:validations.required') ?? propertyNotFound,
									validate: {
										validation: (value: string) => {
											if (!request) return;
											request.targetId = value;
											const res = handleRequestValidation(request.validate('targetId'));
											return res;
										},
									},
								}}
								isRequired
								control={control}
								name='account'
								placeholder={t(`roles:${action}.accountPlaceholder`) ?? propertyNotFound}
								label={t(`roles:${action}.accountLabel`) ?? propertyNotFound}
							/>
							{isIncreaseOrDecreaseOperaion && (
								<InputController
									rules={{
										required: t(`global:validations.required`) ?? propertyNotFound,
										validate: {
											validDecimals: (value: string) => {
												return (
													validateDecimalsString(value, decimals) ||
													(t('global:validations.decimalsValidation') ?? propertyNotFound)
												);
											},
											validation: (value: string) => {
												if (request && 'amount' in request) {
													request.amount = value;
													const res = handleRequestValidation(request.validate('amount'));
													return res;
												}
											},
										},
									}}
									isRequired
									control={control}
									name='amount'
									label={t(`roles:${action}.supplierQuantityQuestion`) ?? propertyNotFound}
									placeholder={
										t(`roles:${action}.supplierQuantityInputPlaceholder`) ?? propertyNotFound
									}
								/>
							)}
							{(isResetOperation || isIncreaseOrDecreaseOperaion) &&
								selectedWallet === SupportedWallets.MULTISIG && (
									<DatePickerController
										rules={{
											required: t('global:validations.required') ?? propertyNotFound,
											validate: (value: Date) => {
												if (request && 'startDate' in request) {
													request.startDate = formatDateTime({ dateTime: value });
													const res = handleRequestValidation(request.validate('startDate'));
													return res;
												}
											},
										}}
										isRequired
										showTimeSelect
										placeholderText='Select date and time'
										dateFormat="yyyy-MM-dd'T'HH:mm:ss"
										control={control}
										name='startDate'
										label={t('multiSig:startDate') ?? propertyNotFound}
										minimumDate={new Date()}
										timeFormat='HH:mm'
										timeIntervals={15}
									/>
								)}
						</Stack>
					</>
				}
				onConfirm={onOpenModalAction}
				confirmBtnProps={{ isDisabled: !formState.isValid }}
			/>
			<ModalsHandler
				errorNotificationTitle={t('operations:modalErrorTitle')}
				errorNotificationDescription={errorOperation}
				errorTransactionUrl={errorTransactionUrl}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t(`roles:${action}.modalActionTitle`),
					confirmButtonLabel: t(`roles:${action}.modalActionConfirmButton`),
					onConfirm: handleCashIn,
				}}
				ModalActionChildren={
					<>
						<DetailsReview
							title={t(`roles:${action}.modalActionSubtitle`)}
							details={getDetails()}
						/>
						{selectedWallet === SupportedWallets.MULTISIG && (
							<DetailsReview
								title={t('multiSig:startDate')}
								details={[
									{
										label: t(`multiSig:startDate`),
										value: formatDateTime({ dateTime: getValues().startDate, isUTC: false }),
									},
								]}
							/>
						)}
					</>
				}
				successNotificationTitle={t('operations:modalSuccessTitle')}
				successNotificationDescription={
					supplierLimitOption === 'CHECK'
						? !limit
							? t(`roles:${action}.hasInfiniteAllowance`)
							: t(`roles:${action}.checkCashinLimitSuccessDesc`, {
									account: getValues().account,
									limit,
							  })
						: ''
				}
				handleOnCloseModalError={handleCloseModal}
				handleOnCloseModalSuccess={handleCloseModal}
			/>
		</>
	);
};

export default ManageCashIn;
