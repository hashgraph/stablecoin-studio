import { Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import DetailsReview from '../../components/DetailsReview';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';

const StableCoinDetails = () => {
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const { t } = useTranslation('stableCoinDetails');
	console.log(selectedStableCoin?.name);

	return (
		<BaseContainer title='Stable coin details'>
			<Flex justify='center' p={{ base: 4, md: '128px' }} pt={{ base: 4, lg: 14 }}>
				{selectedStableCoin && (
					<Box flex={1} maxW='563px'>
						<DetailsReview
							title={t('title')}
							titleProps={{ fontWeight: 'bold' }}
							contentProps={{ justifyContent: 'start', gap: 4 }}
							details={[
								{
									label: t('tokenId'),
									value: selectedStableCoin?.id,
								},
								{
									label: t('tokenId'),
									value: selectedStableCoin?.name,
								},
								{
									label: t('symbol'),
									value: selectedStableCoin?.symbol,
								},
								{
									label: t('decimals'),
									value: selectedStableCoin?.decimals,
								},
								{
									label: 'totalSupply',
									value: 0,
								},
								{
									label: 'maxSupply',
									value: 0,
								},
								{
									label: 'treasuryId',
									value: selectedStableCoin?.treasury.id,
								},
								{
									label: 'memo',
									value: selectedStableCoin?.memo,
								},
								{
									label: 'freeze',
									value: 0,
								},
								// {
								// 	label: 'adminKey',
								// 	value: selectedStableCoin?.adminKey,
								// },
								// {
								// 	label: 'kyc key',
								// 	value: selectedStableCoin?.kycKey,
								// },
								// {
								// 	label: 'freeze key',
								// 	value: selectedStableCoin?.freezeKey,
								// },
								// {
								// 	label: 'wipe key',
								// 	value: selectedStableCoin?.wipeKey,
								// },
								// {
								// 	label: 'supply key',
								// 	value: selectedStableCoin?.supplyKey,
								// },
							]}
						/>
					</Box>
				)}
			</Flex>
		</BaseContainer>
	);
};

export default StableCoinDetails;
