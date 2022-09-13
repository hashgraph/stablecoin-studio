import { Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NamedRoutes } from '../../Router/NamedRoutes';
import SidebarOption from './SidebarOption';

interface optionsProps {
	icon: string;
	title: string;
	route: NamedRoutes;
}

const Sidebar = () => {
	const { t } = useTranslation('global');

	const options: optionsProps[] = [
		{
			icon: 'Coin',
			// @ts-ignore
			title: t('sidebar.operations'),
			route: NamedRoutes.Operations,
		},
		{
			icon: 'Users',
			// @ts-ignore
			title: t('sidebar.role'),
			route: NamedRoutes.Roles,
		},
		{
			icon: 'Gear',
			// @ts-ignore
			title: t('sidebar.details'),
			route: NamedRoutes.Details,
		},
	];

	return (
		<Box data-testid='sidebar' bgColor='brand.white' minW='240px' p='32px 12px'>
			<Flex flexDirection='column' alignItems='center' gap={3}>
				{options.map((option) => {
					const { title } = option;

					return <SidebarOption key={title} {...option} />;
				})}
			</Flex>
		</Box>
	);
};

export default Sidebar;
