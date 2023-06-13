import { Button, Flex, Heading, Stack, SimpleGrid } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { Control, FieldValues } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { handleRequestValidation } from '../../utils/validationsHelper';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';
import type { Option } from '../../components/Form/SelectController';
import { SelectController } from '../../components/Form/SelectController';
import { RouterManager } from '../../Router/RouterManager';
import { NamedRoutes } from '../../Router/NamedRoutes';
import DetailsReview from '../../components/DetailsReview';
import { fields } from './constants';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import type {
	CheckSupplierLimitRequest,
	DecreaseSupplierAllowanceRequest,
	GrantRoleRequest,
	IncreaseSupplierAllowanceRequest,
	ResetSupplierAllowanceRequest,
	RevokeRoleRequest,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import { propertyNotFound } from '../../constant';

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
	valueSelected: {
		fontSize: '14px',
	},
	label: {
		fontSize: '14px',
	},
};

export interface RoleLayoutProps {
	accountLabel: string;
	accountPlaceholder: string;
	buttonConfirmEnable?: boolean;
	children?: ReactNode;
	control: Control<FieldValues>;
	onConfirm: () => void;
	options: Option[];
	selectorLabel: string;
	selectorPlaceholder: string;
	title: string;
	roleRequest: boolean;
	request:
		| GrantRoleRequest
		| RevokeRoleRequest
		| IncreaseSupplierAllowanceRequest
		| CheckSupplierLimitRequest
		| ResetSupplierAllowanceRequest
		| DecreaseSupplierAllowanceRequest
		| undefined;
}

const RoleLayout = (props: RoleLayoutProps) => {
	const {
		accountLabel,
		accountPlaceholder,
		buttonConfirmEnable = true,
		children,
		control,
		onConfirm,
		options,
		selectorLabel,
		selectorPlaceholder,
		title,
		roleRequest = true,
		request,
	} = props;
	const { t } = useTranslation(['global', 'roles', 'operations']);
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const navigate = useNavigate();
	const unknown = t('global:common.unknown');

	const optionalDetailsFinite = [
		{
			label: t('operations:details.initialSupply'),
			value: selectedStableCoin?.initialSupply ? selectedStableCoin.initialSupply : unknown,
		},
		{
			label: t('operations:details.totalSupply'),
			value: selectedStableCoin?.totalSupply ? selectedStableCoin.totalSupply : unknown,
		},
		{
			label: t('operations:details.maxSupply'),
			value: selectedStableCoin?.maxSupply ? selectedStableCoin.maxSupply : unknown,
		},
		{
			label: t('operations:details.supplyType'),
			// @ts-ignore Property 'supplyType' does not exist on type 'IStableCoinDetail'.
			value: selectedStableCoin?.maxSupply?.isZero()
				? t('operations:details.infinite')
				: t('operations:details.finite'),
		},
	];

	const optionalDetailsInfinite = [
		{
			label: t('operations:details.initialSupply'),
			value: selectedStableCoin?.initialSupply ? selectedStableCoin.initialSupply : unknown,
		},
		{
			label: t('operations:details.totalSupply'),
			value: selectedStableCoin?.totalSupply ? selectedStableCoin.totalSupply : unknown,
		},
		{
			label: t('operations:details.supplyType'),
			// @ts-ignore Property 'supplyType' does not exist on type 'IStableCoinDetail'.
			value: selectedStableCoin?.maxSupply?.isZero()
				? t('operations:details.infinite')
				: t('operations:details.finite'),
		},
	];

	return (
		<BaseContainer title={t('roles:title')}>
			<Flex
				direction='column'
				bg='brand.gray100'
				px={{ base: 4, lg: 14 }}
				pt={{ base: 4, lg: 14 }}
				pb={6}
			>
				<SimpleGrid columns={{ lg: 2 }} gap={{ base: 4, lg: 20 }}>
					<Stack minW={400}>
						<Heading
							data-testid='title'
							fontSize='24px'
							fontWeight='700'
							mb={10}
							lineHeight='16px'
							textAlign={'left'}
						>
							{title}
						</Heading>
						<Stack as='form' spacing={6}>
							<InputController
								rules={{
									required: t('global:validations.required') ?? propertyNotFound,
									validate: {
										validation: (value: string) => {
											if (request) {
												request.targetId = value;
												const res = handleRequestValidation(request.validate('targetId'));
												return res;
											}
										},
									},
								}}
								isRequired
								control={control}
								name={fields.account}
								label={accountLabel}
								placeholder={accountPlaceholder}
							/>

							{roleRequest && (
								<SelectController
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
									}}
									isRequired
									control={control}
									name={fields.role}
									label={selectorLabel}
									placeholder={selectorPlaceholder}
									options={options}
									addonLeft={true}
									overrideStyles={styles}
									variant='unstyled'
								/>
							)}

							{children}
						</Stack>
					</Stack>

					<Stack bg='brand.white' p={6}>
						<Stack bg='brand.white' spacing={10}>
							<Heading fontSize='16px' color='brand.secondary' data-testid='details-title'>
								{t('operations:details.title')}
							</Heading>

							<DetailsReview
								title={t('operations:details.basicTitle')}
								titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
								details={[
									{
										label: t('operations:details.name'),
										value: selectedStableCoin?.name || unknown,
									},
									{
										label: t('operations:details.symbol'),
										value: selectedStableCoin?.symbol || unknown,
									},
									{
										label: t('operations:details.decimals'),
										value: selectedStableCoin?.decimals || unknown,
									},
								]}
							/>
							<DetailsReview
								title={t('operations:details.optionalTitle')}
								titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
								details={
									selectedStableCoin?.maxSupply?.isZero()
										? optionalDetailsInfinite
										: optionalDetailsFinite
								}
							/>
						</Stack>
					</Stack>
				</SimpleGrid>
				<Flex justify='flex-end' pt={6}>
					<Stack direction='row' spacing={6}>
						<Button
							data-testid='cancel-btn'
							onClick={() => RouterManager.to(navigate, NamedRoutes.Roles)}
							variant='secondary'
						>
							{t('global:common.goBack')}
						</Button>
						<Button data-testid='confirm-btn' isDisabled={!buttonConfirmEnable} onClick={onConfirm}>
							{t('global:common.accept')}
						</Button>
					</Stack>
				</Flex>
			</Flex>
		</BaseContainer>
	);
};

export default RoleLayout;
