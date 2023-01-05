import { Button, Flex, Image, Text, useDisclosure, Link, VStack } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import ModalWalletConnect from '../components/ModalWalletConnect';
import { HAS_WALLET_EXTENSION } from '../store/slices/walletSlice';
import HEDERA_LOGO from '../assets/svg/hedera-hbar-logo.svg';
import { useTranslation } from 'react-i18next';
import METAMASK_LOGO from '../assets/svg/MetaMask_Fox.svg';
import HEDERA_LOGO_PNG from '../assets/png/hashpackLogo.png';
import { useMemo } from 'react';

const Login = () => {
	const { t } = useTranslation('global');

	const { isOpen, onOpen, onClose } = useDisclosure();
	const hasHashpackExtension = useSelector(HAS_WALLET_EXTENSION);
	const hasMetamaskExtension = (window as any).ethereum as boolean;

	const type = useMemo(() => {
		return hasHashpackExtension || hasMetamaskExtension ? 'no-connected' : 'no-installed';
	}, [hasHashpackExtension, hasMetamaskExtension]);

	const LinkButton = ({
		url,
		srcIcon,
		text,
		name,
	}: {
		url: string;
		srcIcon: string;
		text: string;
		name: string;
	}) => {
		return (
			<Link
				w='full'
				data-testid={`modal-hashpack-link-${name}`}
				href={url}
				isExternal
				_hover={{ textDecoration: 'none' }}
			>
				<Button
					data-testid={`modal-hashpack-button-${name}`}
					w={'full'}
					bgColor={'black'}
					color='white'
					gap={4}
					leftIcon={<Image src={srcIcon} w={8} />}
					_hover={{ fontWeight: '700px', bgColor: 'blackAlpha.800' }}
				>
					<Text>{text}</Text>
				</Button>
			</Link>
		);
	};

	return (
		<Flex
			data-testid='login_container'
			alignItems='center'
			position='absolute'
			w='100%'
			zIndex={1000}
			justifyContent='center'
			flexDirection='column'
			bgColor='background'
			h='100vh'
		>
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
					{t(`hashpack-${type}.title`)}
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
					{t(`hashpack-${type}.description`)}
				</Text>
				{type === 'no-installed' ? (
					<VStack spacing={2} w='300px'>
						<LinkButton
							url='https://www.hashpack.app/download'
							srcIcon={HEDERA_LOGO_PNG}
							text={t('hashpack-no-installed.button')}
							name='hashpack'
						/>
						<LinkButton
							url='https://metamask.io/download/'
							srcIcon={METAMASK_LOGO}
							text={t('hashpack-no-installed.metamaskButton')}
							name='metamask'
						/>
					</VStack>
				) : (
					<>
						<Button data-testid='modal-hashpack-button' variant='primary' onClick={onOpen}>
							{t('hashpack-no-connected.button')}
						</Button>
						<ModalWalletConnect isOpen={isOpen} onClose={onClose} />
					</>
				)}
			</Flex>
		</Flex>
	);
};

export default Login;
