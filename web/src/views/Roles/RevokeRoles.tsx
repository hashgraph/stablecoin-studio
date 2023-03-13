import { Heading, Text, CheckboxGroup, Grid, useDisclosure, Flex, Button } from '@chakra-ui/react';
import type { StableCoinRole } from 'hedera-stable-coin-sdk';
import { RevokeMultiRolesRequest, RevokeRoleRequest } from 'hedera-stable-coin-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { Detail } from '../../components/DetailsReview';
import DetailsReview from '../../components/DetailsReview';
import { CheckboxController } from '../../components/Form/CheckboxController';
import InputController from '../../components/Form/InputController';
import Icon from '../../components/Icon';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';
import ModalsHandler from '../../components/ModalsHandler';
import { propertyNotFound } from '../../constant';
import { SDKService } from '../../services/SDKService';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import { handleRequestValidation } from '../../utils/validationsHelper';
import OperationLayout from '../Operations/OperationLayout';

const RevokeRoleOperation = ({
	filteredCapabilities,
}: {
	filteredCapabilities: { id: string; value: StableCoinRole; label: string }[];
}) => {
	const { t } = useTranslation(['global', 'roles', 'stableCoinCreation', 'externalTokenInfo']);
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const { control, getValues, watch, formState } = useForm({
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
		return accounts.some((item: any) => {
			return item.accountId === '';
		});
	};

	const handleRevokeRoles: ModalsHandlerActionsProps['onConfirm'] = async ({
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
			console.log(item);
			return item === true;
		});
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
								{filteredCapabilities.map((item, index) => {
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
				onConfirm={onOpenModalAction}
				confirmBtnProps={{ isDisabled: (isNotValidAccount() || !isRoleSelected() ) && !formState.isValid }}
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
