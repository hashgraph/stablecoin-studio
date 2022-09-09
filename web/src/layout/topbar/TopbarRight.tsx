import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const TopbarRight = () => {
	const { t } = useTranslation('global');

	const network = 'TESNET';
	const accountId = '0.0.123456';

	return (
		<Flex gap={5} h='30px'>
			<Flex color='brand.gray' fontSize='12px' fontWeight='400' alignItems='center'>
				<Text>{t('topbar.network')}</Text>
				<Text mr='5px'>: </Text>
				<Text>{network}</Text>
			</Flex>
			<Box borderLeft='2px solid #ECEBF1' w='1px' />
			<Flex color='brand.gray' fontSize='12px' fontWeight='400' alignItems='center'>
				<Text>{t('topbar.account')}</Text>
				<Text mr='5px'>: </Text>
				<Text>{accountId}</Text>
			</Flex>
		</Flex>
	);
};

export default TopbarRight;
