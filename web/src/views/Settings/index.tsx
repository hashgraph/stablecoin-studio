import { Button, Flex, Heading, SimpleGrid, Text, useDisclosure, VStack } from '@chakra-ui/react';

import {
	ChangeProxyOwnerRequest,
	UpgradeImplementationRequest,
} from '@hashgraph-dev/stablecoin-npm-sdk';

import type { ReactNode } from 'react';
import { useState } from 'react';

import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import AwaitingWalletSignature from '../../components/AwaitingWalletSignature';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';
import ModalNotification from '../../components/ModalNotification';
import { propertyNotFound } from '../../constant';

import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import SDKService from '../../services/SDKService';
import {
	SELECTED_WALLET_COIN_PROXY_CONFIG,
	SELECTED_WALLET_COIN,
} from '../../store/slices/walletSlice';
import { handleRequestValidation } from '../../utils/validationsHelper';

const Settings = () => {
	const [awaitingUpdate, setAwaitingUpdate] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<any>();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const variant = awaitingUpdate ? 'loading' : success ? 'success' : 'error';

	const { t } = useTranslation(['settings', 'global']);

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const proxyConfig = useSelector(SELECTED_WALLET_COIN_PROXY_CONFIG);

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

	const { isLoading } = useRefreshCoinInfo();

	const form = useForm<FieldValues>({
		mode: 'onChange',
	});

	const { control, getValues } = form;

	const handleUpgradeImplementation = async () => {
		const { implementationAddress } = getValues();
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
			{isLoading && <AwaitingWalletSignature />}
			{selectedStableCoin && !isLoading && selectedStableCoin.proxyAdminAddress && (
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
							title: t('settings:updateOwner.title'),
							label: t('settings:updateOwner.label'),
							current: proxyConfig?.owner?.toString() ?? '',
							input: (
								<InputController
									control={control}
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
										validate: {
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
									placeholder={t('settings:updateOwner.inputPlaceholder') ?? propertyNotFound}
									isReadOnly={false}
								/>
							),
							button: (
								<Button
									data-testid={`update-update-owner-button`}
									variant='primary'
									onClick={handleChangeOwner}
								>
									{t('settings:updateOwner.buttonText')}
								</Button>
							),
						})}
						{GridItem({
							name: 'address',
							title: t('settings:updateImplementation.title'),
							label: t('settings:updateImplementation.label'),
							current: proxyConfig?.implementationAddress?.toString() ?? '',
							input: (
								<InputController
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
										validate: {
											validation: (value: string) => {
												upgradeImplementationRequest.implementationAddress = value;
												const res = handleRequestValidation(
													upgradeImplementationRequest.validate('implementationAddress'),
												);
												return res;
											},
										},
									}}
									control={control}
									name={'reserveAddress'}
									placeholder={
										t('settings:updateImplementation.inputPlaceholder') ?? propertyNotFound
									}
								/>
							),
							button: (
								<Button
									data-testid={`update-implementation-address-button`}
									variant='primary'
									onClick={handleUpgradeImplementation}
								>
									{t('settings:updateImplementation.buttonText')}
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
						: t('settings:notification.title', {
								result: success ? 'Success' : 'Error',
						  })
				}
				description={
					awaitingUpdate
						? undefined
						: t(`settings:notification.description${success ? 'Success' : 'Error'}`)
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

export default Settings;
