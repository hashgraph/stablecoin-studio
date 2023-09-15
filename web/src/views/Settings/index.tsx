import {
	Box,
	Heading,
	Alert,
	AlertDescription,
	AlertIcon,
	CloseButton,
	Flex,
	Link,
	Text,
	Image,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BaseContainer from '../../components/BaseContainer';
import type { DirectAccessProps } from '../../components/DirectAccess';
import GridDirectAccess from '../../components/GridDirectAccess';
import type { IAccountToken } from '../../interfaces/IAccountToken';
import type { IExternalToken } from '../../interfaces/IExternalToken';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
	IS_PROXY_OWNER,
	IS_FACTORY_PROXY_OWNER,
	IS_PENDING_OWNER,
	IS_ACCEPT_OWNER,
	IS_FACTORY_ACCEPT_OWNER,
	IS_FACTORY_PENDING_OWNER,
	SELECTED_NETWORK_FACTORY_PROXY_CONFIG,
} from '../../store/slices/walletSlice';
import { NamedRoutes } from './../../Router/NamedRoutes';
import { RouterManager } from '../../Router/RouterManager';
import SAFE_BOX from '../../assets/svg/safe-box.svg';

const Settings = () => {
	const { t } = useTranslation(['settings', 'errorPage']);
	const navigate = useNavigate();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const accountId = useSelector(SELECTED_WALLET_PAIRED_ACCOUNTID);
	const isProxyOwner = useSelector(IS_PROXY_OWNER);
	const isPendingOwner = useSelector(IS_PENDING_OWNER);
	const isAcceptOwner = useSelector(IS_ACCEPT_OWNER);
	const isFactoryProxyOwner = useSelector(IS_FACTORY_PROXY_OWNER);
	const isFactoryPendingOwner = useSelector(IS_FACTORY_PENDING_OWNER);
	const isFactoryAcceptOwner = useSelector(IS_FACTORY_ACCEPT_OWNER);
	const selectedNetworkFactoryProxyConfig = useSelector(SELECTED_NETWORK_FACTORY_PROXY_CONFIG);

	const [showAlert, setShowAlert] = useState<boolean>(false);

	const [disabledFeatures, setDisabledFeatures] = useState({
		stableCoin: false,
		factory: false,
	});

	useEffect(() => {
		getAvailableFeatures();
	}, [
		selectedStableCoin,
		isProxyOwner,
		isPendingOwner,
		isAcceptOwner,
		isFactoryProxyOwner,
		isFactoryPendingOwner,
		isFactoryAcceptOwner,
	]);

	const getAvailableFeatures = async () => {
		let isExternalToken = false;

		const tokensAccount = localStorage?.tokensAccount;
		if (tokensAccount) {
			const tokensAccountParsed = JSON.parse(tokensAccount);
			if (tokensAccountParsed) {
				const myAccount = tokensAccountParsed.find(
					(acc: IAccountToken) => acc.id === accountId?.toString(),
				);
				if (myAccount) {
					const externalToken = myAccount?.externalTokens.find(
						(coin: IExternalToken) => coin.id === selectedStableCoin?.tokenId?.toString(),
					);
					if (externalToken) {
						isExternalToken = true;
					}
				}
			}
		}

		const areDisabled = {
			stableCoin:
				!selectedStableCoin ||
				(selectedStableCoin &&
					((isExternalToken && !isProxyOwner && !isAcceptOwner) ||
						(!isProxyOwner && !isAcceptOwner))),
			factory: !isFactoryProxyOwner && !isFactoryAcceptOwner,
		};
		setDisabledFeatures(areDisabled);
	};

	if (!selectedStableCoin && disabledFeatures?.factory) {
		return (
			<Flex
				data-testid='stable-coin-not-selected-container'
				bgColor='white'
				w='100%'
				h='100%'
				justifyContent='center'
				alignItems='center'
				flexDirection='column'
			>
				<Image
					data-testid='stable-coin-not-selected-logo'
					src={SAFE_BOX}
					alt='Safe box'
					w='140px'
					h='140px'
					mb='40px'
				/>
				<Text
					data-testid='stable-coin-not-selected-title'
					fontSize='22px'
					fontWeight='700'
					lineHeight='16px'
					mb='16px'
				>
					{t('errorPage:stableCoinNotSelected.title')}
				</Text>
				<Text
					data-testid='stable-coin-not-selected-description'
					fontSize='16px'
					fontWeight='500'
					lineHeight='16px'
					maxW='500px'
					textAlign='center'
					mb='2px'
				>
					{t('errorPage:stableCoinNotSelected.description')}
				</Text>
				<Text fontSize='16px' fontWeight='500' lineHeight='16px' maxW='500px' textAlign='center'>
					{t('errorPage:stableCoinNotSelected.description2')}
				</Text>
			</Flex>
		);
	}

	const handleFactoryClick = async () => {
		if (!selectedNetworkFactoryProxyConfig) {
			setShowAlert(true);
		} else {
			RouterManager.to(navigate, NamedRoutes.FactorySettings);
		}
	};

	const directAccesses: DirectAccessProps[] = [
		{
			icon: 'CoinVertical',
			route: NamedRoutes.StableCoinSettings,
			title: t('stableCoinSettings'),
			isDisabled: disabledFeatures?.stableCoin,
		},
		{
			icon: 'Factory',
			route: NamedRoutes.FactorySettings,
			title: t('factorySettings'),
			isDisabled: disabledFeatures?.factory,
			customHandleClick: handleFactoryClick,
		},
	];

	const filteredDirectAccesses = directAccesses.filter((access) => !access.isDisabled);

	return (
		<BaseContainer title={t('title')}>
			<Box p={{ base: 4, md: '128px' }}>
				<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
					{t('settings:subtitle')}
				</Heading>
				{showAlert && (
					<Alert status='warning' justifyContent='center' mb={14}>
						<Flex width='auto'>
							<AlertIcon />
							<Box>
								<AlertDescription>
									<p>{t('settings:alertNoEnv')}</p>
									<Link
										textDecoration='underline'
										isExternal={true}
										href='https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/web#env-vars'
									>
										{t('settings:alertNoEnvLink')}
									</Link>
								</AlertDescription>
							</Box>
						</Flex>
						<CloseButton
							alignSelf='flex-start'
							position='relative'
							right={-1}
							top={-1}
							onClick={() => setShowAlert(false)}
						/>
					</Alert>
				)}
				<GridDirectAccess directAccesses={filteredDirectAccesses} />
			</Box>
		</BaseContainer>
	);
};

export default Settings;
