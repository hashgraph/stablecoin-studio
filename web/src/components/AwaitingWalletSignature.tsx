
import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import HederaSpinner from './HederaSpinner';

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
				<HederaSpinner />
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
