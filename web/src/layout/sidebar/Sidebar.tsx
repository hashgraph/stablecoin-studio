import { Box, Flex } from '@chakra-ui/react';
import SidebarOption from './SidebarOption';

const Sidebar = () => {
	const options = [
		{
			icon: 'Coin',
			title: 'Operations',
			route: '/operations',
		},
		{
			icon: 'Users',
			title: 'Role management',
			route: '/roles',
		},
		{
			icon: 'Gear',
			title: 'Stable coin details',
			route: '/details',
		},
	];

	return (
		<Box bgColor='brand.white' minW='208px' p='32px 12px'>
			<Flex flexDirection='column' alignItems='center' gap={3}>
				{options.map((option) => {
					const { icon, title, route } = option;
					return <SidebarOption icon={icon} title={title} key={icon} route={route} />;
				})}
			</Flex>
		</Box>
	);
};

export default Sidebar;
