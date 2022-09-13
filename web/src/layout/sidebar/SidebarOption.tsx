import { Flex, Text } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { RouterManager } from '../../Router/RouterManager';
import { NamedRoutes } from '../../Router/NamedRoutes';

interface SidebarOptionProps {
	icon: string;
	route: NamedRoutes;
	title: string;
}

const SidebarOption = ({ icon, title, route }: SidebarOptionProps) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const isActive = pathname.includes(route);

	const handleNavigate = () => {
		RouterManager.to(navigate, route);
	};

	return (
		<Flex
			data-testid={`sidebar-option-${icon}`}
			h='48px'
			w='100%'
			gap='10px'
			alignItems='center'
			borderRadius='12px'
			color='gray.600'
			bgColor={isActive ? 'light.purple' : ''}
			pl='15px'
			_hover={{
				cursor: 'pointer',
				bgColor: 'light.purple',
			}}
			onClick={handleNavigate}
		>
			<Icon name={icon} fontSize='22px' />
			<Text data-testid='sidebar-option-title' fontSize='14px' fontWeight='700'>
				{title}
			</Text>
		</Flex>
	);
};

export default SidebarOption;
