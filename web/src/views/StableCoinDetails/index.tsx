import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';
import DetailsReview from '../../components/DetailsReview';
import Icon from '../../components/Icon';
import TooltipCopy from '../../components/TooltipCopy';
import { SELECTED_WALLET_ACCOUNT_INFO, SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import { formatShortKey } from '../../utils/inputHelper';
import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import AwaitingWalletSignature from '../../components/AwaitingWalletSignature';

const StableCoinDetails = () => {
	const { t } = useTranslation('stableCoinDetails');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

	const isLoading = useRefreshCoinInfo();

	const renderKeys = ({ key }: { key: any }) => {
		if (!key) return t('none').toUpperCase();
		if ('value' in key) return t('smartContract').toUpperCase();
		if (key.key === account.publicKey?.toString()) return t('currentUser').toUpperCase();
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
					<Text>{formatShortKey({ key: key.key })}</Text>
				</Tooltip>
				<TooltipCopy valueToCopy={key.key}>
					<Icon name='Copy' />
				</TooltipCopy>
			</Flex>
		);
	};

	let details = [
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
			value: selectedStableCoin?.initialSupply?.toString() ?? '0',
		},
		{
			label: t('totalSupply'),
			value: selectedStableCoin?.totalSupply?.toString() ?? '0',
		},
		{
			label: t('maxSupply'),
			value:
				selectedStableCoin?.maxSupply && !selectedStableCoin?.maxSupply.isZero
					? selectedStableCoin?.maxSupply
					: 'INFINITE',
		},
		{
			label: t('treasury'),
			value: selectedStableCoin?.treasury,
			copyButton: true,
		},
		{
			label: t('autoRenewAccount'),
			value: selectedStableCoin?.autoRenewAccount,
			copyButton: true,
		},
		{
			label: t('proxyAddress'),
			value: selectedStableCoin?.proxyAddress,
		},
		{
			label: t('paused'),
			value: selectedStableCoin?.paused?.toString().toUpperCase(),
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
		{
			label: t('pauseKey'),
			value: renderKeys({
				key: selectedStableCoin?.pauseKey as any,
			}),
		},
		{
			label: t('feeScheduleKey'),
			value: renderKeys({
				key: selectedStableCoin?.feeScheduleKey as any,
			}),
		},
	];

	if (selectedStableCoin?.reserveAddress) {
		details = details.concat([
			{
				label: t('reserveAddress'),
				value: selectedStableCoin?.reserveAddress,
				copyButton: true,
			},
			{
				label: t('reserveAmount'),
				value: selectedStableCoin?.reserveAmount?.toString(),
			},
		]);
	}

	return (
		<BaseContainer title={t('title')}>
			{isLoading && <AwaitingWalletSignature />}
			{selectedStableCoin && !isLoading && (
				<Flex
					justify='center'
					p={{ base: 4, md: '128px' }}
					pt={{ base: 4, lg: 14 }}
					overflowY='scroll'
				>
					<Box flex={1} maxW='563px'>
						<DetailsReview
							title={t('subtitle')}
							titleProps={{ fontWeight: 'bold' }}
							contentProps={{ justifyContent: 'space-between', gap: 4 }}
							details={details}
						/>
					</Box>
				</Flex>
			)}
		</BaseContainer>
	);
};

export default StableCoinDetails;
