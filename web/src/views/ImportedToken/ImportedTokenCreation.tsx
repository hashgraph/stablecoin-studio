import { useEffect, useState } from 'react';
import { Stack, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import BaseContainer from '../../components/BaseContainer';
import type { Step } from '../../components/Stepper';
import Stepper from '../../components/Stepper';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { RouterManager } from '../../Router/RouterManager';
import {
	getStableCoinList,
	getExternalTokenList,
	SELECTED_WALLET_ACCOUNT_INFO,
	SELECTED_WALLET_PAIRED_ACCOUNT,
} from '../../store/slices/walletSlice';
import SDKService from '../../services/SDKService';
import ModalNotification from '../../components/ModalNotification';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import ImportedTokenInfo from './ImportedTokenInfo';
import { ImportTokenService } from '../../services/ImportTokenService';
import { GetStableCoinDetailsRequest } from '@hashgraph/stablecoin-npm-sdk';

const ImportedTokenCreation = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch<AppDispatch>();
	const { t } = useTranslation('externalTokenInfo');
	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

	const stateTokenId = location?.state?.tokenId;

	const form = useForm<FieldValues>({
		mode: 'onChange',
		defaultValues: {
			stableCoinId: stateTokenId,
		},
	});

	const {
		control,
		getValues,
		watch,
		formState: { errors },
	} = form;

	const [isValidForm, setIsValidForm] = useState<boolean>(false);
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [success, setSuccess] = useState<boolean>();
	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		if (getValues()) {
			isValidStep();
		}
	}, [getValues(), currentStep]);

	useEffect(() => {
		if (stateTokenId) {
			form.resetField('stableCoinId', { defaultValue: stateTokenId });
		}
	}, [location.state]);

	const steps: Step[] = [
		{
			number: '01',
			title: t('tabs.externalTokenInfo'),
			children: <ImportedTokenInfo control={control} />,
		},
	];

	const isValidStep = () => {
		// @ts-ignore
		const stableCoinId = watch('stableCoinId');
		const autoCheckRoles = watch('autoCheckRoles');
		const roles = watch('roles');
		return setIsValidForm(
			(stableCoinId &&
				stableCoinId !== 0 &&
				!autoCheckRoles &&
				roles?.length !== 0 &&
				Object.keys(errors).length === 0) ||
				(stableCoinId && stableCoinId !== 0 && autoCheckRoles && Object.keys(errors).length === 0),
		);
	};

	const handleFinish = async () => {
		const { stableCoinId } = getValues();

		try {
			const details = await SDKService.getStableCoinDetails(
				new GetStableCoinDetailsRequest({
					id: stableCoinId,
				}),
			);

			ImportTokenService.importToken(stableCoinId, details?.symbol!, accountInfo?.id!);
			dispatch(getExternalTokenList(accountInfo.id!));
			setSuccess(true);
		} catch (error) {
			console.log(error);
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
		textLastButtonPrimary: t('common.addExternalToken'),
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
					dispatch(getStableCoinList(account.accountId?.toString() ?? ''));
					RouterManager.to(navigate, NamedRoutes.StableCoinNotSelected);
				}}
				closeOnOverlayClick={false}
				closeButton={false}
			/>
		</Stack>
	);
};

export default ImportedTokenCreation;
