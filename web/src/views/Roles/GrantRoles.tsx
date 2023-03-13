import {
	Text,
	Heading,
	CheckboxGroup,
	Grid,
	useDisclosure,
	Flex,
	Button,
	Box,
	HStack,
} from '@chakra-ui/react';
import {
	GrantRoleRequest,
	GrantMultiRolesRequest,
	StableCoinRole,
	GetRolesRequest,
} from 'hedera-stable-coin-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { Detail } from '../../components/DetailsReview';
import DetailsReview from '../../components/DetailsReview';
import { CheckboxController } from '../../components/Form/CheckboxController';
import InputController from '../../components/Form/InputController';
import SwitchController from '../../components/Form/SwitchController';
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
import { handleRequestValidation, validateDecimalsString } from '../../utils/validationsHelper';
import OperationLayout from '../Operations/OperationLayout';

interface GrantRoleForm {
	accountId: string;
	amount?: string;
	infinity?: boolean;
}

const GrantRoleOperation = ({
	filteredCapabilities,
}: {
	filteredCapabilities: { id: string; value: StableCoinRole; label: string }[];
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const { t } = useTranslation(['global', 'roles', 'stableCoinCreation', 'externalTokenInfo']);
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const { control, watch, getValues, formState } = useForm({ mode: 'onChange' });
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
	const [grantRoles, setGrantRoles] = useState<GrantRoleRequest[]>([]);

	useEffect(() => {
		isRoleSelected();
	}, [watch()]);

	useEffect(() => {
		addNewAccount();
	}, []);

	const handleGrantRoles: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
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
		const targets = values.rol.map((item: GrantRoleForm) => item.accountId);
		const request = new GrantMultiRolesRequest({
			tokenId: selectedStableCoin!.tokenId!.toString(),
			targetsId: targets,
			roles: rolesRequest as StableCoinRole[],
		});
		if (rolesRequest.includes(StableCoinRole.CASHIN_ROLE)) {
			request.amounts = values.rol.map((item: GrantRoleForm) =>
				item.infinity ? '0' : item.amount,
			);
		}

		try {
			await SDKService.grantMultipleRole(request);
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
			setErrorTransactionUrl(error.transactionUrl);
			onError();
		}
	};
	const getAccountsDetails = () => {
		const values = getValues();

		if (values.rol) {
			const details: Detail[] = values.rol.map((item: GrantRoleForm) => {
				return {
					label: t(`roles:giveRole.modalActionDetailAccount`),
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
				label: t(`roles:giveRole.modalActionDetailRole`),
				value: item[0],
			};
		});
	};
	const addNewAccount = () => {
		if (accounts.length >= 10) return;
		const currentGrantRole = grantRoles;
		currentGrantRole.push(
			new GrantRoleRequest({
				tokenId: selectedStableCoin!.tokenId!.toString(),
				targetId: '',
				role: undefined,
				amount: '0',
			}),
		);
		setGrantRoles(currentGrantRole);
		append({ accountId: '', amount: '', infinity: true });
	};
	const removeAccount = (i: number) => {
		if (accounts.length === 1) return;
		const currentRoleRequest = grantRoles;
		currentRoleRequest.splice(i, 1);
		setGrantRoles(currentRoleRequest);
		remove(i);
	};

	const renderSupplierQuantity = (index: number) => {
		const { decimals = 0 } = selectedStableCoin || {};
		return (
			<>
				<Box>
					<HStack ml='16px' mt='24px' width='216px'>
						<Text mr='10px'>{t(`roles:giveRole.switchLabel`)}</Text>
						<SwitchController control={control} name={`rol.${index}.infinity` as const} />
					</HStack>
				</Box>
				{!watch(`rol.${index}.infinity`) && (
					<Box ml='16px'>
						<InputController
							data-testid='input-supplier-quantity'
							rules={{
								required: t(`global:validations.required`) ?? propertyNotFound,
								validate: {
									validDecimals: (value: string) => {
										return (
											validateDecimalsString(value, decimals) ||
											(t('global:validations.decimalsValidation') ?? propertyNotFound)
										);
									},
									validation: (value: string) => {
										const _grantRole = grantRoles[index];
										_grantRole.amount = value;
										const res = handleRequestValidation(_grantRole.validate('amount'));
										return res;
									},
								},
							}}
							label={t(`roles:giveRole.amountLabel`).toString()}
							isRequired
							control={control}
							name={`rol.${index}.amount` as const}
							placeholder={t(`roles:giveRole.supplierQuantityInputPlaceholder`) ?? propertyNotFound}
						/>
					</Box>
				)}
			</>
		);
	};

	const isRoleSelected = (): boolean => {
		const values = getValues();
		delete values.rol;
		return Object.values(values).some((item) => {
			console.log(item);
			return item === true;
		});
	};

	const isNotValidAccount = () => {
		return accounts.some((item: any) => {
			return item.accountId === '';
		});
	};

	return (
		<>
			<OperationLayout
				LeftContent={
					<>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t('roles:giveRole.title')}
						</Heading>
						<Text color='brand.gray' fontSize='24px'>
							{t(`roles:giveRole.titleRoleSection`)}
						</Text>
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
						<Text color='brand.gray' fontSize='24px'>
							{t(`roles:giveRole.titleAccountSection`)}
						</Text>
						{accounts &&
							accounts.map((item, i) => {
								return (
									<React.Fragment key={i}>
										<Flex alignItems='flex-start'>
											<Flex>
												<InputController
													key={i}
													rules={{
														required: t('global:validations.required') ?? propertyNotFound,
														validate: {
															validation: (value: string) => {
																const _grantRole = grantRoles[i];
																_grantRole.targetId = value;
																const res = handleRequestValidation(
																	_grantRole.validate('targetId'),
																);
																return res;
															},
														},
													}}
													// TODO: Fix tamaño más pequeño para evitar que cuando no sea infinity supply no haga salto raro
													isRequired
													style={{
														width: '216px',
													}}
													control={control}
													name={`rol.${i}.accountId` as const}
													label={t(`roles:giveRole.accountLabel`).toString()}
													placeholder={t(`roles:giveRole.accountPlaceholder`).toString()}
												/>
											</Flex>
											{watch('cash in') && renderSupplierQuantity(i)}
											<Icon
												name='Trash'
												color='brand.primary'
												cursor='pointer'
												fontSize='22px'
												onClick={() => removeAccount(i)}
												// alignSelf='flex-end'
												marginLeft={{ base: 4 }}
												// marginBottom='10px'
												marginTop='40px'
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
				onConfirm={onOpenModalAction}
				confirmBtnProps={{
					isDisabled: (isNotValidAccount() || !isRoleSelected()) && !formState.isValid,
				}}
			/>

			<ModalsHandler
				errorNotificationTitle={t(`roles:giveRole.modalErrorTitle`)}
				// @ts-ignore-next-line
				errorNotificationDescription={t(`roles:giveRole.modalErrorDescription`)}
				errorTransactionUrl={errorTransactionUrl}
				// @ts-ignore-next-line
				warningNotificationDescription={t(`roles:giveRole.modalErrorDescription`)}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t(`roles:giveRole.modalActionTitle`),
					confirmButtonLabel: t(`roles:giveRole.modalActionConfirmButton`),
					onConfirm: handleGrantRoles,
				}}
				ModalActionChildren={
					<>
						<DetailsReview
							title={t(`roles:giveRole.modalActionSubtitleAccountSection`)}
							details={getAccountsDetails()}
							divider={true}
						/>
						<DetailsReview
							title={t(`roles:giveRole.modalActionSubtitleRolesSection`)}
							details={getRolesDetails()}
						/>
					</>
				}
				successNotificationTitle={t(`roles:giveRole.modalSuccessTitle`)}
				successNotificationDescription={
					// eslint-disable-next-line no-constant-condition
					false // checkOptionSelected
						? t(`roles:giveRole.checkCashinLimitSuccessDesc`, {
								account: 'a',
								limit: 'b',
						  })
						: ''
				}
			/>
		</>
	);
};

export default GrantRoleOperation;
