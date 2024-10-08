import {
	Alert,
	AlertDescription,
	AlertIcon,
	Box,
	CloseButton,
	Flex,
	HStack,
	Image,
	Link,
	Tooltip,
} from '@chakra-ui/react';
import { Network, SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LOGO_HEDERA from '../../assets/svg/hedera-hbar-logo.svg';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { RouterManager } from '../../Router/RouterManager';
import {
	LAST_WALLET_SELECTED,
	SELECTED_NETWORK_RECOGNIZED,
	SELECTED_WALLET_PAIRED_ACCOUNT_RECOGNIZED,
} from '../../store/walletSelectors';
import CoinDropdown from './CoinDropdown';
import CollapsibleButton from './components/CollapsibleButton';
import TopbarRight from './TopbarRight';

const Topbar = () => {
	const { t } = useTranslation('global');
	const navigate = useNavigate();
	const [haveFactory, setHaveFactory] = useState<boolean>(true);
	const accountRecognized = useSelector(SELECTED_WALLET_PAIRED_ACCOUNT_RECOGNIZED);
	const selectedWallet = useSelector(LAST_WALLET_SELECTED);
	const [isAccountRecognized, setIsAccountRecognized] = useState<boolean>(
		accountRecognized ?? true,
	);
	const networkRecognized = useSelector(SELECTED_NETWORK_RECOGNIZED);
	const [isNetworkRecognized, setIsNetworkRecognized] = useState<boolean>(
		networkRecognized ?? true,
	);

	useEffect(() => {
		setIsAccountRecognized(accountRecognized ?? false);
		setIsNetworkRecognized(networkRecognized ?? false);
	}, [accountRecognized, networkRecognized]);

	const handleNavigateSC = async () => {
		const factoryId = await Network.getFactoryAddress();

		if (factoryId !== undefined && factoryId !== '') {
			RouterManager.to(navigate, NamedRoutes.StableCoinCreation);
		} else {
			setHaveFactory(false);
		}
	};

	return (
		<>
			<Flex
				data-testid='topbar'
				w='100%'
				h='64px'
				boxShadow='down-black'
				bgColor='brand.white'
				color='brand.gray2'
				alignItems='center'
				position='relative'
				zIndex='85'
			>
				<Box minW='80px' w='80px' textAlign='center' ml='64px' mr='64px'>
					<Image data-testid='topbar-logo' src={LOGO_HEDERA} w='40px' h='40px' margin='auto' />
				</Box>
				<Box borderRight='2px solid' borderRightColor='light.primary' w='1px' h='30px' />
				<Flex w='100%' h='100%' justifyContent='space-between' alignItems='center' pl={6} pr={10}>
					<Flex gap={5} alignItems='center'>
						<CoinDropdown />
						<HStack>
							{selectedWallet === SupportedWallets.MULTISIG ? (
								<Tooltip label='Stable coin creation is not supported by MultiSig'>
									<div>
										<CollapsibleButton
											nameIcon='Plus'
											text={t('topbar.createSC')}
											disabled={true}
										/>
									</div>
								</Tooltip>
							) : (
								<CollapsibleButton
									nameIcon='Plus'
									text={t('topbar.createSC')}
									onClick={handleNavigateSC}
								/>
							)}
						</HStack>
					</Flex>
					<TopbarRight />
				</Flex>
			</Flex>
			{!haveFactory && (
				<Alert status='warning' justifyContent='center'>
					<Flex width='container.lg'>
						<AlertIcon />
						<Box>
							<AlertDescription>
								<p>{t('topbar.alertNoEnv')}</p>
								<Link
									textDecoration='underline'
									isExternal={true}
									href='https://github.com/hashgraph/stablecoin-studio/tree/main/web#env-vars'
								>
									{t('topbar.alertNoEnvLink')}
								</Link>
							</AlertDescription>
						</Box>
					</Flex>
					<CloseButton
						alignSelf='flex-start'
						position='relative'
						right={-1}
						top={-1}
						onClick={() => setHaveFactory(true)}
					/>
				</Alert>
			)}
			{!isNetworkRecognized && (
				<Alert status='warning' justifyContent='center'>
					<Flex width='container.lg'>
						<AlertIcon />
						<Box>
							<AlertDescription>
								<p>{t('topbar.alertNotHederaNetwork')}</p>
							</AlertDescription>
						</Box>
					</Flex>
					<CloseButton
						data-testid='isNotNetworkRecognized'
						alignSelf='flex-start'
						position='relative'
						right={-1}
						top={-1}
						onClick={() => setIsNetworkRecognized(true)}
					/>
				</Alert>
			)}
			{networkRecognized && !isAccountRecognized && (
				<Alert status='warning' justifyContent='center'>
					<Flex width='container.lg'>
						<AlertIcon />
						<Box>
							<AlertDescription>
								<p>{t('topbar.alertNotHederaAccount')}</p>
							</AlertDescription>
						</Box>
					</Flex>
					<CloseButton
						data-testid='isNotAccountRecognized'
						alignSelf='flex-start'
						position='relative'
						right={-1}
						top={-1}
						onClick={() => setIsAccountRecognized(true)}
					/>
				</Alert>
			)}
		</>
	);
};

export default Topbar;
