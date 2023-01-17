
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { SupportedWallets } from 'hedera-stable-coin-sdk';
import { Wallet } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LAST_WALLET_SELECTED } from '../store/slices/walletSlice';

const AwaitingWalletSignature = () => {
	const { t } = useTranslation('global');
	const lastWallet = useSelector(LAST_WALLET_SELECTED);

	return (
		<Flex
			data-testid='no-proof-of-reserve-container'
			bgColor='white'
			w='100%'
			h='100%'
			justifyContent='center'
			alignItems='center'
			flexDirection='column'
		>
			{lastWallet === SupportedWallets.HASHPACK && (
				<>
					<Wallet
						data-testid='awaiting-wallet-signature-logo'
						size={64}
						color='#323232'
						weight='light'
					/>
					<Text
						data-testid='no-proof-of-reserve-title'
						fontSize='22px'
						fontWeight='700'
						lineHeight='16px'
						mb='16px'
					>
						{t('walletActions.awaitingSignatureTitle')}
					</Text>
				</>
			)}
			{lastWallet !== SupportedWallets.HASHPACK && (
				<>
					<Spinner
						data-testid='awaiting-wallet-signature-logo'
						w='54px'
						h='54px'
						justifyContent='center'
						alignSelf={'center'}
						color='#C6AEFA'
						thickness='4px'
					/>
					<Text
						data-testid='no-proof-of-reserve-title'
						fontSize='22px'
						fontWeight='700'
						lineHeight='16px'
						mt='16px'
						mb='16px'
					>
						{t('walletActions.loading')}
					</Text>
				</>
			)}
		</Flex>
	);
};

export default AwaitingWalletSignature;
