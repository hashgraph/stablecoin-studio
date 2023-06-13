import { Button, Flex, Heading, SimpleGrid, Text, useDisclosure, VStack } from '@chakra-ui/react';

import {
	Network,
	ChangeFactoryProxyOwnerRequest,
	UpgradeFactoryImplementationRequest,
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

	const { t } = useTranslation(['settings', 'global']);

	const factoryProxyConfig = useSelector(SELECTED_NETWORK_FACTORY_PROXY_CONFIG);
	const isFactoryProxyOwner = useSelector(IS_FACTORY_PROXY_OWNER);
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
						updateOwner.toString() === accountInfo?.id?.toString(),
					),
				);
				dispatch(
					walletActions.setSelectedNetworkFactoryProxyConfig({
						owner: updateOwner.toString(),
						implementationAddress: factoryProxyConfig?.implementationAddress?.toString(),
					}),
				);

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
		current: string;
		input: ReactNode;
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
			{isFactoryProxyOwner && (
				<Flex
					direction='column'
					bg='brand.gray100'
					px={{ base: 4, lg: 14 }}
					pt={{ base: 4, lg: 14 }}
					pb={6}
				>
					<SimpleGrid columns={{ base: 2 }} gap={{ base: 10, lg: 20, md: 40 }} alignItems='center'>
						{GridItem({
							name: 'owner',
							title: t('settings:factory.updateOwner.title'),
							label: t('settings:factory.updateOwner.label'),
							current: factoryProxyConfig?.owner?.toString() ?? '',
							input: (
								<InputController
									control={control}
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
										validate: {
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
										t('settings:factory.updateOwner.inputPlaceholder') ?? propertyNotFound
									}
									isReadOnly={false}
								/>
							),
							button: (
								<Button
									data-testid={`update-update-owner-button`}
									variant='primary'
									onClick={handleChangeOwner}
								>
									{t('settings:factory.updateOwner.buttonText')}
								</Button>
							),
						})}
						{GridItem({
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
										t('settings:factory.updateImplementation.inputPlaceholder') ?? propertyNotFound
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
			)}
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
