import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import type { ContractId, PublicKey, StableCoinMemo } from 'hedera-stable-coin-sdk';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import DetailsReview from '../../components/DetailsReview';
import Icon from '../../components/Icon';
import TooltipCopy from '../../components/TooltipCopy';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import { formatAmountWithDecimals, formatShortKey } from '../../utils/inputHelper';

const StableCoinDetails = () => {
	const { t, i18n } = useTranslation('stableCoinDetails');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

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

	const renderKeys = ({ key }: { key: ContractId | PublicKey | undefined }) => {
		if (!key) return t('none');
		if ('id' in key) return t('smartContract');
		if (key.key === 'same as user')
			// TODO: check current public key
			return t('currentUser');

		return (
			<Flex
				gap={2}
				fontSize='14px'
				fontWeight={500}
				lineHeight='17px'
				color='brand.gray'
				wordBreak='break-all'
			>
				<Tooltip label={key.key} bgColor='black' borderRadius='5px'>
					<Text>{t('otherKey', { key: formatShortKey({ key: key.key }) })}</Text>
				</Tooltip>
				<TooltipCopy valueToCopy={key.key}>
					<Icon name='Copy' />
				</TooltipCopy>
			</Flex>
		);
	};

	return (
		<BaseContainer title={t('title')}>
			<Flex
				justify='center'
				p={{ base: 4, md: '128px' }}
				pt={{ base: 4, lg: 14 }}
				overflowY='scroll'
			>
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
									value: selectedStableCoin?.initialSupply
										? formatAmountWithDecimals({
												amount: Number(selectedStableCoin.initialSupply),
												decimals: selectedStableCoin.decimals || 0,
												language: i18n.language,
										  })
										: 0,
								},
								{
									label: t('totalSupply'),
									value: selectedStableCoin?.totalSupply
										? formatAmountWithDecimals({
												amount: Number(selectedStableCoin.totalSupply),
												decimals: selectedStableCoin.decimals || 0,
												language: i18n.language,
										  })
										: 0,
								},
								{
									label: t('maxSupply'),
									value: selectedStableCoin?.maxSupply
										? formatAmountWithDecimals({
												amount: Number(selectedStableCoin.maxSupply),
												decimals: selectedStableCoin.decimals || 0,
												language: i18n.language,
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
									value: renderKeys({
										key: selectedStableCoin?.adminKey as any,
									}),
								},
								{
									label: t('kycKey'),
									value: renderKeys({
										key: selectedStableCoin?.kycKey as any,
									}),
								},
								{
									label: t('freezeKey'),
									value: renderKeys({
										key: selectedStableCoin?.freezeKey as any,
									}),
								},
								{
									label: t('wipeKey'),
									value: renderKeys({
										key: selectedStableCoin?.wipeKey as any,
									}),
								},
								{
									label: t('supplyKey'),
									value: renderKeys({
										key: selectedStableCoin?.supplyKey as any,
									}),
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
