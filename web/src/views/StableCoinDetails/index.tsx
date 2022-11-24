import { Box, Flex, HStack, Text, Tooltip, VStack } from '@chakra-ui/react';
import type { ContractId, PublicKey, StableCoinMemo } from 'hedera-stable-coin-sdk';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import DetailsReview from '../../components/DetailsReview';
import Icon from '../../components/Icon';
import TooltipCopy from '../../components/TooltipCopy';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import { formatShortKey } from '../../utils/inputHelper';
import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';

const StableCoinDetails = () => {
	const { t } = useTranslation('stableCoinDetails');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

	useRefreshCoinInfo();

	const getMemoInformation = (memo: StableCoinMemo | undefined) => {
		return (
			<VStack
				fontSize='14px'
				fontWeight={500}
				lineHeight='17px'
				color='brand.gray'
				wordBreak='break-all'
				alignItems='flex-end'
			>
				<HStack>
					<Text>
						{t('proxyContract')} : {memo?.proxyContract}
					</Text>
					<TooltipCopy valueToCopy={memo?.proxyContract ?? ''}>
						<Icon name='Copy' />
					</TooltipCopy>
				</HStack>
				<HStack>
					<Text>
						{t('htsAccount')} : {memo?.htsAccount}
					</Text>
					<TooltipCopy valueToCopy={memo?.htsAccount ?? ''}>
						<Icon name='Copy' />
					</TooltipCopy>
				</HStack>
			</VStack>
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
									copyButton: true,
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
									value: selectedStableCoin?.initialSupply ?? 0,
								},
								{
									label: t('totalSupply'),
									value: selectedStableCoin?.totalSupply ?? 0,
								},
								{
									label: t('maxSupply'),
									value:
										selectedStableCoin?.maxSupply && selectedStableCoin?.maxSupply !== 'INFINITE'
											? selectedStableCoin?.maxSupply
											: 'INFINITE',
								},
								{
									label: t('treasuryId'),
									value: selectedStableCoin?.treasuryId,
									copyButton: true,
								},
								{
									label: t('autoRenewAccount'),
									value: selectedStableCoin?.autoRenewAccount,
									copyButton: true,
								},
								{
									label: t('memo'),
									value: getMemoInformation(selectedStableCoin?.memo),
								},
								{
									label: t('paused'),
									value: selectedStableCoin?.paused,
								},
								{
									label: t('deleted'),
									value: selectedStableCoin?.deleted?.toString().toUpperCase(),
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
