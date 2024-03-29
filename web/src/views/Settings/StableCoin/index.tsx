import {
	Button,
	Flex,
	Heading,
	Link,
	SimpleGrid,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react';

import {
	AcceptProxyOwnerRequest,
	ChangeProxyOwnerRequest,
	GetTokenManagerListRequest,
	Network,
	UpgradeImplementationRequest,
} from '@hashgraph/stablecoin-npm-sdk';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AwaitingWalletSignature from '../../../components/AwaitingWalletSignature';
import BaseContainer from '../../../components/BaseContainer';
import InputController from '../../../components/Form/InputController';
import ModalNotification from '../../../components/ModalNotification';
import { propertyNotFound } from '../../../constant';

import { useRefreshCoinInfo } from '../../../hooks/useRefreshCoinInfo';
import SDKService from '../../../services/SDKService';
import {
	SELECTED_WALLET_COIN_PROXY_CONFIG,
	SELECTED_WALLET_COIN,
	IS_PROXY_OWNER,
	walletActions,
	SELECTED_WALLET_ACCOUNT_INFO,
	IS_PENDING_OWNER,
	IS_ACCEPT_OWNER,
} from '../../../store/slices/walletSlice';
import { handleRequestValidation } from '../../../utils/validationsHelper';
import type { Option } from '../../../components/Form/SelectCreatableController';
import SelectCreatableController from '../../../components/Form/SelectCreatableController';
import { RouterManager } from '../../../Router/RouterManager';
import { NamedRoutes } from '../../../Router/NamedRoutes';
import Icon from '../../../components/Icon';
import { InfoIcon } from '@chakra-ui/icons';

const StableCoinSettings = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [awaitingUpdate, setAwaitingUpdate] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const variant = awaitingUpdate ? 'loading' : success ? 'success' : 'error';
	const [optionshederaTokenManagerAddresses, setOptionsHederaTokenManagerAddresses] = useState<
		Option[]
	>([]);
	const [gettingHederaTokenManager, setGettingHederaTokenManager] = useState<boolean>(false);
	const [isSameOwner, setIsSameOwner] = useState<boolean>(false);

	const { t } = useTranslation(['settings', 'global']);

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const proxyConfig = useSelector(SELECTED_WALLET_COIN_PROXY_CONFIG);
	const isProxyOwner = useSelector(IS_PROXY_OWNER);
	const isPendingOwner = useSelector(IS_PENDING_OWNER);
	const isAcceptOwner = useSelector(IS_ACCEPT_OWNER);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

	const [upgradeImplementationRequest] = useState<UpgradeImplementationRequest>(
		new UpgradeImplementationRequest({
			tokenId: '',
			implementationAddress: '',
		}),
	);
	const [changeProxyOwnerRequest] = useState<ChangeProxyOwnerRequest>(
		new ChangeProxyOwnerRequest({
			tokenId: '',
			targetId: '',
		}),
	);
	const [acceptProxyOwnerRequest] = useState<AcceptProxyOwnerRequest>(
		new AcceptProxyOwnerRequest({
			tokenId: '',
		}),
	);

	const { isLoading } = useRefreshCoinInfo();

	const form = useForm<FieldValues>({
		mode: 'onChange',
	});

	const optionsHederaTokenManager = async () => {
		const factoryId: string = await Network.getFactoryAddress();

		if (factoryId) {
			setGettingHederaTokenManager(true);

			try {
				const hederaTokenManagerOption: any = await Promise.race([
					SDKService.getHederaTokenManagerList(new GetTokenManagerListRequest({ factoryId })),
					new Promise((resolve, reject) => {
						setTimeout(() => {
							reject(
								new Error("TokenManager contracts list couldn't be obtained in a reasonable time."),
							);
						}, 10000);
					}),
				]).catch((e) => {
					console.log(e.message);
					onOpen();
					throw e;
				});

				const AllOptions: any[] = [];

				const options = hederaTokenManagerOption.map((item: any) => {
					return { label: item.value, value: item.value };
				});

				options.forEach((option: any) => {
					if (option.value.toString() !== proxyConfig?.implementationAddress?.toString())
						AllOptions.push(option);
				});

				setOptionsHederaTokenManagerAddresses(AllOptions.reverse());

				setGettingHederaTokenManager(false);
			} catch (e) {
				setGettingHederaTokenManager(false);
				throw e;
			}
		} else {
			setGettingHederaTokenManager(false);
			setOptionsHederaTokenManagerAddresses([]);
		}
	};

	useEffect(() => {
		optionsHederaTokenManager().catch(console.error);
	}, []);

	useEffect(() => {
		optionsHederaTokenManager().catch(console.error);
	}, [proxyConfig]);

	const { control, getValues } = form;

	const handleUpgradeImplementation = async () => {
		const { updateImplementation } = getValues();
		const implementationAddress = updateImplementation.value;
		if (selectedStableCoin?.tokenId) {
			upgradeImplementationRequest.tokenId = selectedStableCoin.tokenId.toString();
			upgradeImplementationRequest.implementationAddress = implementationAddress;

			try {
				onOpen();
				setAwaitingUpdate(true);
				await SDKService.upgradeImplementation(upgradeImplementationRequest);
				setError('');
				setAwaitingUpdate(false);
				setSuccess(true);
				dispatch(
					walletActions.setSelectedStableCoinProxyConfig({
						owner: proxyConfig?.owner?.toString(),
						implementationAddress: implementationAddress.toString(),
					}),
				);
			} catch (error: any) {
				setAwaitingUpdate(false);
				console.log(error);
				setError(error?.transactionError?.transactionUrl);
				setSuccess(false);
				setAwaitingUpdate(false);
			}
		}
	};

	const handleChangeOwner = async () => {
		const { updateOwner } = getValues();
		if (selectedStableCoin?.tokenId) {
			changeProxyOwnerRequest.tokenId = selectedStableCoin.tokenId.toString();
			changeProxyOwnerRequest.targetId = updateOwner;

			try {
				onOpen();
				setAwaitingUpdate(true);
				await SDKService.changeOwner(changeProxyOwnerRequest);
				setError('');
				setAwaitingUpdate(false);
				setSuccess(true);
				dispatch(
					walletActions.setIsProxyOwner(
						proxyConfig?.owner?.toString() === accountInfo?.id?.toString(),
					),
				);
				dispatch(
					walletActions.setSelectedStableCoinProxyConfig({
						owner: proxyConfig?.owner?.toString(),
						implementationAddress: proxyConfig?.implementationAddress?.toString(),
						pendingOwner: updateOwner.toString(),
					}),
				);
				dispatch(walletActions.setIsAcceptOwner(false));
				dispatch(walletActions.setIsPendingOwner(true));
				RouterManager.to(navigate, NamedRoutes.Settings);
			} catch (error: any) {
				setAwaitingUpdate(false);
				console.log(error);
				setError(error?.transactionError?.transactionUrl);
				setSuccess(false);
				setAwaitingUpdate(false);
			}
		}
	};

	const handleAcceptOwner = async () => {
		if (selectedStableCoin?.tokenId) {
			acceptProxyOwnerRequest.tokenId = selectedStableCoin.tokenId.toString();

			try {
				onOpen();
				setAwaitingUpdate(true);
				await SDKService.acceptOwner(acceptProxyOwnerRequest);
				setError('');
				setAwaitingUpdate(false);
				setSuccess(true);
				dispatch(
					walletActions.setIsProxyOwner(
						proxyConfig?.pendingOwner?.toString() === accountInfo?.id?.toString(),
					),
				);
				dispatch(
					walletActions.setSelectedStableCoinProxyConfig({
						owner: proxyConfig?.pendingOwner?.toString(),
						implementationAddress: proxyConfig?.implementationAddress?.toString(),
						pendingOwner: '0.0.0',
					}),
				);
				dispatch(walletActions.setIsAcceptOwner(false));
				dispatch(walletActions.setIsPendingOwner(false));
				RouterManager.to(navigate, NamedRoutes.Settings);
			} catch (error: any) {
				setAwaitingUpdate(false);
				console.log(error);
				setError(error?.transactionError?.transactionUrl);
				setSuccess(false);
				setAwaitingUpdate(false);
			}
		}
	};

	const handleCancelOwner = async () => {
		if (selectedStableCoin?.tokenId && accountInfo?.id) {
			changeProxyOwnerRequest.tokenId = selectedStableCoin.tokenId.toString();
			changeProxyOwnerRequest.targetId = accountInfo?.id?.toString();
			acceptProxyOwnerRequest.tokenId = selectedStableCoin.tokenId.toString();

			// call changeOwner service to change pendingOwner to account logged owner
			try {
				onOpen();
				setAwaitingUpdate(true);
				await SDKService.changeOwner(changeProxyOwnerRequest);
				setError('');

				dispatch(
					walletActions.setSelectedStableCoinProxyConfig({
						owner: accountInfo?.id?.toString(),
						implementationAddress: proxyConfig?.implementationAddress?.toString(),
						pendingOwner: accountInfo?.id?.toString(),
					}),
				);
				dispatch(walletActions.setIsAcceptOwner(true));
				dispatch(walletActions.setIsPendingOwner(false));
			} catch (error: any) {
				setAwaitingUpdate(false);
				console.log(error);
				setError(error?.transactionError?.transactionUrl);
				setSuccess(false);
				setAwaitingUpdate(false);
			}

			// call acceptOwner service to accept the previous step and set pendingOwner to 0.0.0
			try {
				onOpen();
				await SDKService.acceptOwner(acceptProxyOwnerRequest);
				setError('');
				setAwaitingUpdate(false);
				setSuccess(true);

				dispatch(
					walletActions.setSelectedStableCoinProxyConfig({
						owner: accountInfo?.id?.toString(),
						implementationAddress: proxyConfig?.implementationAddress?.toString(),
						pendingOwner: '0.0.0',
					}),
				);
				dispatch(walletActions.setIsAcceptOwner(false));
				dispatch(walletActions.setIsPendingOwner(false));
			} catch (error: any) {
				setAwaitingUpdate(false);
				console.log(error);
				setError(error?.transactionError?.transactionUrl);
				setSuccess(false);
				setAwaitingUpdate(false);
			}

			RouterManager.to(navigate, NamedRoutes.Settings);
		}
	};

	const GridItem = ({
		name,
		title,
		label,
		current,
		input,
		button,
	}: {
		name: string;
		title: string;
		label: string;
		current?: string;
		input?: ReactNode;
		button: ReactNode;
	}) => (
		<Flex direction='column' alignItems={'center'}>
			<VStack w='100%' alignItems={'start'} gap='6px' maxWidth={'500px'} alignSelf='center'>
				<Heading
					data-testid={name + '-title'}
					fontSize='24px'
					fontWeight='600'
					mb={8}
					lineHeight='15.2px'
					textAlign={'left'}
				>
					{title}{' '}
					{
						<Link href={t('settings:stableCoin.link') || undefined} isExternal>
							<InfoIcon w={3} h={3} />
						</Link>
					}
				</Heading>
				<Text data-testid={name + '-label'} style={{ fontWeight: '600' }}>
					{label}
				</Text>
				<Text
					pl='10px'
					data-testid={name + '-value'}
					color={current === 'Error' ? 'red' : ''}
					mb={5}
				>
					{current}
				</Text>
				{input}
				{button}
			</VStack>
		</Flex>
	);

	return (
		<BaseContainer title={t('settings:title')}>
			{(isLoading || gettingHederaTokenManager) && <AwaitingWalletSignature />}
			{selectedStableCoin &&
				!isLoading &&
				!gettingHederaTokenManager &&
				selectedStableCoin.proxyAdminAddress && (
					<Flex
						direction='column'
						bg='brand.gray100'
						px={{ base: 4, lg: 14 }}
						pt={{ base: 4, lg: 14 }}
						pb={6}
					>
						<SimpleGrid
							columns={{ base: 2 }}
							gap={{ base: 10, lg: 20, md: 40 }}
							alignItems='center'
						>
							{isProxyOwner &&
								!isAcceptOwner &&
								GridItem({
									// GridItem 1 - Update proxy owner
									name: 'owner',
									title: t('settings:stableCoin.transferOwner.title'),
									label: t('settings:stableCoin.transferOwner.label'),
									current: proxyConfig?.owner?.toString() ?? '',
									input: (
										<InputController
											control={control}
											rules={{
												required: t('global:validations.required') ?? propertyNotFound,
												validate: {
													validationOwner: (value: string) => {
														if (proxyConfig?.owner?.toString() === value.toString()) {
															setIsSameOwner(true);
															return t('global:validations.invalidOwner') as string;
														} else {
															setIsSameOwner(false);
														}
													},
													validation: (value: string) => {
														changeProxyOwnerRequest.targetId = value;
														const res = handleRequestValidation(
															changeProxyOwnerRequest.validate('targetId'),
														);
														return res;
													},
												},
											}}
											name={'updateOwner'}
											placeholder={
												t('settings:stableCoin.transferOwner.inputPlaceholder') ?? propertyNotFound
											}
											isReadOnly={false}
										/>
									),
									button: (
										<Button
											data-testid={`update-owner-button`}
											variant='primary'
											onClick={handleChangeOwner}
											isDisabled={isSameOwner}
										>
											{t('settings:stableCoin.transferOwner.buttonText')}
										</Button>
									),
								})}
							{isAcceptOwner &&
								GridItem({
									// GridItem 2 - Accept proxy owner
									name: 'accept',
									title: t('settings:stableCoin.acceptOwner.title'),
									label: t('settings:stableCoin.acceptOwner.label'),
									button: (
										<Button
											data-testid={`accept-owner-button`}
											variant='primary'
											onClick={handleAcceptOwner}
										>
											{t('settings:stableCoin.acceptOwner.buttonText')}
										</Button>
									),
								})}
							{isPendingOwner &&
								GridItem({
									// GridItem 3 - Pending proxy owner
									name: 'pending',
									title: t('settings:stableCoin.pendingOwner.title'),
									label: t('settings:stableCoin.pendingOwner.label'),
									current: proxyConfig?.pendingOwner?.toString() ?? '',
									button: (
										<Button
											data-testid={`cancel-owner-button`}
											variant='primary'
											onClick={handleCancelOwner}
										>
											{t('settings:stableCoin.pendingOwner.buttonText')}
										</Button>
									),
								})}
							{isProxyOwner &&
								GridItem({
									// GridItem 4 - Update proxy implementation
									name: 'address',
									title: t('settings:stableCoin.updateImplementation.title'),
									label: t('settings:stableCoin.updateImplementation.label'),
									current: proxyConfig?.implementationAddress?.toString() ?? '',
									input: (
										<SelectCreatableController
											overrideStyles={{
												wrapper: {
													border: '1px',
													borderColor: 'brand.black',
													borderRadius: '8px',
													height: 'min',
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
											}}
											addonLeft={true}
											addonDown={
												optionshederaTokenManagerAddresses.length > 1 && (
													<Icon name='CaretDown' w={4} h={4} color={'brand.primary200'} />
												)
											}
											rules={{
												required: t(`global:validations.required`) ?? propertyNotFound,
												validate: {
													validation: (option: any) => {
														if (!option || !option.value) return false;
														upgradeImplementationRequest.implementationAddress =
															option.value as string;
														const res = handleRequestValidation(
															upgradeImplementationRequest.validate('implementationAddress'),
														);
														return res;
													},
												},
											}}
											variant='unstyled'
											name={`updateImplementation`}
											control={control}
											isRequired={true}
											defaultValue={'0'}
											options={[...Object.values(optionshederaTokenManagerAddresses)]}
											placeholder={
												t('settings:stableCoin.updateImplementation.inputPlaceholder') ??
												propertyNotFound
											}
										/>
									),
									button: (
										<Button
											data-testid={`update-implementation-address-button`}
											variant='primary'
											onClick={handleUpgradeImplementation}
										>
											{t('settings:stableCoin.updateImplementation.buttonText')}
										</Button>
									),
								})}
						</SimpleGrid>
					</Flex>
				)}
			<ModalNotification
				variant={variant}
				title={
					awaitingUpdate
						? 'Loading'
						: t('settings:stableCoin.notification.title', {
								result: success ? 'Success' : 'Error',
						  })
				}
				description={
					awaitingUpdate
						? undefined
						: t(`settings:stableCoin.notification.description${success ? 'Success' : 'Error'}`)
				}
				isOpen={isOpen}
				onClose={onClose}
				onClick={onClose}
				errorTransactionUrl={error}
				closeButton={false}
				closeOnOverlayClick={false}
			/>
		</BaseContainer>
	);
};

export default StableCoinSettings;
