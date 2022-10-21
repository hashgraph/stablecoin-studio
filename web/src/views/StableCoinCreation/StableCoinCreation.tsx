import { useEffect, useState } from 'react';
import { Stack, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
import { AccountId, PublicKey } from 'hedera-stable-coin-sdk';
import type { ICreateStableCoinRequest } from 'hedera-stable-coin-sdk';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store/store';

const StableCoinCreation = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const { t } = useTranslation('stableCoinCreation');
	const form = useForm({ mode: 'onChange' });
	const {
		control,
		getValues,
		watch,
		formState: { errors },
	} = form;

	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

	const [isValidForm, setIsValidForm] = useState<boolean>(false);
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [success, setSuccess] = useState<boolean>();
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
			children: <BasicDetails control={control} />,
		},
		{
			number: '02',
			title: t('tabs.optionalDetails'),
			children: <OptionalDetails control={control} />,
		},
		{
			number: '03',
			title: t('tabs.managementPermissions'),
			children: <ManagementPermissions control={control} />,
		},
		{
			number: '04',
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
				const keys = ['adminKey', 'supplyKey', 'wipeKey', 'freezeKey', 'pauseKey'];

				// @ts-ignore
				fieldsStep = watch(keys);
				fieldsStep.forEach((item, index) => {
					if (item?.value === OTHER_KEY_VALUE) {
						// @ts-ignore
						fieldsStep[index] = watch(keys[index].concat('Other'));
					}

					if (item?.value === OTHER_KEY_VALUE && index === 1) {
						// @ts-ignore
						fieldsStep = fieldsStep.concat(watch('treasuryAccountAddress'));
					}
				});
			}
		}

		return setIsValidForm(
			fieldsStep?.filter((item) => !item).length === 0 && Object.keys(errors).length === 0,
		);
	};

	const formatKey = (keySelection: string, keyName: string): PublicKey | undefined => {
		const values = getValues();

		if (keySelection === 'Current user key') {
			return accountInfo.publicKey;
		}

		if (keySelection === 'Other key') {
			const param = Object.keys(values).find((key) => key.includes(keyName + 'Other'));

			return new PublicKey({
				key: param ? values[param] : '',
				type: 'ED25519',
			});
		}

		if (keySelection === 'None') return undefined;

		return PublicKey.NULL;
	};

	const handleFinish = async () => {
		const {
			name,
			symbol,
			decimals,
			initialSupply,
			autorenewAccount,
			maxSupply,
			managementPermissions,
			freezeKey,
			wipeKey,
			pauseKey,
			supplyKey,
			treasuryAccountAddress,
		} = getValues();

		let newStableCoinParams: ICreateStableCoinRequest = {
			account,
			name,
			symbol,
			decimals,
			initialSupply: initialSupply ? BigInt(initialSupply) : undefined,
			maxSupply: maxSupply ? BigInt(maxSupply) : undefined,
			autoRenewAccount: autorenewAccount,
		};

		if (managementPermissions) {
			newStableCoinParams = {
				...newStableCoinParams,
				adminKey: accountInfo.publicKey,
				freezeKey: PublicKey.NULL,
				KYCKey: PublicKey.NULL,
				wipeKey: PublicKey.NULL,
				pauseKey: PublicKey.NULL,
				supplyKey: PublicKey.NULL,
				treasury: AccountId.NULL,
			};
		} else {
			newStableCoinParams = {
				...newStableCoinParams,
				adminKey: accountInfo.publicKey,
				freezeKey: formatKey(freezeKey.label, 'freezeKey'),
				wipeKey: formatKey(wipeKey.label, 'wipeKey'),
				pauseKey: formatKey(pauseKey.label, 'pauseKey'),
				supplyKey: formatKey(supplyKey.label, 'supplyKey'),
				treasury:
					supplyKey.label === 'Other key' ? new AccountId(treasuryAccountAddress) : AccountId.NULL,
			};
		}

		try {
			await SDKService.createStableCoin(newStableCoinParams);
			setSuccess(true);
		} catch (error) {
			setSuccess(false);
		}

		onOpen();
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

	return (
		<Stack h='full'>
			<BaseContainer title={t('common.createNewStableCoin')}>
				<Stepper {...stepperProps} />
			</BaseContainer>
			<ModalNotification
				variant={success ? 'success' : 'error'}
				title={t('notification.title', { result: success ? 'Success' : 'Error' })}
				description={t(`notification.description${success ? 'Success' : 'Error'}`)}
				isOpen={isOpen}
				onClose={onClose}
				onClick={() => {
					dispatch(getStableCoinList(account));
					RouterManager.to(navigate, NamedRoutes.StableCoinNotSelected);
				}}
				closeOnOverlayClick={false}
				closeButton={false}
			/>
		</Stack>
	);
};

export default StableCoinCreation;
