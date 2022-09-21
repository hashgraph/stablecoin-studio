import { Button, Flex, Heading, VStack, Stack, Divider } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { Control, FieldValues } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { validateAccount } from '../../utils/validationsHelper';
import BaseContainer from '../../components/BaseContainer';
import InputController from '../../components/Form/InputController';
import { SelectController } from '../../components/Form/SelectController';
import { RouterManager } from '../../Router/RouterManager';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { fields } from './constans';

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

interface SelectorOptionProps {
	label: string;
	value: string | number;
}

export interface RoleLayoutProps {
	accountLabel: string;
	accountPlaceholder: string;
	buttonConfirmEnable?: boolean;
	children?: ReactNode;
	control: Control<FieldValues>;
	onConfirm: () => void;
	options: SelectorOptionProps[];
	selectorLabel: string;
	selectorPlaceholder: string;
	title: string;
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
	} = props;
	const { t } = useTranslation(['global', 'roles']);
	const navigate = useNavigate();

	return (
		<BaseContainer title={t('roles:title')}>
			<VStack h='full' justify={'space-between'}>
				<VStack pt='80px'>
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
									required: t('global:validations.required'),
									validate: {
										validAccount: (value: string) => {
											return validateAccount(value) || t('global:validations.invalidAccount');
										},
									},
								}}
								isRequired
								control={control}
								name={fields.account}
								label={accountLabel}
								placeholder={accountPlaceholder}
							/>
							<SelectController
								rules={{
									required: t('global:validations.required'),
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
							{children}
						</Stack>
					</Stack>
				</VStack>
				<Flex direction={'column'} justify='flex-end' w='full'>
					<Divider />
					<Stack direction='row' justify={'flex-end'} py='25px' pr='65px'>
						<Button
							data-testid='cancel-btn'
							onClick={() => RouterManager.to(navigate, NamedRoutes.Roles)}
							variant='secondary'
						>
							{t('global:common.goBack')}
						</Button>
						<Button data-testid='confirm-btn' disabled={!buttonConfirmEnable} onClick={onConfirm}>
							{t('global:common.accept')}
						</Button>
					</Stack>
				</Flex>
			</VStack>
		</BaseContainer>
	);
};

export default RoleLayout;
