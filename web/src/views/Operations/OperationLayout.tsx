import type { ReactNode } from 'react';
import type { ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { Button, Flex, Stack, Heading, SimpleGrid } from '@chakra-ui/react';
import { RouterManager } from '../../Router/RouterManager';
import { useNavigate } from 'react-router-dom';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';
import DetailsReview from '../../components/DetailsReview';

export interface OperationLayoutProps {
	LeftContent: ReactNode;
	onConfirm: () => void;
	confirmBtnProps?: ChakraButtonProps;
}
const OperationLayout = ({ LeftContent, onConfirm, confirmBtnProps }: OperationLayoutProps) => {
	const navigate = useNavigate();
	const { t } = useTranslation(['operations', 'global']);

	const handleGoBack = () => {
		RouterManager.to(navigate, NamedRoutes.Operations);
	};

	return (
		<BaseContainer title={t('global:operations.title')}>
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
						<Stack bg='brand.white' spacing={10}>
							<Heading fontSize='16px' color='brand.secondary' data-testid='details-title'>
								{t('operations:details.title')}
							</Heading>

							<DetailsReview
								title={t('operations:details.basicTitle')}
								titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
								details={[
									{
										label: t('operations:details.name'),
										value: '',
									},
									{
										label: t('operations:details.symbol'),
										value: '',
									},
									{
										label: t('operations:details.decimals'),
										value: '',
									},
								]}
							/>
							<DetailsReview
								title={t('operations:details.optionalTitle')}
								titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
								details={[
									{
										label: t('operations:details.initialSupply'),
										value: '',
									},
									{
										label: t('operations:details.totalSupply'),
										value: '',
									},
									{
										label: t('operations:details.supplyType'),
										value: '',
									},
								]}
							/>
						</Stack>
					</Stack>
				</SimpleGrid>
				<Flex justify='flex-end' pt={6}>
					<Stack direction='row' spacing={6}>
						<Button data-testid='cancel-btn' onClick={handleGoBack} variant='secondary'>
							{t('global:common.goBack')}
						</Button>
						<Button data-testid='confirm-btn' onClick={onConfirm} {...confirmBtnProps}>
							{t('global:common.accept')}
						</Button>
					</Stack>
				</Flex>
			</Flex>
		</BaseContainer>
	);
};

export default OperationLayout;
