import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export const network = 'TESNET';
export const accountId = '0.0.123456';

const TopbarRight = () => {
	const { t } = useTranslation('global');

	return (
		<Flex data-testid='topbar-right' gap={5} h='30px'>
			<Flex
				data-testid='topbar-right-network'
				color='brand.gray'
				fontSize='12px'
				fontWeight='400'
				alignItems='center'
			>
				<Text>{t('topbar.network')}</Text>
				<Text mr='5px'>: </Text>
				<Text>{network}</Text>
			</Flex>
			<Box borderLeft='2px solid' borderLeftColor='light.primary' w='1px' />
			<Flex
				data-testid='topbar-right-account'
				color='brand.gray'
				fontSize='12px'
				fontWeight='400'
				alignItems='center'
			>
				<Text>{t('topbar.account')}</Text>
				<Text mr='5px'>: </Text>
				<Text>{accountId}</Text>
			</Flex>
		</Flex>
	);
};

export default TopbarRight;
