import { Button, Flex, Heading, SimpleGrid, Text, useDisclosure, VStack } from '@chakra-ui/react';

import {
	Network,
	ChangeFactoryProxyOwnerRequest,
	UpgradeFactoryImplementationRequest,
	AcceptFactoryProxyOwnerRequest,
} from '@hashgraph-dev/stablecoin-npm-sdk';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BaseContainer from '../../../components/BaseContainer';
import InputController from '../../../components/Form/InputController';
import ModalNotification from '../../../components/ModalNotification';
import { propertyNotFound } from '../../../constant';

import SDKService from '../../../services/SDKService';
import {
	SELECTED_NETWORK_FACTORY_PROXY_CONFIG,
	IS_FACTORY_PROXY_OWNER,
	walletActions,
	SELECTED_WALLET_ACCOUNT_INFO,
	IS_FACTORY_PENDING_OWNER,
	IS_FACTORY_ACCEPT_OWNER,
} from '../../../store/slices/walletSlice';
import { handleRequestValidation } from '../../../utils/validationsHelper';
import { RouterManager } from '../../../Router/RouterManager';
import { NamedRoutes } from '../../../Router/NamedRoutes';

const FactorySettings = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [awaitingUpdate, setAwaitingUpdate] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const variant = awaitingUpdate ? 'loading' : success ? 'success' : 'error';
	const [isSameFactoryOwner, setIsSameFactoryOwner] = useState<boolean>(false);

	const { t } = useTranslation(['settings', 'global']);

	const factoryProxyConfig = useSelector(SELECTED_NETWORK_FACTORY_PROXY_CONFIG);
	const isFactoryProxyOwner = useSelector(IS_FACTORY_PROXY_OWNER);
	const isFactoryPendingOwner = useSelector(IS_FACTORY_PENDING_OWNER);
	const isFactoryAcceptOwner = useSelector(IS_FACTORY_ACCEPT_OWNER);
	const accountInfo = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

	const [upgradeFactoryImplementationRequest] = useState<UpgradeFactoryImplementationRequest>(
		new UpgradeFactoryImplementationRequest({
			factoryId: '',
			implementationAddress: '',
		}),
	);
	const [changeFactoryProxyOwnerRequest] = useState<ChangeFactoryProxyOwnerRequest>(
		new ChangeFactoryProxyOwnerRequest({
			factoryId: '',
			targetId: '',
		}),
	);
	const [acceptFactoryProxyOwnerRequest] = useState<AcceptFactoryProxyOwnerRequest>(
		new AcceptFactoryProxyOwnerRequest({
			factoryId: '',
		}),
	);

	const form = useForm<FieldValues>({
		mode: 'onChange',
	});

	const { control, getValues } = form;

	const handleUpgradeImplementation = async () => {
		const { updateImplementation } = getValues();
		const factoryId: string = await Network.getFactoryAddress();

		if (factoryId) {
			upgradeFactoryImplementationRequest.factoryId = factoryId;
			upgradeFactoryImplementationRequest.implementationAddress = updateImplementation;

			try {
				onOpen();
				setAwaitingUpdate(true);
				await SDKService.upgradeFactoryImplementation(upgradeFactoryImplementationRequest);
				setError('');
				setAwaitingUpdate(false);
				setSuccess(true);
				dispatch(
					walletActions.setSelectedNetworkFactoryProxyConfig({
						owner: factoryProxyConfig?.owner?.toString(),
						implementationAddress: updateImplementation.toString(),
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
		const factoryId: string = await Network.getFactoryAddress();

		if (factoryId) {
			changeFactoryProxyOwnerRequest.factoryId = factoryId;
			changeFactoryProxyOwnerRequest.targetId = updateOwner;

			try {
				onOpen();
				setAwaitingUpdate(true);
				await SDKService.changeFactoryOwner(changeFactoryProxyOwnerRequest);
				setError('');
				setAwaitingUpdate(false);
				setSuccess(true);
				dispatch(
					walletActions.setIsFactoryProxyOwner(
						factoryProxyConfig?.owner?.toString() === accountInfo?.id?.toString(),
					),
				);
				dispatch(
					walletActions.setSelectedNetworkFactoryProxyConfig({
						owner: factoryProxyConfig?.owner?.toString(),
						implementationAddress: factoryProxyConfig?.implementationAddress?.toString(),
						pendingOwner: updateOwner.toString(),
					}),
				);
				dispatch(walletActions.setIsFactoryAcceptOwner(false));
				dispatch(walletActions.setIsFactoryPendingOwner(true));
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

	const handleAcceptFactoryOwner = async () => {
		const factoryId: string = await Network.getFactoryAddress();

		if (factoryId) {
			acceptFactoryProxyOwnerRequest.factoryId = factoryId;

			try {
				onOpen();
				setAwaitingUpdate(true);
				await SDKService.acceptFactoryOwner(acceptFactoryProxyOwnerRequest);
				setError('');
				setAwaitingUpdate(false);
				setSuccess(true);
				dispatch(
					walletActions.setIsFactoryProxyOwner(
						factoryProxyConfig?.pendingOwner?.toString() === accountInfo?.id?.toString(),
					),
				);
				dispatch(
					walletActions.setSelectedNetworkFactoryProxyConfig({
						owner: factoryProxyConfig?.pendingOwner?.toString(),
						implementationAddress: factoryProxyConfig?.implementationAddress?.toString(),
						pendingOwner: '0.0.0',
					}),
				);
				dispatch(walletActions.setIsFactoryAcceptOwner(false));
				dispatch(walletActions.setIsFactoryPendingOwner(false));
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

	const handleCancelFactoryOwner = async () => {
		const { updateOwner } = getValues();
		const factoryId: string = await Network.getFactoryAddress();

		if (factoryId) {
			changeFactoryProxyOwnerRequest.factoryId = factoryId;
			changeFactoryProxyOwnerRequest.targetId = updateOwner;
			acceptFactoryProxyOwnerRequest.factoryId = factoryId;

			try {
				onOpen();
				setAwaitingUpdate(true);
				await SDKService.changeFactoryOwner(changeFactoryProxyOwnerRequest);
				setError('');

				dispatch(
					walletActions.setSelectedNetworkFactoryProxyConfig({
						owner: accountInfo?.id?.toString(),
						implementationAddress: factoryProxyConfig?.implementationAddress?.toString(),
						pendingOwner: accountInfo?.id?.toString(),
					}),
				);
				dispatch(walletActions.setIsFactoryAcceptOwner(true));
				dispatch(walletActions.setIsFactoryPendingOwner(false));
			} catch (error: any) {
				setAwaitingUpdate(false);
				console.log(error);
				setError(error?.transactionError?.transactionUrl);
				setSuccess(false);
				setAwaitingUpdate(false);
			}

			try {
				onOpen();
				await SDKService.acceptFactoryOwner(acceptFactoryProxyOwnerRequest);
				setError('');
				setAwaitingUpdate(false);
				setSuccess(true);

				dispatch(
					walletActions.setSelectedNetworkFactoryProxyConfig({
						owner: accountInfo?.id?.toString(),
						implementationAddress: factoryProxyConfig?.implementationAddress?.toString(),
						pendingOwner: '0.0.0',
					}),
				);
				dispatch(walletActions.setIsFactoryAcceptOwner(false));
				dispatch(walletActions.setIsFactoryPendingOwner(false));
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
					{title}
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
			{
				<Flex
					direction='column'
					bg='brand.gray100'
					px={{ base: 4, lg: 14 }}
					pt={{ base: 4, lg: 14 }}
					pb={6}
				>
					<SimpleGrid columns={{ base: 2 }} gap={{ base: 10, lg: 20, md: 40 }} alignItems='center'>
						{isFactoryProxyOwner &&
							!isFactoryAcceptOwner &&
							GridItem({
								// GridItem 1 - Update factory proxy owner
								name: 'owner',
								title: t('settings:factory.transferOwner.title'),
								label: t('settings:factory.transferOwner.label'),
								current: factoryProxyConfig?.owner?.toString() ?? '',
								input: (
									<InputController
										control={control}
										rules={{
											required: t('global:validations.required') ?? propertyNotFound,
											validate: {
												validationOwner: (value: string) => {
													if (factoryProxyConfig?.owner?.toString() === value.toString()) {
														setIsSameFactoryOwner(true);
														return t('global:validations.invalidFactoryOwner') as string;
													} else {
														setIsSameFactoryOwner(false);
													}
												},
												validation: (value: string) => {
													changeFactoryProxyOwnerRequest.targetId = value;
													const res = handleRequestValidation(
														changeFactoryProxyOwnerRequest.validate('targetId'),
													);
													return res;
												},
											},
										}}
										name={'updateOwner'}
										placeholder={
											t('settings:factory.transferOwner.inputPlaceholder') ?? propertyNotFound
										}
										isReadOnly={false}
									/>
								),
								button: (
									<Button
										data-testid={`update-owner-button`}
										variant='primary'
										onClick={handleChangeOwner}
										isDisabled={isSameFactoryOwner}
									>
										{t('settings:factory.transferOwner.buttonText')}
									</Button>
								),
							})}
						{isFactoryAcceptOwner &&
							GridItem({
								// GridItem 2 - Accept factory proxy owner
								name: 'acceptFactoryOwner',
								title: t('settings:factory.acceptOwner.title'),
								label: t('settings:factory.acceptOwner.label'),
								button: (
									<Button
										data-testid={`accept-factory-owner-button`}
										variant='primary'
										onClick={handleAcceptFactoryOwner}
									>
										{t('settings:factory.acceptOwner.buttonText')}
									</Button>
								),
							})}
						{isFactoryPendingOwner &&
							GridItem({
								// GridItem 3 - Pending factory proxy owner
								name: 'pendingFactoryOwner',
								title: t('settings:factory.pendingOwner.title'),
								label: t('settings:factory.pendingOwner.label'),
								current: factoryProxyConfig?.pendingOwner?.toString() ?? '',
								button: (
									<Button
										data-testid={`cancel-factory-owner-button`}
										variant='primary'
										onClick={handleCancelFactoryOwner}
									>
										{t('settings:factory.pendingOwner.buttonText')}
									</Button>
								),
							})}
						{isFactoryProxyOwner &&
							GridItem({
								// GridItem 4 - Update factory proxy implementation
								name: 'address',
								title: t('settings:factory.updateImplementation.title'),
								label: t('settings:factory.updateImplementation.label'),
								current: factoryProxyConfig?.implementationAddress?.toString() ?? '',
								input: (
									<InputController
										control={control}
										rules={{
											required: t('global:validations.required') ?? propertyNotFound,
											validate: {
												validation: (value: string) => {
													upgradeFactoryImplementationRequest.implementationAddress = value;
													const res = handleRequestValidation(
														upgradeFactoryImplementationRequest.validate('implementationAddress'),
													);
													return res;
												},
											},
										}}
										name={'updateImplementation'}
										placeholder={
											t('settings:factory.updateImplementation.inputPlaceholder') ??
											propertyNotFound
										}
										isReadOnly={false}
									/>
								),
								button: (
									<Button
										data-testid={`update-implementation-address-button`}
										variant='primary'
										onClick={handleUpgradeImplementation}
									>
										{t('settings:factory.updateImplementation.buttonText')}
									</Button>
								),
							})}
					</SimpleGrid>
				</Flex>
			}
			<ModalNotification
				variant={variant}
				title={
					awaitingUpdate
						? 'Loading'
						: t('settings:factory.notification.title', {
								result: success ? 'Success' : 'Error',
						  })
				}
				description={
					awaitingUpdate
						? undefined
						: t(`settings:factory.notification.description${success ? 'Success' : 'Error'}`)
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

export default FactorySettings;
