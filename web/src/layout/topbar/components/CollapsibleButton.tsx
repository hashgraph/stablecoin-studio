import type { ButtonProps, TextProps } from '@chakra-ui/react';
import { Box, Button, Text } from '@chakra-ui/react';
import { useState } from 'react';
import type { MouseEventHandler } from 'react';
import Icon from '../../../components/Icon';

interface CollapsibleButtonProps {
	nameIcon: string;
	text: string;
	buttonProps?: ButtonProps;
	textProps?: TextProps;
	iconColor?: string;
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

const CollapsibleButton = (props: CollapsibleButtonProps) => {
	const { nameIcon, text, onClick, buttonProps, textProps, iconColor } = props;

	const [isHover, setIsHover] = useState(false);

	return (
		<Box onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
			<Button
				placeContent={'flex-start'}
				w={isHover ? '140px' : '50px'}
				h='40px'
				borderRadius='8px'
				_hover={{ bgColor: 'dark.primary' }}
				onClick={onClick}
				transition='all 500ms'
				{...buttonProps}
			>
				<Icon name={nameIcon} fontSize='20px' color={iconColor || 'white'} />
				{isHover && (
					<Text transition='all 1000ms' ml={2} {...textProps}>
						{text}
					</Text>
				)}
			</Button>
		</Box>
	);
};

export default CollapsibleButton;
