import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const AwaitingWalletSignature = () => {
	const { t } = useTranslation('global');

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
		</Flex>
	);
};

export default AwaitingWalletSignature;
