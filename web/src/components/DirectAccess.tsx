import { Flex, Text, FlexProps } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { NamedRoutes } from '../Router/NamedRoutes';
import { RouterManager } from '../Router/RouterManager';
import Icon from './Icon';

interface DirectAccessProps extends FlexProps {
	title: string;
	icon: string;
	route: NamedRoutes;
}

const DirectAccess = ({ title, icon, route, ...props }: DirectAccessProps) => {
	const navigate = useNavigate();

	const handleNavigate = () => {
		RouterManager.to(navigate, route);
	};

	return (
		<Flex
			data-testid='direct-access-container'
			w='120px'
			h='136px'
			borderRadius='16px'
			gap='16px'
			bgColor='brand.white'
			borderWidth='1px'
			borderColor='brand.gray300'
			flexDirection='column'
			justifyContent='center'
			alignItems='center'
			as='button'
			onClick={handleNavigate}
			_hover={{
				cursor: 'pointer',
				transform: 'scale(1.03)',
			}}
			{...props}
		>
			<Flex
				h='48px'
				w='48px'
				borderRadius='50%'
				bgColor='light.purple4'
				justifyContent='center'
				alignItems='center'
			>
				<Icon
					data-testid={`direct-access-${icon}`}
					name={icon}
					fontSize='28px'
					color='light.purple3'
				/>
			</Flex>
			<Text
				data-testid={`direct-access-${title}`}
				fontSize='14px'
				fontWeight='700'
				lineHeight='16px'
			>
				{title}
			</Text>
		</Flex>
	);
};

export default DirectAccess;
