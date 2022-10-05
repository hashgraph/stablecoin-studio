import { Stack, Heading, Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface BaseContainerProps {
	title: string;
	children: ReactNode;
}

const BaseContainer = (props: BaseContainerProps) => {
	const { title, children } = props;
	return (
		<Stack h='full'>
			<Heading
				data-testid='base-container-heading'
				fontSize='28px'
				fontWeight={500}
				lineHeight='35px'
				color='brand.secondary'
				mb='24px'
			>
				{title}
			</Heading>
			<Box data-testid='base-container-children' bg='brand.gray100' h='full' overflowY='hidden'>
				{children}
			</Box>
		</Stack>
	);
};

export default BaseContainer;
