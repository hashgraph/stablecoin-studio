import {
	Text,
	Heading,
	Stack,
	CheckboxGroup,
	Grid,
	useDisclosure,
	Flex,
	Button,
	Box,
	HStack,
} from '@chakra-ui/react';
import { GrantRoleRequest, GrantMultiRolesRequest, StableCoinRole } from 'hedera-stable-coin-sdk';
import React, { useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import type { Detail } from '../../components/DetailsReview';
import DetailsReview from '../../components/DetailsReview';
import { CheckboxController } from '../../components/Form/CheckboxController';
import InputController from '../../components/Form/InputController';
import SwitchController from '../../components/Form/SwitchController';
import type { ModalsHandlerActionsProps } from '../../components/ModalsHandler';
import ModalsHandler from '../../components/ModalsHandler';
import { propertyNotFound } from '../../constant';
import { SDKService } from '../../services/SDKService';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import { handleRequestValidation, validateDecimalsString } from '../../utils/validationsHelper';

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
	const { t } = useTranslation(['global', 'roles', 'stableCoinCreation', 'externalTokenInfo']);
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const { control, watch, getValues } = useForm({ mode: 'onChange' });
	const {
		fields: accounts,
		append,
		// remove,
	} = useFieldArray({
		control,
		name: 'rol',
	});
	const isMaxAccounts = useMemo(() => accounts.length >= 10, [accounts]);
	const [errorTransactionUrl, setErrorTransactionUrl] = useState();
	const [grantRoles, setGrantRoles] = useState<GrantRoleRequest[]>([]);

	const handleGrantRoles: ModalsHandlerActionsProps['onConfirm'] = async ({
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
	const renderSupplierQuantity = (index: number) => {
		const { decimals = 0 } = selectedStableCoin || {};
		return (
			<>
				<Box>
					<HStack>
						<Text>{t(`roles:giveRole.supplierQuantityQuestion`)}</Text>
					</HStack>
					<HStack mt='20px'>
						<Text mr='10px'>{t(`roles:giveRole.switchLabel`)}</Text>
						<SwitchController control={control} name={`rol.${index}.infinity` as const} />
					</HStack>
				</Box>
				{!watch(`rol.${index}.infinity`) && (
					<Box mt='20px'>
						<InputController
							data-testid='input-supplier-quantity'
							rules={{
								required: t(`global:validations.required`) ?? propertyNotFound,
								validate: {
									validation: (value: string) => {
										const _grantRole = grantRoles[index];
										_grantRole.amount = value;
										const res = handleRequestValidation(_grantRole.validate('amount'));
										return res;
									},
								},
							}}
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

	return (
		<>
			<BaseContainer title={t('roles:giveRole.title')}>
				<Flex
					direction='column'
					bg='brand.gray100'
					px={{ base: 4, lg: 14 }}
					pt={{ base: 4, lg: 14 }}
					pb={6}
				>
					<Stack as='form' spacing={6}>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' mb={10} lineHeight='16px'>
							{t('roles:giveRole.titleRoleSection')}
						</Heading>
						<CheckboxGroup>
							<Grid column='6' gap={{ base: 4 }} templateColumns='repeat(6, 1fr)'>
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
						{accounts &&
							accounts.map((item, i) => {
								return (
									<React.Fragment key={i}>
										<Flex>
											<InputController
												key={i}
												rules={{
													required: t('global:validations.required') ?? propertyNotFound,
													validate: {
														validation: (value: string) => {
															const _grantRole = grantRoles[i];
															_grantRole.targetId = value;
															const res = handleRequestValidation(_grantRole.validate('targetId'));
															return res;
														},
													},
												}}
												style={{
													width: '150px', // Arreglar tamaños
												}}
												isRequired
												control={control}
												name={`rol.${i}.accountId` as const}
												label={t(`roles:giveRole.accountLabel`).toString()}
												placeholder={t(`roles:giveRole.accountPlaceholder`).toString()}
											/>
											{watch('cash in') && renderSupplierQuantity(i)}
										</Flex>
									</React.Fragment>
								);
							})}
					</Stack>
					<Flex
						justify='flex-end'
						pt={6}
						pb={6}
						justifyContent='space-between'
						px={{ base: 4, lg: 14 }}
					>
						<Button variant='primary' onClick={addNewAccount} isDisabled={isMaxAccounts}>
							Añadir cuenta
						</Button>
						<Button variant='primary' onClick={onOpenModalAction}>
							Guardar cambios
						</Button>
					</Flex>
				</Flex>
			</BaseContainer>

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
