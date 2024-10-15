import type { FormLabelProps as ChakraInputProps } from '@chakra-ui/react';
import { FormLabel, HStack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface InputLabelProps {
	isRequired: boolean;
	style?: ChakraInputProps;
	children: ReactNode;
}

const InputLabel = ({ isRequired, style, children }: InputLabelProps) => {
	return (
		<FormLabel {...style}>
			<HStack>
				<Text>{children}</Text>
				{isRequired && (
					<Text color='brand.red' data-testid='required'>
						*
					</Text>
				)}
			</HStack>
		</FormLabel>
	);
};

export default InputLabel;
