import { Box, Flex } from '@chakra-ui/react';
import { StableCoinRole } from '@hashgraph-dev/stablecoin-npm-sdk';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import AwaitingWalletSignature from '../../components/AwaitingWalletSignature';
import BaseContainer from '../../components/BaseContainer';
import DetailsReview from '../../components/DetailsReview';
import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import {
	SELECTED_NETWORK,
	SELECTED_WALLET_ACCOUNT_INFO,
	SELECTED_WALLET_COIN,
	SELECTED_TOKEN_ROLES,
} from '../../store/slices/walletSlice';
import { formatShortKey } from '../../utils/inputHelper';

const StableCoinDetails = () => {
	const { t } = useTranslation('stableCoinDetails');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const account = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
	const network = useSelector(SELECTED_NETWORK);
	const roles = useSelector(SELECTED_TOKEN_ROLES)!;

	const { isLoading, getStableCoinDetails } = useRefreshCoinInfo();

	const hashScanURL = `https://hashscan.io/${network}`;

	const getLabelFromKey = ({ key }: { key: any }) => {
		if (!key) return t('none').toUpperCase();
		if (key.key === account.publicKey?.toString()) return t('currentUser').toUpperCase();

		const isSmartContract = 'value' in key;
		const text = isSmartContract
			? `${t('smartContract').toUpperCase()} - ${key.value}`
			: formatShortKey({ key: key.key });
		return text;
	};

	const getLabelFromAccount = ({ account, proxyAddress }: { account: any; proxyAddress: any }) => {
		if (!account) return t('none').toUpperCase();
		const text =
			proxyAddress && proxyAddress === account
				? `${t('smartContract').toUpperCase()} - ${account}`
				: account;
		return text;
	};

	const getKeyUrlHashscan = ({ key }: { key: any }): string | undefined => {
		if (!key) return undefined;
		const isSmartContract = 'value' in key;
		return isSmartContract
			? `${hashScanURL}/contract/${key.value}`
			: `${hashScanURL}/account/${key.key}`;
	};

	const epochTimestampToGMTString = (timestamp: number | undefined): string => {
		if (!timestamp) return '';
		const dateTime: any = timestamp.toString().substring(0, 10);
		const nanoseconds: any = timestamp.toString().substring(10);
		const myDate: Date = new Date(dateTime * 1000);
		const gmtDate: string = myDate.toUTCString();
		const pos: number = gmtDate.lastIndexOf(' ');
		return `${gmtDate.substring(0, pos)}.${nanoseconds.substring(0, 4)}${gmtDate.substring(
			pos,
			gmtDate.length,
		)}`;
	};

	let details = [
		{
			label: t('tokenId'),
			value: selectedStableCoin?.tokenId,
			copyButton: true,
			hashScanURL: `${hashScanURL}/token/${selectedStableCoin?.tokenId}`,
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
			value: getLabelFromAccount({
				account: selectedStableCoin?.treasury as any,
				proxyAddress: selectedStableCoin?.proxyAddress as any,
			}),
			copyButton: true,
			hashScanURL: `${hashScanURL}/contract/${selectedStableCoin?.treasury}`,
		},
		{
			label: t('autoRenewAccount'),
			value: getLabelFromAccount({
				account: selectedStableCoin?.autoRenewAccount as any,
				proxyAddress: selectedStableCoin?.proxyAddress as any,
			}),
			copyButton: true,
			hashScanURL: `${hashScanURL}/account/${selectedStableCoin?.autoRenewAccount}`,
		},
		{
			label: t('autoRenewPeriod'),
			value: selectedStableCoin?.autoRenewPeriod
				? `${selectedStableCoin.autoRenewPeriod / 24 / 3600} days`
				: '-',
		},
		{
			label: t('expirationTime'),
			value: selectedStableCoin?.expirationTimestamp
				? epochTimestampToGMTString(selectedStableCoin.expirationTimestamp)
				: '-',
		},
		{
			label: t('proxyAddress'),
			value: selectedStableCoin?.proxyAddress,
			hashScanURL: `${hashScanURL}/contract/${selectedStableCoin?.proxyAddress}`,
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
			value: getLabelFromKey({
				key: selectedStableCoin?.adminKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.adminKey as any }),
			copyButton: selectedStableCoin?.adminKey !== undefined,
		},
		{
			label: t('kycKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.kycKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.kycKey as any }),
			copyButton: selectedStableCoin?.kycKey !== undefined,
		},
		{
			label: t('freezeKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.freezeKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.freezeKey as any }),
			copyButton: selectedStableCoin?.freezeKey !== undefined,
		},
		{
			label: t('wipeKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.wipeKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.wipeKey as any }),
			copyButton: selectedStableCoin?.wipeKey !== undefined,
		},
		{
			label: t('supplyKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.supplyKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.supplyKey as any }),
			copyButton: selectedStableCoin?.supplyKey !== undefined,
		},
		{
			label: t('pauseKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.pauseKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.pauseKey as any }),
			copyButton: selectedStableCoin?.pauseKey !== undefined,
		},
		{
			label: t('feeScheduleKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.feeScheduleKey as any,
			}),
			copyButton: selectedStableCoin?.feeScheduleKey !== undefined,
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.feeScheduleKey as any }),
		},
	];

	if (selectedStableCoin?.reserveAddress) {
		details = details.concat([
			{
				label: t('reserveAddress'),
				value: selectedStableCoin?.reserveAddress,
				copyButton: true,
				hashScanURL: `${hashScanURL}/contract/${selectedStableCoin?.reserveAddress}`,
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
							contentProps={{ justifyContent: 'space-between', gap: 4, alignItems: 'center' }}
							details={details}
							getStableCoinDetails={getStableCoinDetails}
							isLoading={isLoading}
							editable={
								roles.includes(StableCoinRole.DEFAULT_ADMIN_ROLE) &&
								!selectedStableCoin.paused &&
								!selectedStableCoin.deleted
							}
						/>
					</Box>
				</Flex>
			)}
		</BaseContainer>
	);
};

export default StableCoinDetails;
