import { useEffect, useState } from 'react';
import { Stack, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { AccountId, PrivateKey } from 'hedera-stable-coin-sdk';
import type { ICreateStableCoinRequest } from 'hedera-stable-coin-sdk';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import { SELECTED_WALLET_PAIRED_ACCOUNTID } from '../../store/slices/walletSlice';
import SDKService from '../../services/SDKService';
import type { RootState } from '../../store/store';
import ModalNotification from '../../components/ModalNotification';

const StableCoinCreation = () => {
	const navigate = useNavigate();
	const { t } = useTranslation('stableCoinCreation');
	const form = useForm({ mode: 'onChange' });
	const {
		control,
		getValues,
		watch,
		formState: { errors },
	} = form;

	const [isValidForm, setIsValidForm] = useState<boolean>(false);
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [success, setSuccess] = useState<boolean>();
	const accountId = useSelector<RootState, string>(SELECTED_WALLET_PAIRED_ACCOUNTID);
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
			let keys = ['initialSupply', 'decimals', 'expirationDate'];

			if (supplyType?.value === 0) keys = keys.concat('totalSupply');

			fieldsStep = watch(keys);
		}

		if (currentStep === 2) {
			// @ts-ignore
			const managePermissions = watch('managementPermissions');

			if (!managePermissions) {
				const keys = [
					'adminKey',
					'supplyKey',
					'rescueKey',
					'wipeKey',
					'freezeKey',
					'feeScheduleKey',
				];

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

	const handleFinish = async () => {
		// TODO: complete request object with keys
		const { name, symbol, autorenewAccount, initialSupply, totalSupply, decimals } = getValues();

		const newStableCoinParams: ICreateStableCoinRequest = {
			accountId: new AccountId(accountId),
			privateKey: new PrivateKey(''),
			name,
			symbol,
			decimals,
			autoRenewAccount: autorenewAccount,
			initialSupply: BigInt(initialSupply),
			maxSupply: totalSupply,
		};

		try {
			const response = await SDKService.createStableCoin(newStableCoinParams);
			console.log('RESPONSE: ', response);
			setSuccess(!!response);
		} catch (error) {
			console.log('ERROR: ', error);
			setSuccess(false);
		}

		onOpen();
	};

	const handleCancel = () => {
		RouterManager.to(navigate, NamedRoutes.Dashboard);
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
				onClick={() => RouterManager.to(navigate, NamedRoutes.Dashboard)}
			/>
		</Stack>
	);
};

export default StableCoinCreation;
