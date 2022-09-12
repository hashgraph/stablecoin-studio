import { Button, Flex, Image, Link, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import HEDERA_LOGO from '../assets/svg/hedera-hbar-logo.svg';

const ModalHashpack = () => {
	const { t } = useTranslation('global');

	return (
		<Flex
			bgColor='brand.white'
			w='500px'
			h='272px'
			borderRadius='8px'
			flexDirection='column'
			justifyContent='center'
			alignItems='center'
		>
			<Image
				data-testid='hedera-logo'
				src={HEDERA_LOGO}
				alt='Hedera logo'
				w='60px'
				h='60px'
				mb='24px'
			/>
			<Text
				data-testid='modal-hashpack-title'
				fontSize='14px'
				fontWeight='700'
				lineHeight='16px'
				align='center'
				color='brand.black'
				mb='8px'
			>
				{t('hashpack-no-installed.title')}
			</Text>
			<Text
				data-testid='modal-hashpack-description'
				fontSize='12px'
				fontWeight='400'
				lineHeight='16px'
				align='center'
				color='brand.gray'
				mb='24px'
			>
				{t('hashpack-no-installed.description')}
			</Text>
			<Link
				data-testid='modal-hashpack-link'
				href='https://www.hashpack.app/download'
				isExternal
				_hover={{ textDecoration: 'none' }}
			>
				<Button data-testid='modal-hashpack-button' variant='primary'>
					{t('hashpack-no-installed.button')}
				</Button>
			</Link>
		</Flex>
	);
};

export default ModalHashpack;
