import { Flex, Text, FlexProps, useStyleConfig } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { NamedRoutes } from '../Router/NamedRoutes';
import { RouterManager } from '../Router/RouterManager';
import Icon from './Icon';

interface DirectAccessProps extends FlexProps {
	title: string;
	icon: string;
	route: NamedRoutes;
	variant?: string;
}

const DirectAccess = ({ title, icon, route, variant, ...props }: DirectAccessProps) => {
	const navigate = useNavigate();

	const style = useStyleConfig('DirectAccess', { variant });

	const handleNavigate = () => {
		RouterManager.to(navigate, route);
	};

	return (
		<Flex
			sx={style}
			data-testid={`direct-access-${route}`}
			gap='16px'
			flexDirection='column'
			justifyContent='center'
			alignItems='center'
			as='button'
			onClick={handleNavigate}
			disabled={variant === 'disabled'}
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
				color='brand.gray600'
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
