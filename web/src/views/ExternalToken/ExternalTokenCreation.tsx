import { useEffect, useState } from 'react';
import { Stack, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import ExternalTokenInfo from './ExternalTokenInfo';
import type { IAccountToken } from '../../interfaces/IAccountToken.js';
import type { IRole } from '../../interfaces/IRole.js';
import type { IExternalToken } from '../../interfaces/IExternalToken';
import { GetRolesRequest, HashPackAccount } from 'hedera-stable-coin-sdk';

const ExternalTokenCreation = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const { t } = useTranslation('externalTokenInfo');

	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

	const form = useForm<FieldValues>({
		mode: 'onChange',
		defaultValues: {
			autorenewAccount: accountInfo.account,
			initialSupply: 0,
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

	const steps: Step[] = [
		{
			number: '01',
			title: t('tabs.externalTokenInfo'),
			children: <ExternalTokenInfo control={control} />,
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
		const { stableCoinId, autoCheckRoles, roles } = getValues();
		let checkRoles: string[] | null = [];
		try {
			const details = await SDKService.getStableCoinDetails({ id: stableCoinId });
			if (autoCheckRoles) {
				checkRoles = await SDKService.getRoles(
					new GetRolesRequest({
						proxyContractId: details && details.memo ? details?.memo.proxyContract : '',
						targetId: accountInfo && accountInfo.account ? accountInfo?.account : '',
						tokenId: details?.tokenId ?? '',
						account,
					}),
				);
			}
			const tokensAccount = localStorage?.tokensAccount;
			if (tokensAccount) {
				const tokensAccountParsed = JSON.parse(tokensAccount);
				const accountToken = tokensAccountParsed.find(
					(account: IAccountToken) => account.id === accountInfo.account,
				);
				if (
					accountToken &&
					accountToken.externalTokens.find((coin: IExternalToken) => coin.id === stableCoinId)
				) {
					accountToken.externalTokens = accountToken.externalTokens.filter(
						(coin: IExternalToken) => coin.id !== stableCoinId,
					);
				}
				accountToken
					? accountToken.externalTokens.push({
							id: stableCoinId,
							symbol: details!.symbol,
							roles: autoCheckRoles
								? checkRoles
								: roles
								? roles.map((role: IRole) => role.label)
								: [],
					  })
					: tokensAccountParsed.push({
							id: accountInfo.account,
							externalTokens: [
								{
									id: stableCoinId,
									symbol: details!.symbol,
									roles: autoCheckRoles
										? checkRoles
										: roles
										? roles.map((role: IRole) => role.label)
										: [],
								},
							],
					  });
				localStorage.setItem('tokensAccount', JSON.stringify(tokensAccountParsed));
			} else {
				localStorage.setItem(
					'tokensAccount',
					JSON.stringify([
						{
							id: accountInfo.account,
							externalTokens: [
								{
									id: stableCoinId,
									symbol: details!.symbol,
									roles: autoCheckRoles
										? checkRoles
										: roles
										? roles.map((role: IRole) => role.label)
										: [],
								},
							],
						},
					]),
				);
			}
			dispatch(getExternalTokenList(accountInfo.account!));
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
					dispatch(getStableCoinList(new HashPackAccount(account.accountId)));
					RouterManager.to(navigate, NamedRoutes.StableCoinNotSelected);
				}}
				closeOnOverlayClick={false}
				closeButton={false}
			/>
		</Stack>
	);
};

export default ExternalTokenCreation;
