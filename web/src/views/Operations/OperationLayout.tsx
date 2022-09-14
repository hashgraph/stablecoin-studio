import { ReactNode } from 'react';
import { Button, Flex, Heading, SimpleGrid, Stack } from '@chakra-ui/react';
import { RouterManager } from '../../Router/RouterManager';
import { useNavigate } from 'react-router-dom';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { useTranslation } from 'react-i18next';

export interface OperationLayoutProps {
	LeftContent: ReactNode;
	RightContent: ReactNode;
	onConfirm: () => void;
}
const OperationLayout = ({ LeftContent, RightContent, onConfirm }: OperationLayoutProps) => {
	const navigate = useNavigate();
	const { t } = useTranslation('global');

	const handleGoBack = () => {
		RouterManager.to(navigate, NamedRoutes.Operations);
	};

	return (
		<Stack>
			<Heading fontSize='28px' fontWeight='500' color='brand.secondary'>
				{t('operations.title')}
			</Heading>
			<Flex
				direction='column'
				bg='brand.gray6'
				px={{ base: 4, lg: 14 }}
				pt={{ base: 4, lg: 14 }}
				pb={6}
			>
				<SimpleGrid columns={{ lg: 2 }} gap={{ base: 4, lg: 20 }}>
					<Stack>{LeftContent}</Stack>
					<Stack bg='brand.white' p={6}>
						{RightContent}
					</Stack>
				</SimpleGrid>
				<Flex justify='flex-end' pt={6}>
					<Stack direction='row' spacing={6}>
						<Button data-testid='cancel-btn' onClick={handleGoBack} variant='secondary'>
							{t('common.goBack')}
						</Button>
						<Button data-testid='confirm-btn' onClick={onConfirm}>
							{t('common.accept')}
						</Button>
					</Stack>
				</Flex>
			</Flex>
		</Stack>
	);
};

export default OperationLayout;
