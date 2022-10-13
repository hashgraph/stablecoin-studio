import { Box, Flex } from '@chakra-ui/react';
import type { StableCoinMemo } from 'hedera-stable-coin-sdk';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import DetailsReview from '../../components/DetailsReview';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import { formatAmount } from '../../utils/inputHelper';

const StableCoinDetails = () => {
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const { t } = useTranslation('stableCoinDetails');

	const getKeyText = (
		key: { key: string; type: string; id: never } | { id: string; key: never; type: never },
	) => {
		if (!key) {
			return t('none');
		}
		if (key.id) {
			return t('smartContract');
		}
		if (key.key === 'same as user') {
			// TODO: check current public key
			return t('currentUser');
		} else {
			return t('otherKey', { key: key.key });
		}
	};

	const getMemoInformation = (memo: StableCoinMemo | undefined) => {
		return (
			t('proxyContract') +
			': ' +
			memo?.proxyContract +
			', ' +
			t('htsAccount') +
			': ' +
			memo?.htsAccount
		);
	};

	return (
		<BaseContainer title={t('title')}>
			<Flex justify='center' p={{ base: 4, md: '128px' }} pt={{ base: 4, lg: 14 }}>
				{selectedStableCoin && (
					<Box flex={1} maxW='563px'>
						<DetailsReview
							title={t('subtitle')}
							titleProps={{ fontWeight: 'bold' }}
							contentProps={{ justifyContent: 'space-between', gap: 4 }}
							details={[
								{
									label: t('tokenId'),
									value: selectedStableCoin?.tokenId,
								},
								{
									label: t('name'),
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
									label: t('initialSupply'),
									value: selectedStableCoin?.totalSupply
										? formatAmount({
												// TODO: Change when sdk returns initial supply info
												amount: Number(selectedStableCoin?.totalSupply),
												decimals: selectedStableCoin?.decimals,
										  })
										: 0,
								},
								{
									label: t('totalSupply'),
									value: selectedStableCoin?.totalSupply
										? formatAmount({
												amount: Number(selectedStableCoin?.totalSupply),
												decimals: selectedStableCoin?.decimals,
										  })
										: 0,
								},
								{
									label: t('maxSupply'),
									value: selectedStableCoin?.maxSupply
										? formatAmount({
												amount: Number(selectedStableCoin?.maxSupply),
												decimals: selectedStableCoin?.decimals,
										  })
										: 0,
								},
								{
									label: t('treasuryId'),
									value: selectedStableCoin?.treasuryId,
								},
								{
									label: t('memo'),
									value: getMemoInformation(selectedStableCoin?.memo),
								},
								{
									label: t('adminKey'),
									value: getKeyText(selectedStableCoin?.adminKey as any), // TODO: remove any when received correct sdk type
								},
								{
									label: t('kycKey'),
									value: getKeyText(selectedStableCoin?.kycKey as any),
								},
								{
									label: t('freezeKey'),
									value: getKeyText(selectedStableCoin?.freezeKey as any),
								},
								{
									label: t('wipeKey'),
									value: getKeyText(selectedStableCoin?.wipeKey as any),
								},
								{
									label: t('supplyKey'),
									value: getKeyText(selectedStableCoin?.supplyKey as any),
								},
							]}
						/>
					</Box>
				)}
			</Flex>
		</BaseContainer>
	);
};

export default StableCoinDetails;
