import { useEffect, useState } from 'react';
import { Stack, HStack, useDisclosure, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import BaseContainer from '../../components/BaseContainer';
import BasicDetails from './BasicDetails';
import type { Step } from '../../components/Stepper';
import Stepper from '../../components/Stepper';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { RouterManager } from '../../Router/RouterManager';
import OptionalDetails from './OptionalDetails';
import ManagementPermissions from './ManagementPermissions';
import Review from './Review';
import { OTHER_KEY_VALUE } from './components/KeySelector';
import {
	getStableCoinList,
	SELECTED_WALLET_ACCOUNT_INFO,
	SELECTED_WALLET_PAIRED_ACCOUNT,
	SELECTED_FACTORY_ID,
	SELECTED_WALLET,
	getExternalTokenList,
} from '../../store/slices/walletSlice';
import SDKService from '../../services/SDKService';
import ModalNotification from '../../components/ModalNotification';
import {
	Account,
	AssociateTokenRequest,
	CreateRequest,
	KYCRequest,
	GetStableCoinDetailsRequest,
	SupportedWallets,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import type { RequestPublicKey } from '@hashgraph-dev/stablecoin-npm-sdk';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import ProofOfReserve from './ProofOfReserve';
import { ImportTokenService } from '../../services/ImportTokenService';

const StableCoinCreation = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const { t } = useTranslation('stableCoinCreation');

	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
	const factoryId = useSelector(SELECTED_FACTORY_ID);
	const wallet = useSelector(SELECTED_WALLET);

	const form = useForm<FieldValues>({
		mode: 'onChange',
		defaultValues: {
			autorenewAccount: accountInfo.id,
			initialSupply: 0,
		},
	});

	const {
		control,
		getValues,
		watch,
		formState: { errors },
		setValue,
	} = form;

	const [request] = useState(
		new CreateRequest({
			name: '',
			symbol: '',
			decimals: 6,
			createReserve: false,
		}),
	);

	const [isValidForm, setIsValidForm] = useState<boolean>(false);
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [token, setToken] = useState<string | null>();

	useEffect(() => {
		if (getValues()) {
			isValidStep();
		}
	}, [getValues(), currentStep]);

	const steps: Step[] = [
		{
			number: '01',
			title: t('tabs.basicDetails'),
			children: <BasicDetails control={control} request={request} setValue={setValue} />,
		},
		{
			number: '02',
			title: t('tabs.optionalDetails'),
			children: <OptionalDetails control={control} form={form} request={request} />,
		},
		{
			number: '03',
			title: t('tabs.managementPermissions'),
			children: (
				<ManagementPermissions
					control={control}
					request={request}
					watch={watch}
					setValue={setValue}
				/>
			),
		},
		{
			number: '04',
			title: t('tabs.proofOfReserve'),
			children: <ProofOfReserve control={control} request={request} form={form} />,
		},
		{
			number: '05',
			title: t('tabs.review'),
			children: <Review form={form} />,
		},
	];

	const isValidStep = () => {
		// @ts-ignore
		let fieldsStep = [];

		if (currentStep === 0) {
			// @ts-ignore
			fieldsStep = watch(['hederaTokenManagerId', 'name', 'symbol']);
		}

		if (currentStep === 1) {
			// @ts-ignore
			const supplyType = watch('supplyType');
			let keys = ['initialSupply', 'decimals'];

			if (supplyType?.value === 1) keys = keys.concat('maxSupply');

			fieldsStep = watch(keys);
		}

		if (currentStep === 2) {
			// @ts-ignore
			const managePermissions = watch('managementPermissions');
			const kycRequired = watch('kycRequired');
			let keys: string[] = [];

			if (kycRequired) keys = keys.concat('kycKey');

			if (!managePermissions) {
				keys = keys.concat('wipeKey');
				keys = keys.concat('freezeKey');
				keys = keys.concat('pauseKey');
			}
			if (keys.length > 0) {
				// @ts-ignore
				fieldsStep = watch(keys);
				fieldsStep.forEach((item, index) => {
					if (item?.value === OTHER_KEY_VALUE) {
						// @ts-ignore
						fieldsStep[index] = watch(keys[index].concat('Other'));
					}
				});
			}
		}

		if (currentStep === 3) {
			// @ts-ignore
			const proofOfReserve = watch('proofOfReserve');
			// @ts-ignore
			const hasDataFeed = watch('hasDataFeed');
			if (proofOfReserve) {
				const keys: string[] = [];
				if (hasDataFeed) {
					keys.push('reserveAddress');
				} else {
					keys.push('reserveInitialAmount');
				}
				// @ts-ignore
				fieldsStep = watch(keys);
			}
		}

		return setIsValidForm(
			fieldsStep?.filter((item) => !item && item !== 0).length === 0 &&
				Object.keys(errors).length === 0,
		);
	};

	const formatRoleAccountByKey = (
		managementPermissions: boolean,
		key: { value: number; label: string },
		role: { value: number; label: string },
		roleName: string,
	): string => {
		if ((managementPermissions || (key && key.value === 2)) && role.value !== 3) {
			return formatRoleAccount(role, roleName);
		} else {
			return '0.0.0';
		}
	};

	const formatKycRoleAccountByKey = (
		isKycRequired: boolean,
		key: { value: number; label: string },
		role: { value: number; label: string },
		roleName: string,
	): string => {
		if ((isKycRequired || (key && key.value === 2)) && role.value !== 3) {
			return formatRoleAccount(role, roleName);
		} else {
			return '0.0.0';
		}
	};

	const formatRoleAccount = (role: { value: number; label: string }, roleName: string): string => {
		const values = getValues();
		if (role.label === 'Other account') {
			const param = Object.keys(values).find((key) => key.includes(roleName + 'RoleAccountOther'));
			return param ? values[param] : '';
		} else {
			return accountInfo.id!;
		}
	};

	const formatKey = (keySelection: string, keyName: string): RequestPublicKey | undefined => {
		const values = getValues();

		if (keySelection === 'Current user key') {
			return accountInfo.publicKey;
		}

		if (keySelection === 'Other key') {
			const param = Object.keys(values).find((key) => key.includes(keyName + 'Other'));

			return {
				key: param ? values[param] : '',
			};
		}

		if (keySelection === 'None') return undefined;

		return Account.NullPublicKey;
	};

	let createResponse: any;
	const handleFinish = async () => {
		const {
			managementPermissions,
			adminKey,
			freezeKey,
			kycRequired,
			kycKey,
			wipeKey,
			pauseKey,
			supplyKey,
			manageCustomFees,
			feeScheduleKey,
			reserveInitialAmount,
			reserveAddress,
			grantKYCToOriginalSender,
			cashInRoleAccount,
			burnRoleAccount,
			wipeRoleAccount,
			rescueRoleAccount,
			pauseRoleAccount,
			freezeRoleAccount,
			deleteRoleAccount,
			kycRoleAccount,
			cashInAllowanceType,
			cashInAllowance,
			hederaTokenManagerId,
		} = getValues();

		if (!reserveInitialAmount) {
			request.createReserve = false;
			request.reserveAddress = reserveAddress;
		} else {
			request.createReserve = true;
			request.reserveInitialAmount = reserveInitialAmount;
			request.reserveAddress = undefined;
		}

		if (managementPermissions) {
			request.freezeKey = Account.NullPublicKey;
			request.wipeKey = Account.NullPublicKey;
			request.pauseKey = Account.NullPublicKey;
		} else {
			request.freezeKey = formatKey(freezeKey.label, 'freezeKey');
			request.wipeKey = formatKey(wipeKey.label, 'wipeKey');
			request.pauseKey = formatKey(pauseKey.label, 'pauseKey');
		}

		if (kycRequired) {
			request.kycKey = formatKey(kycKey.label, 'kycKey');
			request.grantKYCToOriginalSender = grantKYCToOriginalSender;
		} else {
			request.kycKey = undefined;
			request.grantKYCToOriginalSender = false;
		}

		request.feeScheduleKey = manageCustomFees
			? formatKey(feeScheduleKey.label, 'feeScheduleKey')
			: undefined;

		request.cashInRoleAccount = formatRoleAccountByKey(
			managementPermissions,
			supplyKey,
			cashInRoleAccount,
			'cashIn',
		);
		request.cashInRoleAllowance = cashInAllowanceType ? '0' : cashInAllowance;
		request.burnRoleAccount = formatRoleAccountByKey(
			managementPermissions,
			supplyKey,
			burnRoleAccount,
			'burn',
		);
		request.wipeRoleAccount = formatRoleAccountByKey(
			managementPermissions,
			wipeKey,
			wipeRoleAccount,
			'wipe',
		);
		request.rescueRoleAccount = formatRoleAccount(rescueRoleAccount, 'rescue');
		request.pauseRoleAccount = formatRoleAccountByKey(
			managementPermissions,
			pauseKey,
			pauseRoleAccount,
			'pause',
		);
		request.freezeRoleAccount = formatRoleAccountByKey(
			managementPermissions,
			freezeKey,
			freezeRoleAccount,
			'freeze',
		);
		request.deleteRoleAccount = formatRoleAccountByKey(
			managementPermissions,
			adminKey,
			deleteRoleAccount,
			'delete',
		);
		request.kycRoleAccount = formatKycRoleAccountByKey(kycRequired, kycKey, kycRoleAccount, 'kyc');

		request.hederaTokenManager = hederaTokenManagerId.value;
		try {
			onOpen();
			setLoading(true);
			createResponse = await SDKService.createStableCoin(request);
			const tokenId = createResponse.coin.tokenId.toString();
			setToken(tokenId);
			if (wallet.lastWallet === SupportedWallets.HASHPACK && createResponse?.coin.tokenId) {
				const associateRequest = new AssociateTokenRequest({
					targetId: accountInfo.id!,
					tokenId,
				});
				await SDKService.associate(associateRequest);

				if (grantKYCToOriginalSender) {
					const grantKYCRequest = new KYCRequest({
						targetId: accountInfo.id!,
						tokenId: createResponse.coin.tokenId.toString(),
					});
					await SDKService.grantKyc(grantKYCRequest);
				}
			}

			if (wallet.lastWallet === SupportedWallets.METAMASK) {
				const details: any = await Promise.race([
					SDKService.getStableCoinDetails(
						new GetStableCoinDetailsRequest({
							id: tokenId,
						}),
					),
					new Promise((resolve, reject) => {
						setTimeout(() => {
							reject(new Error("Stable coin details couldn't be obtained in a reasonable time."));
						}, 10000);
					}),
				]).catch((e) => {
					console.log(e.message);
					onOpen();
					throw e;
				});

				ImportTokenService.importToken(tokenId, details?.symbol!, accountInfo?.id!);
				dispatch(getExternalTokenList(accountInfo.id!));
			}

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

	const handleCancel = () => {
		RouterManager.to(navigate, NamedRoutes.Operations);
	};

	const supplyKey = watch('supplyKey') ? watch('supplyKey')!.value : 2;
	const stepperProps = {
		steps,
		handleLastButtonPrimary: handleFinish,
		handleFirstButtonSecondary: handleCancel,
		textLastButtonPrimary: t('common.createStableCoin'),
		isValid: isValidForm,
		currentStep,
		setCurrentStep,
		supplyKey,
	};

	const variant = loading ? 'loading' : success ? 'success' : 'error';

	return (
		<Stack h='full'>
			<HStack spacing={6} w='full'>
				<Text
					fontSize='28px'
					color='brand.secondary'
					fontWeight={500}
					align='left'
					w='full'
					data-testid='creation-title'
				>
					{t('common.createNewStableCoin')}
				</Text>
				<Text
					fontSize='16px'
					color='brand.secondary'
					fontWeight={700}
					align='right'
					w='full'
					as='i'
					data-testid='creation-subtitle'
				>
					{t('common.factoryId') + factoryId}
				</Text>
			</HStack>
			<BaseContainer title=''>
				<Stepper {...stepperProps} />
			</BaseContainer>
			<ModalNotification
				variant={variant}
				title={
					loading ? 'Loading' : t('notification.title', { result: success ? 'Success' : 'Error' })
				}
				description={
					loading
						? undefined
						: t(`notification.description${success ? 'Success' : 'Error'}`, { token })
				}
				isOpen={isOpen}
				onClose={onClose}
				onClick={() => {
					dispatch(getStableCoinList(account.accountId?.toString() ?? ''));
					RouterManager.to(navigate, NamedRoutes.StableCoinNotSelected);
				}}
				errorTransactionUrl={error}
				closeButton={false}
				closeOnOverlayClick={false}
			/>
		</Stack>
	);
};

export default StableCoinCreation;
