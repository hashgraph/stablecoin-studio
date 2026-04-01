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
	disabled?: boolean;
}

const CollapsibleButton = (props: CollapsibleButtonProps) => {
	const { nameIcon, text, onClick, buttonProps, textProps, iconColor, disabled } = props;

	const [isHover, setIsHover] = useState(false);

	const disabledStyle = {
		bgColor: 'gray.300',
		color: 'gray.500',
		cursor: 'not-allowed',
		_hover: { bgColor: 'gray.300' },
	};

	return (
		<Box onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
			<Button
				placeContent={'flex-start'}
				w={isHover && !disabled ? '140px' : '50px'}
				h='40px'
				borderRadius='8px'
				onClick={onClick}
				transition='all 500ms'
				disabled={disabled}
				{...(disabled ? disabledStyle : buttonProps)}
			>
				<Icon
					name={nameIcon}
					fontSize='20px'
					color={disabled ? 'gray.500' : iconColor || 'white'}
				/>
				{isHover && !disabled && (
					<Text transition='all 1000ms' ml={2} {...textProps}>
						{text}
					</Text>
				)}
			</Button>
		</Box>
	);
};

export default CollapsibleButton;
