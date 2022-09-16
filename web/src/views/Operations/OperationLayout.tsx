import { ReactNode } from 'react';
import {
	Button,
	ButtonProps as ChakraButtonProps,
	Flex,
	SimpleGrid,
	Stack,
} from '@chakra-ui/react';
import { RouterManager } from '../../Router/RouterManager';
import { useNavigate } from 'react-router-dom';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';

export interface OperationLayoutProps {
	LeftContent: ReactNode;
	RightContent: ReactNode;
	onConfirm: () => void;
	confirmBtnProps?: ChakraButtonProps;
}
const OperationLayout = ({
	LeftContent,
	RightContent,
	onConfirm,
	confirmBtnProps,
}: OperationLayoutProps) => {
	const navigate = useNavigate();
	const { t } = useTranslation('global');

	const handleGoBack = () => {
		RouterManager.to(navigate, NamedRoutes.Operations);
	};

	return (
		<BaseContainer title={t('operations.title')}>
			<Flex
				direction='column'
				bg='brand.gray100'
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
						<Button data-testid='confirm-btn' onClick={onConfirm} {...confirmBtnProps}>
							{t('common.accept')}
						</Button>
					</Stack>
				</Flex>
			</Flex>
		</BaseContainer>
	);
};

export default OperationLayout;
