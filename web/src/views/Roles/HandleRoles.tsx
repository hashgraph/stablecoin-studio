/* eslint-disable */ 
import { useTranslation } from 'react-i18next';
import { Box, HStack, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import RoleLayout from './RoleLayout';
import ModalsHandler from '../../components/ModalsHandler';
import DetailsReview from '../../components/DetailsReview';
import SwitchController from '../../components/Form/SwitchController';
import InputNumberController from '../../components/Form/InputNumberController';
import { fakeOptions, cashinLimitOptions, fields, actions } from './constants';
import type { Detail } from '../../components/DetailsReview';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';
import { SelectController } from '../../components/Form/SelectController';
import { validateDecimals } from '../../utils/validationsHelper';
import { useSelector } from 'react-redux';
import SDKService from '../../services/SDKService';

import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNT
} from '../../store/slices/walletSlice';

const supplier = 'Supplier';
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

export type Action = 'editRole' | 'giveRole' | 'revokeRole';

interface HandleRolesProps {
	action: Action;
}

const HandleRoles = ({ action }: HandleRolesProps) => {
	const { t } = useTranslation(['global', 'roles', 'stableCoinCreation']);
	const {
		control,
		formState: { isValid },
		register,
		watch,
	} = useForm({ mode: 'onChange' });

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);

	const [errorOperation, setErrorOperation] = useState();

	register(fields.supplierQuantitySwitch, { value: true });
	const { isOpen, onOpen, onClose } = useDisclosure();

	const destinationAccount: string | undefined = watch(fields.account);
	const amount: any = watch(fields.amount);
	const infinity: boolean = watch(fields.supplierQuantitySwitch);
	const supplierLimitOption = watch(fields.cashinLimitOption)?.value;
	const increaseOrDecreseOptionSelected = [1, 2].includes(supplierLimitOption);
	const role = watch(fields.role);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleSubmit: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		try {
			if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId) {
				onError();
				return;
			}
			switch(supplierLimitOption) {
				case 1:
					await SDKService.increaseSupplierAllowance({
						proxyContractId: selectedStableCoin.memo.proxyContract,
						account,
						tokenId: selectedStableCoin.tokenId,
						targetId: destinationAccount!,
						amount
					});
					break;

				case 2:
					await SDKService.decreaseSupplierAllowance({
						proxyContractId: selectedStableCoin.memo.proxyContract,
						account,
						tokenId: selectedStableCoin.tokenId,
						targetId: destinationAccount!,
						amount
					});
					break;
	
			}
			onSuccess();
		} catch (error: any) {
			setErrorOperation(error.toString());
			onError();
		}		
	};

	const renderSupplierQuantity = () => {
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
						<InputNumberController
							data-testid='input-supplier-quantity'
							rules={{
								required: t(`global:validations.required`),
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
		const { decimals = 0, totalSupply } = selectedStableCoin || {};

		return (
			<Stack spacing={6}>
				{increaseOrDecreseOptionSelected && (
					<InputNumberController
						rules={{
							required: t('global:validations.required'),
							validate: {
								maxDecimals: (value: number) => {
									return (
										validateDecimals(value, decimals) ||
										t('global:validations.decimalsValidation')
									);
								},
								quantityOverTotalSupply: (value: number) => {
									return (
										(totalSupply && totalSupply >= value) ||
										t('global:validations.overTotalSupply')
									);
								},
							},
						}}
						decimalScale={decimals}
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

	const getDetails: () => Detail[] = () => {
		const details: Detail[] = [
			{
				label: t(`roles:${action}.modalActionDetailAccount`),
				value: destinationAccount as string,
			}
		];

		if (action !== actions.edit) {
			const value = role?.label;
			const roleAction: Detail = {
				label:t(`roles:${action}.modalActionDetailRole`),
				value,
				valueInBold: true,
			};
			details.push(roleAction);

		} else if (supplierLimitOption) {
			const value = cashinLimitOptions[supplierLimitOption-1].label;
			const supplierLimitAction: Detail = {
				label:t(`roles:${action}.selectLabel`),
				value,
				valueInBold: true,
			};
			details.push(supplierLimitAction);			

			if (amount) {
				const value = amount;
				const amountAction: Detail = {
					label:t(`roles:${action}.amountLabel`),
					value
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

	const details = getDetails();

	return (
		<>
			<RoleLayout
				accountLabel={t(`roles:${action}.accountLabel`)}
				accountPlaceholder={t(`roles:${action}.accountPlaceholder`)}
				buttonConfirmEnable={isValid}
				control={control}
				onConfirm={onOpen}
				options={fakeOptions}
				selectorLabel={t(`roles:${action}.selectLabel`)}
				selectorPlaceholder={t(`roles:${action}.selectPlaceholder`)}
				// @ts-ignore-next-line
				title={t(`roles:${action}.title`)}
				roleRequest={action !== actions.edit}
			>
				{role?.label === supplier && action !== actions.revoke && renderSupplierQuantity()}
				{action === actions.edit && renderCashinLimitOptions()}
				{action === actions.edit && renderAmount()}
			</RoleLayout>
			<ModalsHandler
				errorNotificationTitle={t(`roles:${action}.modalErrorTitle`)}
				errorNotificationDescription={t(`roles:${action}.modalErrorDescription`)}
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
			/>
		</>
	);
};

export default HandleRoles;
