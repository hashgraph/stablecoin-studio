import { Button, Flex, Image, Link, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import HEDERA_LOGO from '../assets/svg/hedera-hbar-logo.svg';

const ModalHashpack = () => {
	const { t } = useTranslation('global');

	return (
		<Flex
			bgColor='white'
			w='500px'
			h='272px'
			borderRadius='8px'
			flexDirection='column'
			justifyContent='center'
			alignItems='center'
		>
			<Image src={HEDERA_LOGO} alt='Hedera logo' w='60px' h='60px' mb='24px' />
			<Text
				fontSize='14px'
				fontWeight='700'
				lineHeight='16px'
				align='center'
				color='#323232'
				mb='8px'
			>
				{t('hashpack-no-installed.title')}
			</Text>
			<Text
				fontSize='12px'
				fontWeight='400'
				lineHeight='16px'
				align='center'
				color='#666666'
				mb='24px'
			>
				{t('hashpack-no-installed.description')}
			</Text>
			<Link href='https://www.hashpack.app/download' isExternal _hover={{ textDecoration: 'none' }}>
				<Button variant='primary'>{t('hashpack-no-installed.button')}</Button>
			</Link>
		</Flex>
	);
};

export default ModalHashpack;
