import { Box, Flex } from '@chakra-ui/react';
import { NamedRoutes } from '../../Router/NamedRoutes';
import SidebarOption from './SidebarOption';

const Sidebar = () => {
	const options = [
		{
			icon: 'Coin',
			title: 'Operations',
			route: NamedRoutes.Operations,
		},
		{
			icon: 'Users',
			title: 'Role management',
			route: NamedRoutes.Roles,
		},
		{
			icon: 'Gear',
			title: 'Stable coin details',
			route: NamedRoutes.Details,
		},
	];

	return (
		<Box bgColor='brand.white' minW='208px' p='32px 12px'>
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
