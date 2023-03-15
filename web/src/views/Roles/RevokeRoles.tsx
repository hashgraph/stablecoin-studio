import { Heading, Text, CheckboxGroup, Grid, useDisclosure, Flex, Button } from '@chakra-ui/react';
import type { StableCoinRole } from 'hedera-stable-coin-sdk';
import {
	GetRolesRequest,
	RevokeMultiRolesRequest,
	RevokeRoleRequest,
} from 'hedera-stable-coin-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { Detail } from '../../components/DetailsReview';
import DetailsReview from '../../components/DetailsReview';
import { CheckboxController } from '../../components/Form/CheckboxController';
import InputController from '../../components/Form/InputController';
import Icon from '../../components/Icon';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';
import ModalsHandler from '../../components/ModalsHandler';
import { propertyNotFound } from '../../constant';
import { SDKService } from '../../services/SDKService';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
	walletActions,
} from '../../store/slices/walletSlice';
import type { AppDispatch } from '../../store/store';
import { handleRequestValidation } from '../../utils/validationsHelper';
import OperationLayout from '../Operations/OperationLayout';
import { roleOptions } from './constants';

const RevokeRoleOperation = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { t } = useTranslation(['global', 'roles', 'stableCoinCreation', 'externalTokenInfo']);
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const { control, getValues, watch, formState, setError } = useForm({
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
	const [revokeRoles, setRevokeRoles] = useState<RevokeRoleRequest[]>([]);
	useEffect(() => {
		isRoleSelected();
	}, [watch()]);

	useEffect(() => {
		addNewAccount();
	}, []);

	const isNotValidAccount = () => {
		const values = getValues()?.rol;
		return values
			? values.some((item: any) => {
					return item.accountId === '';
			  })
			: false;
	};

	const handleRevokeRoles: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
		onCloseModalLoading,
	}) => {
		onLoading();
		const values = getValues();

		const rolesRequest: string[] = [];
		for (const key in values) {
			if (values[key] === true) {
				rolesRequest.push(roleOptions.find((item) => item.label.toLowerCase() === key)!.value);
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
			// Update current account role if is target
			const isAccountTarget = targets.some(
				(item: any) => item?.toString() === accountId?.toString(),
			);
			if (isAccountTarget) {
				const roles = await SDKService.getRoles(
					new GetRolesRequest({
						tokenId: selectedStableCoin!.tokenId!.toString(),
						targetId: accountId!.toString(),
					}),
				);
				dispatch(walletActions.setRoles(roles));
			}
			onSuccess();
		} catch (error: any) {
			// is MultiTargetsInvalid
			if ('targetsId' in error) {
				const targetsNoExists = error.targetsId;
				values.rol.forEach((value: any, index: number) => {
					if (targetsNoExists.find((item: any) => item === value.accountId)) {
						setError(`rol[${index}].accountId`, {
							type: 'invalidAccount',
							message: t('roles:revokeRole.errorAccountIdNotExists', {
								account: value.accountId,
							})!,
						});
					}
				});
				onCloseModalLoading();
			} else {
				setErrorTransactionUrl(error.transactionUrl);
				onError();
			}
		}
	};
	const getAccountsDetails = () => {
		const values = getValues();

		if (values.rol) {
			const details: Detail[] = values.rol.map((item: { accountId: string }) => {
				return {
					label: t(`roles:revokeRole.modalActionDetailAccount`),
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

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const filtered = asArray.filter(([key, value]) => value === true);

		return filtered.map((item) => {
			return {
				label: t(`roles:revokeRole.modalActionDetailRole`),
				value: item[0],
			};
		});
	};
	const addNewAccount = () => {
		if (accounts.length >= 10) return;
		const currentRevokeRole = revokeRoles;
		currentRevokeRole.push(
			new RevokeRoleRequest({
				tokenId: selectedStableCoin!.tokenId!.toString(),
				targetId: '',
				role: undefined,
			}),
		);
		setRevokeRoles(currentRevokeRole);
		append({ accountId: '' });
	};

	const removeAccount = (i: number) => {
		if (accounts.length === 1) return;
		const currentRoleRequest = revokeRoles;
		currentRoleRequest.splice(i, 1);
		setRevokeRoles(currentRoleRequest);
		remove(i);
	};

	const isRoleSelected = (): boolean => {
		const values = getValues();
		delete values.rol;
		return Object.values(values).some((item) => {
			return item === true;
		});
	};


		const handleSubmit = () => {
			const values = getValues().rol;

			const valuesDuplicated: { [index: string]: number[] } = {};
			let sendRequest = true;
			values.forEach((obj: any, index: number) => {
				if (!valuesDuplicated[obj.accountId]) {
					valuesDuplicated[obj.accountId] = [];
				}
				valuesDuplicated[obj.accountId].push(index);
			});
			for (const accountId in valuesDuplicated) {
				if (valuesDuplicated[accountId].length > 1) {
					sendRequest = false;
					valuesDuplicated[accountId].map((index: number) =>
						setError(`rol[${index}].accountId`, {
							type: 'repeatedValue',
							message: t('roles:giveRole.errorAccountIdDuplicated', {
								account: accountId,
							})!,
						}),
					);
				}
			}

			if (sendRequest) {
				onOpenModalAction();
			}
		};

	return (
		<>
			<OperationLayout
				LeftContent={
					<>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t(`roles:revokeRole.title`)}
						</Heading>
						<Text color='brand.gray' fontSize='24px'>
							{t(`roles:revokeRole.titleRoleSection`)}
						</Text>
						<CheckboxGroup>
							<Grid column='4' gap={{ base: 4 }} templateColumns='repeat(4, 1fr)'>
								{roleOptions.map((item, index) => {
									return (
										<CheckboxController
											key={index}
											control={control}
											id={`${item.label?.toString().toLocaleLowerCase()}`}
										>
											{item.label}
										</CheckboxController>
									);
								})}
							</Grid>
						</CheckboxGroup>
						<Text color='brand.gray' fontSize='24px'>
							{t(`roles:revokeRole.titleAccountSection`)}
						</Text>

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
														validation: (value: string) => {
															const _revokeRole = revokeRoles[i];
															_revokeRole.targetId = value;
															const res = handleRequestValidation(_revokeRole.validate('targetId'));
															return res;
														},
													},
												}}
												isRequired
												control={control}
												name={`rol.${i}.accountId`}
												label={t(`roles:revokeRole.accountLabel`).toString()}
												placeholder={t(`roles:revokeRole.accountPlaceholder`).toString()}
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
								{t(`roles:revokeRole.buttonAddAccount`)}
							</Button>
						</Flex>
					</>
				}
				onConfirm={handleSubmit}
				confirmBtnProps={{
					isDisabled: isNotValidAccount() || !isRoleSelected() || !formState.isValid,
				}}
			/>

			<ModalsHandler
				errorNotificationTitle={t(`roles:revokeRole.modalErrorTitle`)}
				// @ts-ignore-next-line
				errorNotificationDescription={t(`roles:revokeRole.modalErrorDescription`)}
				errorTransactionUrl={errorTransactionUrl}
				// @ts-ignore-next-line
				warningNotificationDescription={t(`roles:revokeRole.modalErrorDescription`)}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t(`roles:revokeRole.modalActionTitle`),
					confirmButtonLabel: t(`roles:revokeRole.modalActionConfirmButton`),
					onConfirm: handleRevokeRoles,
				}}
				ModalActionChildren={
					<>
						<DetailsReview
							title={t(`roles:revokeRole.modalActionSubtitleAccountSection`)}
							details={getAccountsDetails()}
							divider={true}
						/>
						<DetailsReview
							title={t(`roles:revokeRole.modalActionSubtitleRolesSection`)}
							details={getRolesDetails()}
						/>
					</>
				}
				successNotificationTitle={t(`roles:revokeRole.modalSuccessTitle`)}
			/>
		</>
	);
};

export default RevokeRoleOperation;
