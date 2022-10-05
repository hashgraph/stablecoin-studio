import type { FlexProps } from '@chakra-ui/react';
import { Flex, Text, useStyleConfig } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { NamedRoutes } from '../Router/NamedRoutes';
import { RouterManager } from '../Router/RouterManager';
import Icon from './Icon';

export interface DirectAccessProps extends FlexProps {
	title: string;
	icon: string;
	route: NamedRoutes;
	variant?: string;
	isDisabled?: boolean;
}

const DirectAccess = ({
	title,
	icon,
	route,
	isDisabled = false,
	variant = 'primary',
	...props
}: DirectAccessProps) => {
	const navigate = useNavigate();

	const style = useStyleConfig('DirectAccess', { variant: isDisabled ? 'disabled' : variant });

	const handleNavigate = () => {
		RouterManager.to(navigate, route);
	};

	return (
		<Flex
			sx={style}
			data-testid={`direct-access-${route}`}
			as='button'
			onClick={handleNavigate}
			disabled={isDisabled}
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
