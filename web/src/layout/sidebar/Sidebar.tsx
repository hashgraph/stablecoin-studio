import { Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NamedRoutes } from '../../Router/NamedRoutes';
import SidebarOption from './SidebarOption';
import {
	SELECTED_WALLET_COIN,
} from '../../store/slices/walletSlice';
import { useSelector } from 'react-redux';

interface optionsProps {
	icon: string;
	title: string;
	route: NamedRoutes;
	isDisabled?: boolean
}

const Sidebar = () => {
	const { t } = useTranslation('global');
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

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
			isDisabled: selectedStableCoin?.deleted ?? false
		},
		{
			icon: 'Gear',
			title: t('sidebar.details'),
			route: NamedRoutes.StableCoinDetails,
		},
		{
			icon: 'Gear',
			title: t('sidebar.proofOfReserve'),
			route: NamedRoutes.ProofOfReserve,
		},

	];
	
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
					const { title } = option;

					return <SidebarOption key={title} {...option} />;
				})}
			</Flex>
		</Flex>
	);
};

export default Sidebar;
