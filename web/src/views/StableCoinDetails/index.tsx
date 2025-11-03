import { Box, Flex } from '@chakra-ui/react';
import { StableCoinRole } from '@hashgraph/stablecoin-npm-sdk';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import AwaitingWalletSignature from '../../components/AwaitingWalletSignature';
import BaseContainer from '../../components/BaseContainer';
import DetailsReview from '../../components/DetailsReview';
import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import {
	SELECTED_NETWORK,
	SELECTED_WALLET_ACCOUNT_INFO,
	SELECTED_WALLET_COIN,
	SELECTED_TOKEN_ROLES,
	SELECTED_WALLET_COIN_CONFIG_INFO,
	SELECTED_MIRRORS,
} from '../../store/slices/walletSlice';
import { formatShortKey } from '../../utils/inputHelper';
import { formatBytes32 } from '../../utils/format';

const StableCoinDetails = () => {
	const { t } = useTranslation('stableCoinDetails');

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const selectedStableCoinConfigInfo = useSelector(SELECTED_WALLET_COIN_CONFIG_INFO);
	const account = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
	const network = useSelector(SELECTED_NETWORK);
	const roles = useSelector(SELECTED_TOKEN_ROLES)! || [];
	const mirrors = useSelector(SELECTED_MIRRORS);

	const { isLoading, getStableCoinDetails } = useRefreshCoinInfo();

	const hashScanURL = `https://hashscan.io/${network}`;

	// State to store account IDs fetched from mirror node
	const [keyAccountIds, setKeyAccountIds] = useState<Record<string, string>>({});

	// Helper function to get mirror node URL for the current network
	const getMirrorNodeUrl = (): string | undefined => {
		const mirror = mirrors?.find((m: any) => m.Environment === network);
		return mirror?.BASE_URL;
	};

	// Fetch account ID from mirror node using public key
	const fetchAccountIdFromPublicKey = async (publicKey: string): Promise<string | undefined> => {
		const mirrorUrl = getMirrorNodeUrl();
		if (!mirrorUrl || !publicKey) return undefined;

		try {
			const response = await fetch(`${mirrorUrl}accounts?account.publickey=${publicKey}`);
			if (!response.ok) return undefined;

			const data = await response.json();
			if (data.accounts && data.accounts.length > 0) {
				return data.accounts[0].account;
			}
		} catch (error) {
			console.error('Error fetching account ID from mirror node:', error);
		}
		return undefined;
	};

	// Effect to fetch account IDs for all public keys
	useEffect(() => {
		const fetchAllAccountIds = async () => {
			const keysToFetch: Record<string, string> = {};

			// Collect all public keys that need to be converted
			const keys = [
				selectedStableCoin?.adminKey,
				selectedStableCoin?.kycKey,
				selectedStableCoin?.freezeKey,
				selectedStableCoin?.wipeKey,
				selectedStableCoin?.supplyKey,
				selectedStableCoin?.pauseKey,
				selectedStableCoin?.feeScheduleKey,
			];

			for (const key of keys) {
				if (key && 'key' in key && !('value' in key)) {
					// This is a PublicKey (EOA), not a ContractId
					const publicKey = (key as any).key;
					if (publicKey && !keyAccountIds[publicKey]) {
						const accountId = await fetchAccountIdFromPublicKey(publicKey);
						if (accountId) {
							keysToFetch[publicKey] = accountId;
						}
					}
				}
			}

			if (Object.keys(keysToFetch).length > 0) {
				setKeyAccountIds((prev) => ({ ...prev, ...keysToFetch }));
			}
		};

		if (selectedStableCoin) {
			fetchAllAccountIds();
		}
	}, [selectedStableCoin, network, mirrors]);

	const getLabelFromKey = ({ key }: { key: any }) => {
		if (!key) return t('none').toUpperCase();

		// Check if it's the current user's key by comparing public key
		if (key.key === account.publicKey?.toString()) {
			return {
				primary: account.id, // Account ID in large
				secondary: 'Current user account', // Label in small
			};
		}

		const isSmartContract = 'value' in key;
		if (isSmartContract) {
			// ContractId - already has Account ID format
			return {
				primary: key.value, // Account ID in large
				secondary: 'Hedera Token Manager smart contract', // Label in small
			};
		} else {
			// PublicKey (EOA) - try to get Account ID from mirror node
			const publicKey = key.key;
			const accountId = keyAccountIds[publicKey];

			// Check if the fetched account ID matches the current user's account ID
			if (accountId && accountId === account.id) {
				return {
					primary: accountId, // Account ID in large
					secondary: 'Current user account', // Label in small
				};
			}

			// If we have an account ID but it's not the current user, it's "Other Account"
			if (accountId) {
				return {
					primary: accountId, // Account ID in large
					secondary: 'Other account', // Label in small
				};
			}

			// Fallback to showing the short public key
			return formatShortKey({ key: publicKey });
		}
	};

	const getCopyValueFromKey = ({ key }: { key: any }): string | undefined => {
		if (!key) return undefined;

		const isSmartContract = 'value' in key;
		if (isSmartContract) {
			// ContractId - return the account ID
			return key.value;
		} else {
			// PublicKey (EOA) - return Account ID if available, otherwise public key
			const publicKey = key.key;
			const accountId = keyAccountIds[publicKey];
			return accountId || publicKey;
		}
	};

	const getKeyUrlHashscan = ({ key }: { key: any }): string | undefined => {
		if (!key) return undefined;
		const isSmartContract = 'value' in key;
		if (isSmartContract) {
			// ContractId - use Account ID for contract URL
			return `${hashScanURL}/contract/${key.value}`;
		} else {
			// PublicKey (EOA) - try to get Account ID from mirror node
			const publicKey = key.key;
			const accountId = keyAccountIds[publicKey];
			return accountId ? `${hashScanURL}/account/${accountId}` : undefined;
		}
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
			label: t('metadata'),
			value: selectedStableCoin?.metadata ?? '',
		},
		{
			label: t('treasury'),
			value: selectedStableCoin?.treasury,
			copyButton: true,
			hashScanURL: `${hashScanURL}/contract/${selectedStableCoin?.treasury}`,
		},
		{
			label: t('autoRenewAccount'),
			value: selectedStableCoin?.autoRenewAccount,
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
			label: t('configId'),
			value: formatBytes32(selectedStableCoinConfigInfo?.configId ?? ''),
		},
		{
			label: t('configVersion'),
			value: selectedStableCoinConfigInfo?.configVersion,
		},
		{
			label: t('resolverAddress'),
			value: selectedStableCoinConfigInfo?.resolverAddress,
			hashScanURL: `${hashScanURL}/contract/${selectedStableCoinConfigInfo?.resolverAddress}`,
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
			copyValue: getCopyValueFromKey({ key: selectedStableCoin?.adminKey as any }),
		},
		{
			label: t('kycKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.kycKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.kycKey as any }),
			copyButton: selectedStableCoin?.kycKey !== undefined,
			copyValue: getCopyValueFromKey({ key: selectedStableCoin?.kycKey as any }),
		},
		{
			label: t('freezeKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.freezeKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.freezeKey as any }),
			copyButton: selectedStableCoin?.freezeKey !== undefined,
			copyValue: getCopyValueFromKey({ key: selectedStableCoin?.freezeKey as any }),
		},
		{
			label: t('wipeKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.wipeKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.wipeKey as any }),
			copyButton: selectedStableCoin?.wipeKey !== undefined,
			copyValue: getCopyValueFromKey({ key: selectedStableCoin?.wipeKey as any }),
		},
		{
			label: t('supplyKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.supplyKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.supplyKey as any }),
			copyButton: selectedStableCoin?.supplyKey !== undefined,
			copyValue: getCopyValueFromKey({ key: selectedStableCoin?.supplyKey as any }),
		},
		{
			label: t('pauseKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.pauseKey as any,
			}),
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.pauseKey as any }),
			copyButton: selectedStableCoin?.pauseKey !== undefined,
			copyValue: getCopyValueFromKey({ key: selectedStableCoin?.pauseKey as any }),
		},
		{
			label: t('feeScheduleKey'),
			value: getLabelFromKey({
				key: selectedStableCoin?.feeScheduleKey as any,
			}),
			copyButton: selectedStableCoin?.feeScheduleKey !== undefined,
			hashScanURL: getKeyUrlHashscan({ key: selectedStableCoin?.feeScheduleKey as any }),
			copyValue: getCopyValueFromKey({ key: selectedStableCoin?.feeScheduleKey as any }),
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
