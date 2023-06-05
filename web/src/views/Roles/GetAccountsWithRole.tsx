import { Heading, useDisclosure } from '@chakra-ui/react';
import { GetAccountsWithRolesRequest, StableCoinRole } from '@hashgraph-dev/stablecoin-npm-sdk';
import { SelectController } from '../../components/Form/SelectController';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';
import ModalsHandler from '../../components/ModalsHandler';

import { SDKService } from '../../services/SDKService';
import { SELECTED_NETWORK, SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';

import OperationLayout from '../Operations/OperationLayout';
import DetailsReview from '../../components/DetailsReview';
import type { Detail } from '../../components/DetailsReview';

const GetAccountsWithRole = () => {
	const { t } = useTranslation(['global', 'roles', 'stableCoinCreation', 'externalTokenInfo']);
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	const { control, getValues, setError } = useForm({
		mode: 'onChange',
	});

	const network = useSelector(SELECTED_NETWORK);
	const hashScanURL = `https://hashscan.io/${network}`;

	useFieldArray({
		control,
		name: 'rol',
	});

	const [errorTransactionUrl, setErrorTransactionUrl] = useState();

	const [accountsWithRoles, setAccountsWithRoles] = useState<String[]>([]);

	const details: Detail[] = [];
	accountsWithRoles.forEach((accountWithRole) => {
		details.push({
			label: t('account'),
			value: accountWithRole,
			copyButton: true,
			hashScanURL: `${hashScanURL}/account/${accountWithRole}`,
		});
	});

	const supplyTypes = [
		{
			value: StableCoinRole.DEFAULT_ADMIN_ROLE,
			label: t('roles:getAccountsWithRole.options.Admin'),
		},
		{
			value: StableCoinRole.CASHIN_ROLE,
			label: t('roles:getAccountsWithRole.options.CashIn'),
		},
		{
			value: StableCoinRole.FREEZE_ROLE,
			label: t('roles:getAccountsWithRole.options.Freeze'),
		},
		{
			value: StableCoinRole.PAUSE_ROLE,
			label: t('roles:getAccountsWithRole.options.Pause'),
		},
		{
			value: StableCoinRole.BURN_ROLE,
			label: t('roles:getAccountsWithRole.options.Burn'),
		},
		{
			value: StableCoinRole.RESCUE_ROLE,
			label: t('roles:getAccountsWithRole.options.Rescue'),
		},
		{
			value: StableCoinRole.WIPE_ROLE,
			label: t('roles:getAccountsWithRole.options.Wipe'),
		},
		{
			value: StableCoinRole.DELETE_ROLE,
			label: t('roles:getAccountsWithRole.options.Delete'),
		},
		{
			value: StableCoinRole.KYC_ROLE,
			label: t('roles:getAccountsWithRole.options.Kyc'),
		},
	];
	const selectorStyle = {
		wrapper: {
			border: '1px',
			borderColor: 'brand.black',
			borderRadius: '8px',
			height: 'min',
		},
		menuList: {
			maxH: '220px',
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 2,
			zIndex: 99,
		},
		valueSelected: {
			fontSize: '14px',
			fontWeight: '500',
		},
	};

	const handleGetAccountsWithRole: ModalsHandlerActionsProps['onConfirm'] = async ({
		onSuccess,
		onError,
		onLoading,
	}) => {
		onLoading();
		const values = getValues();

		console.log(values);
		const request = new GetAccountsWithRolesRequest({
			roleId: values.supplyType.value,
			tokenId: selectedStableCoin!.tokenId!.toString(),
		});

		console.log(request);
		try {
			const response: any = await Promise.race([
				SDKService.getAccountsWithRole(request),
				new Promise((resolve, reject) => {
					setTimeout(() => {
						reject(new Error("Account's roles couldn't be obtained in a reasonable time."));
					}, 10000);
				}),
			]).catch((e) => {
				console.log(e.message);
				onOpenModalAction();
				throw e;
			});
			setAccountsWithRoles(response);
			onSuccess();
		} catch (error: any) {
			console.log(error);
			// is MultiTargetsInvalid

			setErrorTransactionUrl(error.transactionUrl);
			onError();
		}
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
							{t(`roles:getAccountsWithRole.title`, { role: '' })}
						</Heading>

						<SelectController
							control={control}
							name={'supplyType'}
							options={supplyTypes}
							label={t('roles:getAccountsWithRole.chooseRole')}
							placeholder={t('stableCoinCreation:optionalDetails.typeSupplyPlaceholder')}
							overrideStyles={selectorStyle}
							addonLeft={true}
							variant='unstyled'
							defaultValue={'0'}
						/>

						<DetailsReview
							title={t(`roles:getAccountsWithRole.subtitle`, {
								role: getValues()?.supplyType?.label,
							})}
							titleProps={{ fontWeight: 'bold' }}
							contentProps={{ justifyContent: 'space-between', gap: 4 }}
							details={details}
						/>
					</>
				}
				onConfirm={handleSubmit}
				confirmBtnProps={{
					isDisabled: false,
				}}
			/>

			<ModalsHandler
				errorNotificationTitle={t(`roles:getAccountsWithRole.modal.title`)}
				// @ts-ignore-next-line
				errorNotificationDescription={t(`roles:revokeRole.modalErrorDescription`)}
				errorTransactionUrl={errorTransactionUrl}
				// @ts-ignore-next-line
				warningNotificationDescription={t(`roles:revokeRole.modalErrorDescription`)}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t(`roles:getAccountsWithRole.modal.title`) + ' ' + getValues()?.supplyType?.label,
					confirmButtonLabel: t(`roles:getAccountsWithRole.modalActionConfirmButton`),
					onConfirm: handleGetAccountsWithRole,
				}}
				ModalActionChildren={<></>}
				successNotificationTitle={
					t(`roles:getAccountsWithRole.modal.title`) + ' ' + getValues()?.supplyType?.label
				}
			/>
		</>
	);
};

export default GetAccountsWithRole;
