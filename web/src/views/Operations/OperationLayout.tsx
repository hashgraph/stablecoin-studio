import { ReactNode } from 'react';
import { Heading, SimpleGrid, Stack } from '@chakra-ui/react';

export interface OperationLayoutProps {
	LeftContent: ReactNode;
	RightContent: ReactNode;
}
const OperationLayout = ({ LeftContent, RightContent }: OperationLayoutProps) => {
	return (
		<Stack>
			<Heading>Operations</Heading>
			<SimpleGrid columns={{ lg: 2 }} bg='brand.white' p={{ base: 4, lg: 14 }}>
				<Stack>{LeftContent}</Stack>
				<Stack>{RightContent}</Stack>
			</SimpleGrid>
		</Stack>
	);
};

export default OperationLayout;
