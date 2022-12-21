import type { ReactNode } from 'react';
import type { ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { Button, Flex, Stack, Heading, SimpleGrid } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RouterManager } from '../../Router/RouterManager';
import BaseContainer from '../../components/BaseContainer';
import DetailsReview from '../../components/DetailsReview';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';

export interface OperationLayoutProps {
	LeftContent: ReactNode;
	onConfirm: () => void;
	confirmBtnProps?: ChakraButtonProps;
}

const OperationLayout = ({ LeftContent, onConfirm, confirmBtnProps }: OperationLayoutProps) => {
	const navigate = useNavigate();
	const { t } = useTranslation(['operations', 'global']);
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const unknown = t('global:common.unknown');

	const handleGoBack = () => {
		RouterManager.goBack(navigate);
	};

	useRefreshCoinInfo();
	const optionalDetailsFinite = [
		{
			label: t('operations:details.initialSupply'),
			value: selectedStableCoin?.initialSupply ? selectedStableCoin?.initialSupply : unknown,
		},
		{
			label: t('operations:details.totalSupply'),
			value: selectedStableCoin?.totalSupply ? selectedStableCoin?.totalSupply : unknown,
		},
		{
			label: t('operations:details.maxSupply'),
			value: selectedStableCoin?.maxSupply ? selectedStableCoin?.maxSupply : unknown,
		},
		{
			label: t('operations:details.supplyType'),
			// @ts-ignore Property 'supplyType' does not exist on type 'IStableCoinDetail'.
			value: selectedStableCoin?.maxSupply === '0.00'
				? t('operations:details.infinite')
				: t('operations:details.finite'),
		},
	];

	const optionalDetailsInfinite = [
		{
			label: t('operations:details.initialSupply'),
			value: selectedStableCoin?.initialSupply ? selectedStableCoin.initialSupply : unknown,
		},
		{
			label: t('operations:details.totalSupply'),
			value: selectedStableCoin?.totalSupply ? selectedStableCoin?.totalSupply : unknown,
		},
		{
			label: t('operations:details.supplyType'),
			// @ts-ignore Property 'supplyType' does not exist on type 'IStableCoinDetail'.
			value: selectedStableCoin?.maxSupply === '0.00'
				? t('operations:details.infinite')
				: t('operations:details.finite'),
		},
	];

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
										value: selectedStableCoin?.name || unknown,
									},
									{
										label: t('operations:details.symbol'),
										value: selectedStableCoin?.symbol || unknown,
									},
									{
										label: t('operations:details.decimals'),
										value: selectedStableCoin?.decimals || unknown,
									},
								]}
							/>
							<DetailsReview
								title={t('operations:details.optionalTitle')}
								titleProps={{ fontWeight: 700, color: 'brand.secondary' }}
								details={
									selectedStableCoin?.maxSupply?.isZero()
										? optionalDetailsInfinite
										: optionalDetailsFinite
								}
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
