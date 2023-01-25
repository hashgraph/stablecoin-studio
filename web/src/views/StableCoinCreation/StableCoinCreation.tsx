import { useEffect, useState } from 'react';
import { Stack, useDisclosure } from '@chakra-ui/react';
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
} from '../../store/slices/walletSlice';
import SDKService from '../../services/SDKService';
import ModalNotification from '../../components/ModalNotification';
import {
	FactoryAddressTestnet,
	HederaERC20AddressTestnet,
	Account,
	CreateRequest,
} from 'hedera-stable-coin-sdk';
import type { RequestPublicKey } from 'hedera-stable-coin-sdk';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import ProofOfReserve from './ProofOfReserve';

const StableCoinCreation = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const { t } = useTranslation('stableCoinCreation');

	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

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
	} = form;

	const [request] = useState(
		new CreateRequest({
			name: '',
			symbol: '',
			decimals: 6,
			hederaERC20: HederaERC20AddressTestnet,
			stableCoinFactory: FactoryAddressTestnet,
			createReserve: false,
			
		}),
	);

	const [isValidForm, setIsValidForm] = useState<boolean>(false);
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		if (getValues()) {
			isValidStep();
		}
	}, [getValues(), currentStep]);

	const steps: Step[] = [
		{
			number: '01',
			title: t('tabs.basicDetails'),
			children: <BasicDetails control={control} request={request} />,
		},
		{
			number: '02',
			title: t('tabs.optionalDetails'),
			children: <OptionalDetails control={control} form={form} request={request} />,
		},
		{
			number: '03',
			title: t('tabs.managementPermissions'),
			children: <ManagementPermissions control={control} request={request} />,
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
			fieldsStep = watch(['name', 'symbol', 'autorenewAccount']);
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

			if (!managePermissions) {
				const keys = ['adminKey', 'supplyKey', 'wipeKey', 'freezeKey', 'pauseKey', 'kycKey'];

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

	const handleFinish = async () => {
		const {
			autorenewAccount,
			managementPermissions,
			freezeKey,
			kycKey,
			wipeKey,
			pauseKey,
			supplyKey,
			reserveInitialAmount,
			reserveAddress,
		} = getValues();

		request.autoRenewAccount = autorenewAccount;

		if (!reserveInitialAmount) {
			request.createReserve = false;
			request.reserveAddress = reserveAddress;
		} else {
			request.createReserve = true;
			request.reserveInitialAmount = reserveInitialAmount;
			request.reserveAddress = undefined;
		}

		if (managementPermissions) {
			request.adminKey = Account.NullPublicKey; // accountInfo.publicKey;
			request.freezeKey = Account.NullPublicKey;
			request.KYCKey = Account.NullPublicKey;
			request.wipeKey = Account.NullPublicKey;
			request.pauseKey = Account.NullPublicKey;
			request.supplyKey = Account.NullPublicKey;
			request.treasury = undefined;
		} else {
			request.adminKey = accountInfo.publicKey;
			request.freezeKey = formatKey(freezeKey.label, 'freezeKey');
			request.KYCKey = formatKey(kycKey.label, 'kycKey');
			request.wipeKey = formatKey(wipeKey.label, 'wipeKey');
			request.pauseKey = formatKey(pauseKey.label, 'pauseKey');
			request.supplyKey = formatKey(supplyKey.label, 'supplyKey');
			request.treasury =
				formatKey(supplyKey.label, 'supplyKey')?.key !== Account.NullPublicKey.key && accountInfo.id
					? accountInfo.id
					: undefined;
		}
		// alert(request.dataFeedAddress)
		try {
			onOpen();
			setLoading(true);
			await SDKService.createStableCoin(request);
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

	const stepperProps = {
		steps,
		handleLastButtonPrimary: handleFinish,
		handleFirstButtonSecondary: handleCancel,
		textLastButtonPrimary: t('common.createStableCoin'),
		isValid: isValidForm,
		currentStep,
		setCurrentStep,
	};

	const variant = loading ? 'loading' : success ? 'success' : 'error';

	return (
		<Stack h='full'>
			<BaseContainer title={t('common.createNewStableCoin')}>
				<Stepper {...stepperProps} />
			</BaseContainer>
			<ModalNotification
				variant={variant}
				title={
					loading ? 'Loading' : t('notification.title', { result: success ? 'Success' : 'Error' })
				}
				description={
					loading ? undefined : t(`notification.description${success ? 'Success' : 'Error'}`)
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
