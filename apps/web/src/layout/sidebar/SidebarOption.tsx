/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Flex, Text } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { RouterManager } from '../../Router/RouterManager';
import type { NamedRoutes } from '../../Router/NamedRoutes';

interface SidebarOptionProps {
	icon: string;
	route: NamedRoutes;
	title: string;
	bgColor?: string;
	color?: string;
	isDisabled?: boolean;
	isHidden?: boolean;
}

const SidebarOption = ({
	icon,
	title,
	route,
	bgColor,
	color,
	isDisabled = false,
	isHidden = false,
}: SidebarOptionProps) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const isActive = pathname.includes(RouterManager.getUrl(route));

	const handleNavigate = () => {
		RouterManager.to(navigate, route);
	};

	return (
		<>
			{!isHidden && (
				<Flex
					data-testid={`sidebar-option-${icon}`}
					h='48px'
					w='100%'
					gap='10px'
					alignItems='center'
					borderRadius='12px'
					color={color || 'gray.600'}
					bgColor={bgColor || (isActive ? 'light.purple' : '')}
					pl='15px'
					_hover={{
						cursor: 'pointer',
						bgColor: bgColor ? 'light.red' : 'light.purple',
					}}
					onClick={handleNavigate}
					isDisabled={isDisabled}
					as={Button}
					variant='unstyled'
					justify='flex-start'
				>
					<Icon name={icon} fontSize='22px' />
					<Text data-testid='sidebar-option-title' fontSize='14px' fontWeight='700'>
						{title}
					</Text>
				</Flex>
			)}
		</>
	);
};

export default SidebarOption;
