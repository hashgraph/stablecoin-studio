import { Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NamedRoutes } from '../../Router/NamedRoutes';
import SidebarOption from './SidebarOption';
import { SELECTED_WALLET_COIN, LAST_WALLET_SELECTED } from '../../store/slices/walletSlice';
import { useSelector } from 'react-redux';
import { SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';

interface optionsProps {
	icon: string;
	title: string;
	route: NamedRoutes;
	isDisabled?: boolean;
	isHidden?: boolean;
}

const Sidebar = () => {
	const { t } = useTranslation('global');
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const lastWalletSelected = useSelector(LAST_WALLET_SELECTED);

	const options: optionsProps[] = [
		{
			icon: 'Coin',
			title: t('sidebar.operations'),
			route: NamedRoutes.Operations,
		},
		{
			icon: 'Users',
			title: t('sidebar.role'),
			route: NamedRoutes.Roles,
			isDisabled: selectedStableCoin?.deleted ?? false,
		},
		{
			icon: 'Fingerprint',
			title: t('sidebar.details'),
			route: NamedRoutes.StableCoinDetails,
		},
		{
			icon: 'Receipt',
			title: t('sidebar.feesManagement'),
			route: NamedRoutes.FeesManagement,
			isHidden:
				lastWalletSelected === SupportedWallets.METAMASK ||
				(selectedStableCoin && !selectedStableCoin.feeScheduleKey),
		},
		{
			icon: 'File',
			title: t('sidebar.proofOfReserve'),
			route: NamedRoutes.ProofOfReserve,
			isHidden: selectedStableCoin && !selectedStableCoin.reserveAddress,
		},
		{
			icon: 'File',
			title: t('sidebar.multiSigTransactions'),
			route: NamedRoutes.MultiSigTransactions,
		},
		{
			icon: 'GearSix',
			title: t('sidebar.settings'),
			route: NamedRoutes.Settings,
		},
	];
	const appProperties: optionsProps = {
		icon: 'ShareNetwork',
		title: t('sidebar.appSettings'),
		route: NamedRoutes.AppSettings,
	};

	if (process.env.REACT_APP_SHOW_CONFIG === 'true') {
		options.push(appProperties);
	}

	return (
		<Flex
			data-testid='sidebar'
			bgColor='brand.white'
			minW='240px'
			p='32px 12px'
			justifyContent={'space-between'}
			flexDirection='column'
		>
			<Flex flexDirection='column' alignItems='center' gap={3}>
				{options.map((option) => {
					return <SidebarOption key={option.title} {...option} />;
				})}
			</Flex>
		</Flex>
	);
};

export default Sidebar;
