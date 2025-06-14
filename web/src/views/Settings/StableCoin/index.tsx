import {
	Button,
	Flex,
	Heading,
	HStack,
	SimpleGrid,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
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
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_COIN_CONFIG_INFO,
	walletActions,
} from '../../../store/slices/walletSlice';
import { formatBytes32 } from '../../../utils/format';
import {
	UpdateConfigRequest,
	UpdateConfigVersionRequest,
	UpdateResolverRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import SDKService from '../../../services/SDKService';
import { RouterManager } from '../../../Router/RouterManager';
import { NamedRoutes } from '../../../Router/NamedRoutes';

const StableCoinSettings = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [awaitingUpdate, setAwaitingUpdate] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const variant = awaitingUpdate ? 'loading' : success ? 'success' : 'error';

	const { t } = useTranslation(['settings', 'global']);

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const selectedStableCoinConfig = useSelector(SELECTED_WALLET_COIN_CONFIG_INFO);

	const { isLoading } = useRefreshCoinInfo();

	const { control, getValues } = useForm<FieldValues>({
		mode: 'onChange',
		defaultValues: {
			resolver: null,
			configId: null,
			configVersion: null,
		},
	});

	const handleUpdateConfig = async () => {
		const { resolver, configId, configVersion } = getValues();

		if (selectedStableCoin?.tokenId) {
			if (configVersion && !configId && !resolver) {
				const updateConfigVersionRequest = new UpdateConfigVersionRequest({
					configVersion: Number(configVersion),
					tokenId: selectedStableCoin.tokenId.toString(),
				});

				try {
					onOpen();
					setAwaitingUpdate(true);
					await SDKService.updateConfigVersion(updateConfigVersionRequest);
					setError('');
					setAwaitingUpdate(false);
					setSuccess(true);
					dispatch(
						walletActions.setSelectedStableCoinConfigInfo({
							...selectedStableCoinConfig,
							configVersion: updateConfigVersionRequest.configVersion,
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

			if (configVersion && configId && !resolver) {
				const updateConfigRequest = new UpdateConfigRequest({
					configId,
					configVersion: Number(configVersion),
					tokenId: selectedStableCoin.tokenId.toString(),
				});

				try {
					onOpen();
					setAwaitingUpdate(true);
					await SDKService.updateConfig(updateConfigRequest);
					setError('');
					setAwaitingUpdate(false);
					setSuccess(true);
					dispatch(
						walletActions.setSelectedStableCoinConfigInfo({
							...selectedStableCoinConfig,
							configVersion: updateConfigRequest.configVersion,
							configId: updateConfigRequest.configId,
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

			if (configVersion && configId && resolver) {
				const updateResolverRequest = new UpdateResolverRequest({
					resolver,
					configId,
					configVersion: Number(configVersion),
					tokenId: selectedStableCoin.tokenId.toString(),
				});

				try {
					onOpen();
					setAwaitingUpdate(true);
					await SDKService.updateResolver(updateResolverRequest);
					setError('');
					setAwaitingUpdate(false);
					setSuccess(true);
					dispatch(
						walletActions.setSelectedStableCoinConfigInfo({
							resolver: updateResolverRequest.resolver,
							configVersion: updateResolverRequest.configVersion,
							configId: updateResolverRequest.configId,
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
		}
	};

	return (
		<BaseContainer title={t('settings:title')}>
			{isLoading && <AwaitingWalletSignature />}
			{selectedStableCoin && !isLoading && (
				<Flex
					direction='column'
					bg='brand.gray100'
					px={{ base: 4, lg: 14 }}
					pt={{ base: 4, lg: 14 }}
					pb={6}
				>
					<SimpleGrid columns={{ base: 2 }} gap={{ base: 10, lg: 20, md: 40 }}>
						<Flex direction='column' alignItems={'center'}>
							<VStack w='100%' alignItems={'start'} gap='6px' maxWidth={'500px'} alignSelf='center'>
								<Heading
									fontSize='24px'
									fontWeight='600'
									mb={8}
									lineHeight='15.2px'
									textAlign={'left'}
								>
									{t('settings:updateConfigurationSettings')}
								</Heading>
								<Text data-testid={'resolver-label'} style={{ fontWeight: '600' }}>
									{t('settings:stableCoin.resolver.label')}
								</Text>
								<InputController
									control={control}
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
									}}
									name={'resolver'}
									placeholder={
										t('settings:stableCoin.resolver.inputPlaceholder') ?? propertyNotFound
									}
									isReadOnly={false}
								/>
								<Text data-testid={'resolver-label'} style={{ fontWeight: '600' }}>
									{t('settings:stableCoin.configId.label')}
								</Text>
								<InputController
									control={control}
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
									}}
									name={'configId'}
									placeholder={
										t('settings:stableCoin.configId.inputPlaceholder') ?? propertyNotFound
									}
									isReadOnly={false}
								/>
								<Text data-testid={'resolver-label'} style={{ fontWeight: '600' }}>
									{t('settings:stableCoin.configVersion.label')}
								</Text>
								<InputController
									control={control}
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
									}}
									name={'configVersion'}
									placeholder={
										t('settings:stableCoin.configVersion.inputPlaceholder') ?? propertyNotFound
									}
									isReadOnly={false}
								/>
								<Button
									data-testid={`update-owner-button`}
									variant='primary'
									onClick={handleUpdateConfig}
								>
									{t('settings:stableCoin.resolver.buttonText')}
								</Button>
							</VStack>
						</Flex>
						<Flex direction='column' alignItems={'center'}>
							<VStack w='100%' alignItems={'start'} gap='6px' maxWidth={'500px'} alignSelf='center'>
								<Heading
									fontSize='24px'
									fontWeight='600'
									mb={8}
									lineHeight='15.2px'
									textAlign={'left'}
								>
									{t('settings:configurationSettings')}
								</Heading>
								<HStack justifyContent={'space-between'}>
									<Text data-testid={'resolver-label'} style={{ fontWeight: '600' }}>
										{t('settings:stableCoin.resolver.label')}:
									</Text>
									<Text data-testid={'resolver-label'}>
										{selectedStableCoinConfig?.resolverAddress}
									</Text>
								</HStack>
								<HStack justifyContent={'space-between'}>
									<Text data-testid={'configId-label'} style={{ fontWeight: '600' }}>
										{t('settings:stableCoin.configId.label')}:
									</Text>
									<Text data-testid={'resolver-label'}>
										{formatBytes32(selectedStableCoinConfig?.configId ?? '')}
									</Text>
								</HStack>
								<HStack alignItems={'items-center'} justifyContent={'space-between'}>
									<Text data-testid={'configVersion-label'} style={{ fontWeight: '600' }}>
										{t('settings:stableCoin.configVersion.label')}:
									</Text>
									<Text data-testid={'resolver-label'}>
										{selectedStableCoinConfig?.configVersion}
									</Text>
								</HStack>
							</VStack>
						</Flex>

						{/* {GridItem({
							name: 'resolver',
							title: t('settings:stableCoin.resolver.title'),
							label: t('settings:stableCoin.resolver.label'),
							current: selectedStableCoinConfig?.resolverAddress ?? '',
							input: (
								<InputController
									control={control}
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
									}}
									name={'updateOwner'}
									placeholder={
										t('settings:stableCoin.transferOwner.inputPlaceholder') ?? propertyNotFound
									}
									isReadOnly={false}
								/>
							),
							// button: (
							// 	<Button
							// 		data-testid={`update-owner-button`}
							// 		variant='primary'
							// 		onClick={handleChangeOwner}
							// 		// isDisabled={isSameOwner}
							// 	>
							// 		{t('settings:stableCoin.transferOwner.buttonText')}
							// 	</Button>
							// ),
						})} */}
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
