import type { ReactNode } from 'react';
import type { ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { Button, Flex, Stack, Heading, SimpleGrid } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RouterManager } from '../../Router/RouterManager';
import BaseContainer from '../../components/BaseContainer';
import DetailsReview from '../../components/DetailsReview';
import { SELECTED_WALLET_COIN, walletActions } from '../../store/slices/walletSlice';
import { formatAmountWithDecimals } from '../../utils/inputHelper';
import SDKService from '../../services/SDKService';
import type { AppDispatch } from '../../store/store';
import { useEffect } from 'react';

export interface OperationLayoutProps {
	LeftContent: ReactNode;
	onConfirm: () => void;
	confirmBtnProps?: ChakraButtonProps;
}

const OperationLayout = ({ LeftContent, onConfirm, confirmBtnProps }: OperationLayoutProps) => {
	const navigate = useNavigate();
	const { t } = useTranslation(['operations', 'global']);
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const dispatch = useDispatch<AppDispatch>();
	const unknown = t('global:common.unknown');

	const handleGoBack = () => {
		RouterManager.goBack(navigate);
	};

	useEffect(() => {
		handleRefreshCoinInfo()
	},[])
	

	const handleRefreshCoinInfo = async () => {
		const stableCoinDetails = await SDKService.getStableCoinDetails({
			id: selectedStableCoin?.tokenId || '',
		});
		console.log('cojo los detalles',stableCoinDetails)
		dispatch(
			walletActions.setSelectedStableCoin({
				tokenId: stableCoinDetails?.tokenId,
				initialSupply: Number(stableCoinDetails?.initialSupply),
				totalSupply: Number(stableCoinDetails?.totalSupply),
				maxSupply: Number(stableCoinDetails?.maxSupply),
				name: stableCoinDetails?.name,
				symbol: stableCoinDetails?.symbol,
				decimals: stableCoinDetails?.decimals,
				id: stableCoinDetails?.tokenId,
				treasuryId: stableCoinDetails?.treasuryId,
				autoRenewAccount: stableCoinDetails?.autoRenewAccount,
				memo: stableCoinDetails?.memo,
				adminKey:
					stableCoinDetails?.adminKey && JSON.parse(JSON.stringify(stableCoinDetails.adminKey)),
				kycKey: stableCoinDetails?.kycKey && JSON.parse(JSON.stringify(stableCoinDetails.kycKey)),
				freezeKey:
					stableCoinDetails?.freezeKey && JSON.parse(JSON.stringify(stableCoinDetails.freezeKey)),
				wipeKey:
					stableCoinDetails?.wipeKey && JSON.parse(JSON.stringify(stableCoinDetails.wipeKey)),
				supplyKey:
					stableCoinDetails?.supplyKey && JSON.parse(JSON.stringify(stableCoinDetails.supplyKey)),
			}),
		);
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
								details={[
									{
										label: t('operations:details.initialSupply'),
										value: selectedStableCoin?.initialSupply
											? formatAmountWithDecimals({
													amount: Number(selectedStableCoin?.initialSupply),
													decimals: selectedStableCoin?.decimals || 0,
											  })
											: unknown,
									},
									{
										label: t('operations:details.totalSupply'),
										value: selectedStableCoin?.totalSupply
											? formatAmountWithDecimals({
													amount: Number(selectedStableCoin?.totalSupply),
													decimals: selectedStableCoin?.decimals || 0,
											  })
											: unknown,
									},
									{
										label: t('operations:details.supplyType'),
										// @ts-ignore Property 'supplyType' does not exist on type 'IStableCoinDetail'.
										value:
											selectedStableCoin?.maxSupply?.toString() === '0'
												? t('operations:details.infinite')
												: t('operations:details.finite'),
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
