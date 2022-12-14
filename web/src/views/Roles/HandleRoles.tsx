import { useTranslation } from 'react-i18next';
import { Box, HStack, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm, useWatch } from 'react-hook-form';
import { useState, useEffect } from 'react';
import RoleLayout from './RoleLayout';
import ModalsHandler from '../../components/ModalsHandler';
import DetailsReview from '../../components/DetailsReview';
import SwitchController from '../../components/Form/SwitchController';
import { roleOptions, cashinLimitOptions, fields, actions, roleExternalTokens } from './constants';
import type { Detail } from '../../components/DetailsReview';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';
import SDKService from '../../services/SDKService';
import { useSelector } from 'react-redux';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNT,
	SELECTED_WALLET_CAPABILITIES,
} from '../../store/slices/walletSlice';
import { SelectController } from '../../components/Form/SelectController';
import { formatAmountWithDecimals } from '../../utils/inputHelper';
import {
	CheckSupplierLimitRequest,
	GetSupplierAllowanceRequest,
	DecreaseSupplierAllowanceRequest,
	GrantRoleRequest,
	HasRoleRequest,
	IncreaseSupplierAllowanceRequest,
	ResetSupplierAllowanceRequest,
	RevokeRoleRequest,
	Operation,
	Access,
} from 'hedera-stable-coin-sdk';
import InputController from '../../components/Form/InputController';
import { handleRequestValidation, validateDecimalsString } from '../../utils/validationsHelper';
import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';

const supplier = 'Cash in';

const styles = {
	menuList: {
		maxH: '220px',
		overflowY: 'auto',
		bg: 'brand.white',
		boxShadow: 'down-black',
		p: 4,
	},
	wrapper: {
		border: '1px',
		borderColor: 'brand.black',
		borderRadius: '8px',
		height: 'initial',
	},
};

export type Action = 'editRole' | 'giveRole' | 'revokeRole' | 'refreshRoles';

interface HandleRolesProps {
	action: Action;
}

const HandleRoles = ({ action }: HandleRolesProps) => {
	const { t } = useTranslation(['global', 'roles', 'stableCoinCreation', 'externalTokenInfo']);
	const {
		control,
		formState: { isValid },
		register,
		watch,
	} = useForm({ mode: 'onChange' });

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const selectedAccount = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);
	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);

	const [limit, setLimit] = useState<string | null>();
	const [modalErrorDescription, setModalErrorDescription] =
		useState<string>('modalErrorDescription');
	const [request, setRequest] = useState<
		| GrantRoleRequest
		| RevokeRoleRequest
		| IncreaseSupplierAllowanceRequest
		| GetSupplierAllowanceRequest
		| ResetSupplierAllowanceRequest
		| DecreaseSupplierAllowanceRequest
	>();

	register(fields.supplierQuantitySwitch, { value: true });
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const account: string | undefined = watch(fields.account);
	const amount: string | undefined = watch(fields.amount);
	const infinity: boolean = watch(fields.supplierQuantitySwitch);
	const supplierLimitOption = watch(fields.cashinLimitOption)?.value;
	const increaseOrDecreseOptionSelected: boolean = ['INCREASE', 'DECREASE'].includes(
		supplierLimitOption,
	);
	const checkOptionSelected: boolean = ['CHECK'].includes(supplierLimitOption);
	const role = watch(fields.role);
	const filteredCapabilities = roleOptions.filter((option) => {
		if (
			!capabilities!.capabilities.includes({ operation: Operation.CASH_IN, access: Access.HTS }) &&
			!capabilities!.capabilities.includes({
				operation: Operation.CASH_IN,
				access: Access.CONTRACT,
			}) &&
			option.label === 'Cash in'
		) {
			return false;
		}
		if (
			!capabilities!.capabilities.includes({ operation: Operation.BURN, access: Access.HTS }) &&
			!capabilities!.capabilities.includes({
				operation: Operation.BURN,
				access: Access.CONTRACT,
			}) &&
			option.label === 'Burn'
		) {
			return false;
		}
		if (
			!capabilities!.capabilities.includes({ operation: Operation.WIPE, access: Access.HTS }) &&
			!capabilities!.capabilities.includes({
				operation: Operation.WIPE,
				access: Access.CONTRACT,
			}) &&
			option.label === 'Wipe'
		) {
			return false;
		}
		if (
			!capabilities!.capabilities.includes({ operation: Operation.PAUSE, access: Access.HTS }) &&
			!capabilities!.capabilities.includes({
				operation: Operation.PAUSE,
				access: Access.CONTRACT,
			}) &&
			option.label === 'Pause'
		) {
			return false;
		}
		if (
			!capabilities!.capabilities.includes({ operation: Operation.RESCUE, access: Access.HTS }) &&
			!capabilities!.capabilities.includes({
				operation: Operation.RESCUE,
				access: Access.CONTRACT,
			}) &&
			option.label === 'Rescue'
		) {
			return false;
		}
		if (
			!capabilities!.capabilities.includes({ operation: Operation.FREEZE, access: Access.HTS }) &&
			!capabilities!.capabilities.includes({
				operation: Operation.FREEZE,
				access: Access.CONTRACT,
			}) &&
			option.label === 'Freeze'
		) {
			return false;
		}
		return true;
	});
	// console.log(filteredCapabilities);
	// console.log(capabilities);
	useEffect(() => {
		switch (action.toString()) {
			case 'giveRole':
				setRequest(
					new GrantRoleRequest({
						tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
						targetId: '',
						amount: '0',
						role: undefined,
					}),
				);
				break;
			case 'revokeRole':
				setRequest(
					new RevokeRoleRequest({
						tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
						targetId: '',
						role: undefined,
					}),
				);
				break;
			case 'editRole':
				switch (supplierLimitOption) {
					case 'INCREASE':
						setRequest(
							new IncreaseSupplierAllowanceRequest({
								tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
								targetId: '',
								amount: '0',
							}),
						);
						break;
					case 'DECREASE':
						setRequest(
							new DecreaseSupplierAllowanceRequest({
								tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
								targetId: '',
								amount: '0',
							}),
						);
						break;

					case 'RESET':
						setRequest(
							new ResetSupplierAllowanceRequest({
								targetId: '',
								tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
							}),
						);
						break;
					case 'CHECK':
					default:
						setRequest(
							new GetSupplierAllowanceRequest({
								tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
								targetId: '',
							}),
						);
						break;
				}
				break;
		}
	}, [supplierLimitOption]);

	const handleSubmit: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onWarning,
	}) => {
		try {
			if (!selectedStableCoin?.proxyAddress || !selectedStableCoin?.tokenId || !account) {
				onError();
				return;
			}

			let alreadyHasRole;
			let isUnlimitedSupplierAllowance;

			switch (action.toString()) {
				case 'giveRole':
					alreadyHasRole = await SDKService.hasRole(
						new HasRoleRequest({
							tokenId: selectedStableCoin.tokenId.toString(),
							targetId: account,
							role: role.value,
						}),
					);

					if (alreadyHasRole) {
						setModalErrorDescription('hasAlreadyRoleError');
						onWarning();
						return;
					}

					amount
						? await SDKService.grantRole(
								new GrantRoleRequest({
									tokenId: selectedStableCoin.tokenId.toString(),
									targetId: account,
									amount: amount.toString(),
									role: role.value,
								}),
						  )
						: await SDKService.grantRole(
								new GrantRoleRequest({
									tokenId: selectedStableCoin.tokenId.toString(),
									targetId: account,
									role: role.value,
								}),
						  );
					break;

				case 'revokeRole':
					alreadyHasRole = await SDKService.hasRole(
						new HasRoleRequest({
							tokenId: selectedStableCoin.tokenId.toString(),
							targetId: account,
							role: role.value,
						}),
					);

					if (alreadyHasRole) {
						setModalErrorDescription('hasNotRoleError');
						onWarning();
						return;
					}

					await SDKService.revokeRole(
						new RevokeRoleRequest({
							tokenId: selectedStableCoin.tokenId.toString(),
							targetId: account,
							role: role.value,
						}),
					);
					break;

				case 'editRole':
					isUnlimitedSupplierAllowance = await SDKService.isUnlimitedSupplierAllowance(
						new CheckSupplierLimitRequest({
							targetId: account,
							tokenId: selectedStableCoin.tokenId.toString(),
						}),
					);

					if (isUnlimitedSupplierAllowance) {
						setModalErrorDescription('hasInfiniteAllowance');
						onWarning();
						return;
					}

					switch (supplierLimitOption) {
						case 'INCREASE':
							await SDKService.increaseSupplierAllowance(
								new IncreaseSupplierAllowanceRequest({
									tokenId: selectedStableCoin.tokenId.toString(),
									targetId: account,
									amount: amount ? amount.toString() : '',
								}),
							);
							break;

						case 'DECREASE':
							await SDKService.decreaseSupplierAllowance(
								new DecreaseSupplierAllowanceRequest({
									tokenId: selectedStableCoin.tokenId.toString(),
									targetId: account,
									amount: amount ? amount.toString() : '',
								}),
							);
							break;

						case 'RESET':
							await SDKService.resetSupplierAllowance(
								new ResetSupplierAllowanceRequest({
									targetId: account,
								}),
							);
							break;

						case 'CHECK': {
							const limit = await SDKService.checkSupplierAllowance(
								new GetSupplierAllowanceRequest({
									tokenId: selectedStableCoin.tokenId.toString(),
									targetId: account,
								}),
							);
							setLimit(limit);
						}
					}
					break;
			}
			onSuccess();
		} catch (error: any) {
			setErrorTransactionUrl(error.transactionUrl);
			onError();
		}
	};

	const renderSupplierQuantity = () => {
		const { decimals = 0 } = selectedStableCoin || {};
		return (
			<Box data-testid='supplier-quantity'>
				<HStack>
					<Text>{t(`roles:${action}.supplierQuantityQuestion`)}</Text>
				</HStack>
				<HStack mt='20px'>
					<Text mr='10px'>{t(`roles:${action}.switchLabel`)}</Text>
					<SwitchController control={control} name={fields.supplierQuantitySwitch} />
				</HStack>
				{!infinity && (
					<Box mt='20px'>
						<InputController
							data-testid='input-supplier-quantity'
							rules={{
								required: t(`global:validations.required`),
								validate: {
									validDecimals: (value: string) => {
										return (
											validateDecimalsString(value, decimals) ||
											t('global:validations.decimalsValidation')
										);
									},
									validation: (value: string) => {
										if (request && 'amount' in request) {
											request.amount = value;
											const res = handleRequestValidation(request.validate('amount'));
											return res;
										}
									},
								},
							}}
							isRequired
							control={control}
							name={fields.amount}
							placeholder={t(`roles:${action}.supplierQuantityInputPlaceholder`)}
						/>
					</Box>
				)}
			</Box>
		);
	};

	const renderCashinLimitOptions = () => {
		return (
			<SelectController
				rules={{
					required: t('global:validations.required'),
				}}
				isRequired
				control={control}
				name={fields.cashinLimitOption}
				label={t(`roles:${action}.selectLabel`)}
				placeholder={t(`roles:${action}.selectPlaceholder`)}
				options={cashinLimitOptions}
				addonLeft={true}
				overrideStyles={styles}
				variant='unstyled'
			/>
		);
	};

	const renderAmount = () => {
		const { decimals = 0 } = selectedStableCoin || {};
		return (
			<Stack spacing={6}>
				{increaseOrDecreseOptionSelected && (
					<InputController
						rules={{
							required: t(`global:validations.required`),
							validate: {
								validDecimals: (value: string) => {
									return (
										validateDecimalsString(value, decimals) ||
										t('global:validations.decimalsValidation')
									);
								},
								validation: (value: string) => {
									if (request && 'amount' in request) {
										request.amount = value;
										const res = handleRequestValidation(request.validate('amount'));
										return res;
									}
								},
							},
						}}
						isRequired
						control={control}
						name='amount'
						label={t(`roles:${action}.amountLabel`)}
						placeholder={t(`roles:${action}.amountPlaceholder`)}
					/>
				)}
			</Stack>
		);
	};
	const renderRoles = () => {
		const askRolesToSDK = useWatch({
			control,
			name: 'autoCheckRoles',
		});
		return (
			<Stack>
				<HStack mb={4}>
					<Text fontSize='14px' fontWeight='400' lineHeight='17px'>
						{t('externalTokenInfo:externalTokenInfo.autoCheckRoles')}
					</Text>
					<SwitchController control={control} name={fields.autoCheckRoles} defaultValue={false} />
				</HStack>
				;
				{!askRolesToSDK && (
					<SelectController
						control={control}
						name={fields.roles}
						label={'Roles'}
						placeholder={t('externalTokenInfo:externalTokenInfo.rolesPlaceholder')}
						options={roleExternalTokens}
						addonLeft={true}
						variant='unstyled'
						overrideStyles={styles}
						isMulti
					/>
				)}
			</Stack>
		);
	};

	const getDetails: () => Detail[] = () => {
		let details: Detail[] = [
			{
				label: t(`roles:${action}.modalActionDetailAccount`),
				value: account as string,
			},
		];
		if (action === actions.refresh) {
			details = [];
		} else if (action !== actions.edit) {
			const value = role?.label;
			const roleAction: Detail = {
				label: t(`roles:${action}.modalActionDetailRole`),
				value,
				valueInBold: true,
			};
			details.push(roleAction);
		} else if (supplierLimitOption) {
			const value = cashinLimitOptions.find((t) => t.value === supplierLimitOption)!.label;
			const supplierLimitAction: Detail = {
				label: t(`roles:${action}.selectLabel`),
				value,
				valueInBold: true,
			};
			details.push(supplierLimitAction);
			if (increaseOrDecreseOptionSelected) {
				const value = amount;
				const amountAction: Detail = {
					label: t(`roles:${action}.amountLabel`),
					value,
				};
				details.push(amountAction);
			}
		}

		if (role?.label === supplier) {
			const value = infinity ? t(`roles:${action}.infinity`) : amount!;
			const tokenQuantity: Detail = {
				label: t(`roles:${action}.modalActionDetailSupplierQuantity`),
				value,
			};

			details.push(tokenQuantity);
		}

		return details;
	};

	useRefreshCoinInfo();

	const details = getDetails();

	return (
		<>
			<RoleLayout
				accountLabel={t(`roles:${action}.accountLabel`)}
				accountPlaceholder={t(`roles:${action}.accountPlaceholder`)}
				buttonConfirmEnable={isValid || action === actions.refresh}
				control={control}
				onConfirm={onOpen}
				options={filteredCapabilities}
				selectorLabel={t(`roles:${action}.selectLabel`)}
				selectorPlaceholder={t(`roles:${action}.selectPlaceholder`)}
				// @ts-ignore-next-line
				title={t(`roles:${action}.title`)}
				roleRequest={action !== actions.edit}
				request={request}
			>
				{role?.label === supplier && action !== actions.revoke && renderSupplierQuantity()}
				{action === actions.edit && renderCashinLimitOptions()}
				{action === actions.edit && renderAmount()}
				{action === actions.refresh && renderRoles()}
			</RoleLayout>
			<ModalsHandler
				errorNotificationTitle={t(`roles:${action}.modalErrorTitle`)}
				// @ts-ignore-next-line
				errorNotificationDescription={t(`roles:${action}.${modalErrorDescription}`)}
				errorTransactionUrl={errorTransactionUrl}
				// @ts-ignore-next-line
				warningNotificationDescription={t(`roles:${action}.${modalErrorDescription}`)}
				modalActionProps={{
					isOpen,
					onClose,
					title: t(`roles:${action}.modalActionTitle`),
					confirmButtonLabel: t(`roles:${action}.modalActionConfirmButton`),
					onConfirm: handleSubmit,
				}}
				ModalActionChildren={
					<DetailsReview title={t(`roles:${action}.modalActionSubtitle`)} details={details} />
				}
				successNotificationTitle={t(`roles:${action}.modalSuccessTitle`)}
				successNotificationDescription={
					checkOptionSelected
						? t(`roles:${action}.checkCashinLimitSuccessDesc`, {
								account,
								limit: formatAmountWithDecimals({
									amount: limit ? limit.toString() : '',
									decimals: selectedStableCoin!.decimals!,
								}),
						  })
						: ''
				}
			/>
		</>
	);
};

export default HandleRoles;
