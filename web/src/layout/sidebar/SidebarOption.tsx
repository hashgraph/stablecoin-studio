import { Flex, Text } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';

interface Props {
	icon: string;
	title: string;
	route: string;
}

const SidebarOption = ({ icon, title, route }: Props) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const isActive = pathname.includes(route);

	const handleNavigate = () => {
		navigate(route);
	};

	return (
		<Flex
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
			<Icon name={icon} fontSize='20px' />
			<Text fontSize='14px' fontWeight='700'>
				{title}
			</Text>
		</Flex>
	);
};

export default SidebarOption;
