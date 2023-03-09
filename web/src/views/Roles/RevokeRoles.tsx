import { Heading, Stack, CheckboxGroup, Grid, useDisclosure, Flex, Button } from '@chakra-ui/react';
import type { StableCoinRole } from 'hedera-stable-coin-sdk';
import { Access, Operation, RevokeMultiRolesRequest } from 'hedera-stable-coin-sdk';
import React, { useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import type { Detail } from '../../components/DetailsReview';
import DetailsReview from '../../components/DetailsReview';
import { CheckboxController } from '../../components/Form/CheckboxController';
import InputController from '../../components/Form/InputController';
import Icon from '../../components/Icon';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';
import ModalsHandler from '../../components/ModalsHandler';
import { propertyNotFound } from '../../constant';
import { SDKService } from '../../services/SDKService';
import { SELECTED_WALLET_CAPABILITIES, SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import { validateDecimalsString } from '../../utils/validationsHelper';
import OperationLayout from '../Operations/OperationLayout';
import { roleOptions } from './constants';

const RevokeRoleOperation = () => {
	const { t } = useTranslation(['global', 'roles', 'stableCoinCreation', 'externalTokenInfo']);
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);
	const { control, getValues, formState } = useForm({
		mode: 'onChange',
	});
	const {
		fields: accounts,
		append,
		remove,
	} = useFieldArray({
		control,
		name: 'rol',
	});
	const isMaxAccounts = useMemo(() => accounts.length >= 10, [accounts]);
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();

	const operations = capabilities?.capabilities.map((x) => x.operation);
	const filteredCapabilities = roleOptions
		.filter((option) => {
			if (
				!(
					operations?.includes(Operation.CASH_IN) &&
					getAccessByOperation(Operation.CASH_IN) === Access.CONTRACT
				) &&
				option.label === 'Cash in'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.BURN) &&
					getAccessByOperation(Operation.BURN) === Access.CONTRACT
				) &&
				option.label === 'Burn'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.WIPE) &&
					getAccessByOperation(Operation.WIPE) === Access.CONTRACT
				) &&
				option.label === 'Wipe'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.PAUSE) &&
					getAccessByOperation(Operation.PAUSE) === Access.CONTRACT
				) &&
				option.label === 'Pause'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.RESCUE) &&
					getAccessByOperation(Operation.RESCUE) === Access.CONTRACT
				) &&
				option.label === 'Rescue'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.FREEZE) &&
					getAccessByOperation(Operation.FREEZE) === Access.CONTRACT
				) &&
				option.label === 'Freeze'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.DELETE) &&
					getAccessByOperation(Operation.DELETE) === Access.CONTRACT
				) &&
				option.label === 'Delete'
			) {
				return false;
			}
			if (
				!(
					operations?.includes(Operation.GRANT_KYC) &&
					getAccessByOperation(Operation.GRANT_KYC) === Access.CONTRACT
				) &&
				option.label === 'KYC'
			) {
				return false;
			}

			if (
				!(
					operations?.includes(Operation.ROLE_ADMIN_MANAGEMENT) &&
					getAccessByOperation(Operation.ROLE_ADMIN_MANAGEMENT) === Access.CONTRACT
				) &&
				option.label === 'Admin Role'
			) {
				return false;
			}

			return true;
		})
		.map((item) => {
			return { ...item, id: item.label.toLowerCase() };
		});
	const action = 'revokeRole';

	function getAccessByOperation(operation: Operation): Access | undefined {
		return (
			capabilities?.capabilities.filter((capability) => {
				return capability.operation === operation;
			})[0].access ?? undefined
		);
	}
	const handleRevokeRoles: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onWarning,
		onLoading,
	}) => {
		onLoading();
		const values = getValues();
		const rolesRequest: string[] = [];
		for (const key in values) {
			if (values[key] === true) {
				rolesRequest.push(filteredCapabilities.find((item) => item.id === key)!.value);
			}
		}
		const targets = values.rol.map((item: { accountId: any }) => item.accountId);
		const request = new RevokeMultiRolesRequest({
			tokenId: selectedStableCoin!.tokenId!.toString(),
			targetsId: targets,
			roles: rolesRequest as StableCoinRole[],
		});

		try {
			await SDKService.revokeMultiRolesRequest(request);
			onSuccess();
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
			onError();
		}
	};
	const getAccountsDetails = () => {
		const values = getValues();

		if (values.rol) {
			const details: Detail[] = values.rol.map((item: { accountId: string }) => {
				return {
					label: t(`roles:${action}.modalActionDetailAccount`),
					value: item.accountId,
				};
			});
			return details;
		}

		return [] as Detail[];
	};
	const getRolesDetails = () => {
		const obj = getValues();
		const asArray = Object.entries(obj);

		const filtered = asArray.filter(([key, value]) => value === true);

		return filtered.map((item) => {
			return {
				label: t(`roles:${action}.modalActionDetailRole`),
				value: item[0],
			};
		});
	};
	const addNewAccount = () => {
		if (accounts.length >= 10) return;
		append({ accountId: '' });
	};

	const removeAccount = (i: number) => {
		if (accounts.length === 1) return;
		remove(i);
	};

	const isRoleSelected = (): boolean => {
		// TODO: Check if one checkbox is selected
		return false;
	};

	return (
		<>
			<OperationLayout
				LeftContent={
					<>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t(`roles:${action}.titleRoleSection`)}
						</Heading>
						<CheckboxGroup>
							<Grid column='4' gap={{ base: 4 }} templateColumns='repeat(4, 1fr)'>
								{filteredCapabilities.map((item, index) => {
									return (
										<CheckboxController
											key={index}
											value={item.value}
											control={control}
											id={`${item.label?.toString().toLocaleLowerCase()}`}
										>
											{item.label}
										</CheckboxController>
									);
								})}
							</Grid>
						</CheckboxGroup>
						<Heading
							data-testid='title'
							fontSize='24px'
							fontWeight='700'
							mb={10}
							mt={10}
							lineHeight='16px'
						>
							{t(`roles:${action}.titleAccountSection`)}
						</Heading>
						{accounts &&
							accounts.map((item, i) => {
								return (
									<React.Fragment key={item.id}>
										<Flex mb={{ base: 4 }}>
											<InputController
												key={i}
												rules={{
													required: t('global:validations.required') ?? propertyNotFound,
													validate: {
														// validation: (value: string) => {
														// 	if (request) {
														// 		request.targetId = value;
														// 		const res = handleRequestValidation(request.validate('targetId'));
														// 		return res;
														// 	}
														// },
													},
												}}
												isRequired
												control={control}
												name={`rol.${i}.accountId`}
												label={t(`roles:${action}.accountLabel`).toString()}
												placeholder={t(`roles:${action}.accountPlaceholder`).toString()}
												rightElement={
													<Icon
														name='Trash'
														color='brand.primary'
														cursor='pointer'
														fontSize='22px'
														onClick={() => removeAccount(i)}
														alignSelf='center'
														marginLeft={{ base: 4 }}
													/>
												}
											/>
										</Flex>
									</React.Fragment>
								);
							})}
						<Flex justify='flex-end' pt={6} pb={6} justifyContent='space-between'>
							<Button variant='primary' onClick={addNewAccount} isDisabled={isMaxAccounts}>
								{t(`roles:${action}.buttonAddAccount`)}
							</Button>
						</Flex>
					</>
				}
				onConfirm={onOpenModalAction}
				confirmBtnProps={{ isDisabled: !formState.isValid && !isRoleSelected() }}
			/>

			<ModalsHandler
				errorNotificationTitle={t(`roles:${action}.modalErrorTitle`)}
				// @ts-ignore-next-line
				errorNotificationDescription={t(`roles:${action}.modalErrorDescription`)}
				errorTransactionUrl={errorTransactionUrl}
				// @ts-ignore-next-line
				warningNotificationDescription={t(`roles:${action}.modalErrorDescription`)}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t(`roles:${action}.modalActionTitle`),
					confirmButtonLabel: t(`roles:${action}.modalActionConfirmButton`),
					onConfirm: handleRevokeRoles,
				}}
				ModalActionChildren={
					<>
						<DetailsReview
							title={t(`roles:${action}.modalActionSubtitleAccountSection`)}
							details={getAccountsDetails()}
							divider={true}
						/>
						<DetailsReview
							title={t(`roles:${action}.modalActionSubtitleRolesSection`)}
							details={getRolesDetails()}
						/>
					</>
				}
				successNotificationTitle={t(`roles:${action}.modalSuccessTitle`)}
				successNotificationDescription={
					// eslint-disable-next-line no-constant-condition
					false // checkOptionSelected
						? t(`roles:${action}.checkCashinLimitSuccessDesc`, {
								account: 'a',
								limit: 'b',
						  })
						: ''
				}
			/>
		</>
	);
};

export default RevokeRoleOperation;
