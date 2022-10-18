import { useTranslation } from 'react-i18next';
import { Box, HStack, Text, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import RoleLayout from './RoleLayout';
import ModalsHandler from '../../components/ModalsHandler';
import DetailsReview from '../../components/DetailsReview';
import SwitchController from '../../components/Form/SwitchController';
import InputNumberController from '../../components/Form/InputNumberController';
import { fakeOptions, fields, actions } from './constants';
import type { Detail } from '../../components/DetailsReview';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';
import SDKService from '../../services/SDKService';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET_COIN, SELECTED_WALLET_PAIRED_ACCOUNT } from '../../store/slices/walletSlice';
import { useState } from 'react';


const supplier = 'Cash in';

export type Action = 'editRole' | 'giveRole' | 'revokeRole';

interface HandleRolesProps {
	action: Action;
}

const HandleRoles = ({ action }: HandleRolesProps) => {
	const { t } = useTranslation(['global', 'roles']);
	const {
		control,
		formState: { isValid },
		register,
		watch,
	} = useForm({ mode: 'onChange' });
	register(fields.supplierQuantitySwitch, { value: true });
	const { isOpen, onOpen, onClose } = useDisclosure();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const selectedAccount = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT);

	const account: string | undefined = watch(fields.account);
	const amount: string | undefined = watch(fields.amount);
	const infinity: boolean = watch(fields.supplierQuantitySwitch);
	const role = watch(fields.role);
	const [modalErrorDescription, setModalErrorDescription ] = useState<string>('modalErrorDescription');

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleSubmit: ModalsHandlerActionsProps['onConfirm'] = async ({ onSuccess, onError }) => {
		console.log(
			`${action.split('Role')[0].toUpperCase()} role ${role.label} to account ${account}`,
		);
		try {
		if (!selectedStableCoin?.memo?.proxyContract || !selectedStableCoin?.tokenId || !account) {
			onError();
			return;
		}
		let alreadyHasRole ;
		
		switch(action.toString()){
			case 'giveRole':
				console.log('Switch: Give Role')
				alreadyHasRole = await SDKService.hasRole({
					proxyContractId: selectedStableCoin.memo.proxyContract,
					account: selectedAccount,
					tokenId: selectedStableCoin.tokenId,
					targetId: account,
					role: role.value
				}) ;
				if (alreadyHasRole && alreadyHasRole[0]){
					setModalErrorDescription('hasAlreadyRoleError');
					onError();
					return;
				}
				amount ? 
				await SDKService.grantRole({
					proxyContractId: selectedStableCoin.memo.proxyContract,
					account: selectedAccount,
					tokenId: selectedStableCoin.tokenId,
					targetId: account,
					amount: parseFloat(amount),
					role: role.value
				}) : 
				await SDKService.grantRole({
					proxyContractId: selectedStableCoin.memo.proxyContract,
					account: selectedAccount,
					tokenId: selectedStableCoin.tokenId,
					targetId: account,
					role: role.value
				}) ;
			break;
			case 'revokeRole':
				console.log('Switch: Revoke Role')
				alreadyHasRole = await SDKService.hasRole({
					proxyContractId: selectedStableCoin.memo.proxyContract,
					account: selectedAccount,
					tokenId: selectedStableCoin.tokenId,
					targetId: account,
					role: role.value
				}) ;
				if (alreadyHasRole && !alreadyHasRole[0]){
					setModalErrorDescription('hasNotRoleError');
					onError();
					return;
				}
				await SDKService.revokeRole({
					proxyContractId: selectedStableCoin.memo.proxyContract,
					account: selectedAccount,
					tokenId: selectedStableCoin.tokenId,
					targetId: account,
					role: role.value
				}) ;
			break;
		}

		onSuccess();
	} catch (error: any) {
		console.log(error.toString());
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

	const getDetails: () => Detail[] = () => {
		const details: Detail[] = [
			{
				label: t(`roles:${action}.modalActionDetailAccount`),
				value: account as string,
			},
			{
				label: t(`roles:${action}.modalActionDetailRole`),
				value: role?.label,
				valueInBold: true,
			},
		];

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
				title={t(`roles:${action.split('Role')[0]}`)}
			>
				{role?.label === supplier && action !== actions.revoke && renderSupplierQuantity()}
			</RoleLayout>
			<ModalsHandler
				errorNotificationTitle={t(`roles:${action}.modalErrorTitle`)}
				// @ts-ignore-next-line
				errorNotificationDescription={t(`roles:${action}.${modalErrorDescription}`)}
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
