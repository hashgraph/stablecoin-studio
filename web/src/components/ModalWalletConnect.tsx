import {
	Button,
	HStack,
	Image,
	Input,
	Link,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spinner,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react';
import type { StableCoinListViewModel } from '@hashgraph/stablecoin-npm-sdk';
import {
	GetFactoryProxyConfigRequest,
	Network,
	SupportedWallets,
} from '@hashgraph/stablecoin-npm-sdk';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import BLADE_LOGO_PNG from '../assets/png/bladeLogo.png';
import MULTISIG_LOGO_PNG from '../assets/png/multisigLogo.png';
import HASHPACK_LOGO_PNG from '../assets/png/hashpackLogo.png';
import METAMASK_LOGO from '../assets/svg/MetaMask_Fox.svg';
import SDKService from '../services/SDKService';
import {
	AVAILABLE_WALLETS,
	SELECTED_MIRRORS,
	SELECTED_RPCS,
	walletActions,
} from '../store/slices/walletSlice';
import WARNING_ICON from '../assets/svg/warning.svg';
import ERROR_ICON from '../assets/svg/error.svg';
import { SelectController } from './Form/SelectController';
import { useForm } from 'react-hook-form';
import type { IMirrorRPCNode } from '../interfaces/IMirrorRPCNode';

const ModalWalletConnect = () => {
	const { t } = useTranslation('global');
	const dispatch = useDispatch();

	const { onClose } = useDisclosure();
	const styles = {
		providerStyle: {
			boxShadow: '0 0 12px 2px #E0E0E0',
			borderRadius: 10,
			p: 6,
			_hover: {
				cursor: 'pointer',
				boxShadow: '0 0 12px 6px #E0E0E0',
				transform: 'scale(1.05)',
			},
		},
	};

	const stylesNetworkOptions = {
		menuList: {
			maxH: '220px',
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 4,
		},
		wrapper: {
			border: '1px',
			borderColor: 'brand.black',
			borderRadius: '8px',
			height: 'initial',
		},
	};

	const [loading, setLoading] = useState<SupportedWallets | undefined>(undefined);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [error, setError] = useState<any>();
	const [rejected, setRejected] = useState<boolean>(false);
	const [hashpackSelected, setHashpackSelected] = useState<boolean>(false);
	const [bladeSelected, setBladeSelected] = useState<boolean>(false);
	const [multiSigSelected, setMultiSigSelected] = useState<boolean>(false);
	const availableWallets: SupportedWallets[] = useSelector(AVAILABLE_WALLETS);
	const selectedMirrors: IMirrorRPCNode[] = useSelector(SELECTED_MIRRORS);
	const selectedRPCs: IMirrorRPCNode[] = useSelector(SELECTED_RPCS);
	const [isHederaAccountIdModalOpen, setIsHederaAccountIdModalOpen] = useState(false);
	const [hederaAccountId, setHederaAccountId] = useState('');

	const { control, getValues } = useForm({
		mode: 'onChange',
	});

	const handleWalletConnect = async (wallet: SupportedWallets, network: string) => {
		if (loading) return;
		setLoading(wallet);
		dispatch(walletActions.setLastWallet(wallet));
		dispatch(walletActions.setNetwork(network));
		dispatch(walletActions.setSelectedStableCoin(undefined));
		dispatch(walletActions.setSelectedStableCoinProxyConfig(undefined));
		dispatch(walletActions.setSelectedNetworkFactoryProxyConfig(undefined));
		dispatch(walletActions.setIsProxyOwner(false));
		dispatch(walletActions.setIsPendingOwner(false));
		dispatch(walletActions.setIsAcceptOwner(false));

		try {
			let mirrorNode;
			if (selectedMirrors.length > 0) {
				const listMirrors = selectedMirrors.filter(
					(obj: IMirrorRPCNode) =>
						obj.Environment.toLocaleLowerCase() === network.toLocaleLowerCase(),
				);
				if (listMirrors) mirrorNode = listMirrors[0];
			}
			let rpcNode;
			if (selectedRPCs.length > 0) {
				const listRPCs = selectedRPCs.filter(
					(obj: IMirrorRPCNode) =>
						obj.Environment.toLocaleLowerCase() === network.toLocaleLowerCase(),
				);
				if (listRPCs) rpcNode = listRPCs[0];
			}

			const result = await SDKService.connectWallet(wallet, network, mirrorNode, rpcNode);

			const newselectedMirrors: IMirrorRPCNode[] = [];

			selectedMirrors.forEach((obj) => {
				newselectedMirrors.push(obj);
			});

			if (!mirrorNode) {
				newselectedMirrors.push(result[1] as IMirrorRPCNode);
			}

			dispatch(walletActions.setSelectedMirrors(newselectedMirrors));

			const newselectedRPCs: IMirrorRPCNode[] = [];

			selectedRPCs.forEach((obj) => {
				newselectedRPCs.push(obj);
			});

			if (!rpcNode) {
				newselectedRPCs.push(result[2] as IMirrorRPCNode);
			}

			dispatch(walletActions.setSelectedRPCs(newselectedRPCs));

			const factoryId = await Network.getFactoryAddress();

			if (factoryId) {
				const factoryProxyConfig: StableCoinListViewModel = await getFactoryProxyConfig(factoryId);
				dispatch(walletActions.setSelectedNetworkFactoryProxyConfig(factoryProxyConfig));
			}
			dispatch(walletActions.setIsFactoryProxyOwner(false));
			dispatch(walletActions.setIsFactoryPendingOwner(false));
			dispatch(walletActions.setIsFactoryAcceptOwner(false));
		} catch (error: any) {
			if ('errorCode' in error && error.errorCode === '40009') {
				setRejected(true);
			} else {
				setError(error.message);
			}
			setLoading(undefined);
		}
	};

	const getFactoryProxyConfig = async (factoryId: string): Promise<StableCoinListViewModel> => {
		const factoryProxyConfig: any = await Promise.race([
			SDKService.getFactoryProxyConfig(
				new GetFactoryProxyConfigRequest({
					factoryId,
				}),
			),
			new Promise((resolve, reject) => {
				setTimeout(() => {
					reject(new Error("Stablecoin details couldn't be obtained in a reasonable time."));
				}, 10000);
			}),
		]).catch((e) => {
			if (e.code === 'NETWORK_ERROR') {
				throw new Error('The RPC service is not working as expected');
			}
			throw e;
		});
		return factoryProxyConfig;
	};

	const handleConnectHashpackWallet = () => {
		setHashpackSelected(true);
	};

	const unHandleConnectHashpackWallet = () => {
		setHashpackSelected(false);
		setLoading(undefined);
	};

	const handleConnectHashpackWalletConfirmed = () => {
		const values = getValues();
		handleWalletConnect(SupportedWallets.HASHPACK, values.networkHashpack.value);
	};

	const networkOptions = [{ value: 'testnet', label: 'Testnet' }];
	if (
		process.env.REACT_APP_ONLY_TESTNET === undefined ||
		process.env.REACT_APP_ONLY_TESTNET === 'false'
	) {
		networkOptions.push({ value: 'mainnet', label: 'Mainnet' });
	}

	const handleConnectMetamaskWallet = () => {
		handleWalletConnect(SupportedWallets.METAMASK, '-');
	};

	const handleConnectBladeWallet = () => {
		setBladeSelected(true);
	};

	const unHandleConnectBladeWallet = () => {
		setBladeSelected(false);
		setLoading(undefined);
	};

	const handleConnectBladeWalletConfirmed = () => {
		const values = getValues();
		handleWalletConnect(SupportedWallets.BLADE, values.networkBlade.value);
	};

	const handleMultiSigMode = () => {
		console.log('MultiSig Mode');
		setMultiSigSelected(true);
		setIsHederaAccountIdModalOpen(true);
	};

	const handleHederaIdSubmit = () => {
		console.log(hederaAccountId);
		setIsHederaAccountIdModalOpen(false);
		// TODO: Logics
	};

	const PairingSpinner: FC<{ wallet: SupportedWallets; children?: ReactNode }> = ({
		wallet,
		children,
	}) => {
		return (
			<>
				{loading && loading === wallet && (
					<HStack w={20} justifyContent='center' alignItems={'center'} h='full'>
						<Spinner
							w={50}
							h={50}
							justifyContent='center'
							alignSelf={'center'}
							color={wallet === SupportedWallets.HASHPACK ? '#C6AEFA' : '#f39c12'}
							thickness='8px'
						/>
					</HStack>
				)}
				{(!loading || loading !== wallet) && children}
			</>
		);
	};

	const userAgent = navigator.userAgent;

	const isChrome = userAgent.indexOf('Chrome') !== -1;

	return (
		<>
			<Modal
				isOpen={true}
				onClose={onClose}
				size={'xl'}
				isCentered
				closeOnEsc={false}
				closeOnOverlayClick={false}
			>
				<ModalOverlay />
				<ModalContent data-testid='modal-action-content' p='50' maxW='1000px'>
					{!error && !rejected && !hashpackSelected && !bladeSelected && (
						<>
							<ModalHeader p='0' justifyContent='center'>
								<Text
									data-testid='title'
									fontSize='20px'
									fontWeight={700}
									textAlign='center'
									lineHeight='16px'
									color='brand.black'
								>
									{t('walletActions.selectWallet')}
								</Text>
							</ModalHeader>
							<ModalFooter p='0' justifyContent='center'>
								<HStack
									spacing={10}
									pt={8}
									w='full'
									justifyContent={'center'}
									alignItems={'stretch'}
								>
									{availableWallets.includes(SupportedWallets.HASHPACK) ? (
										<VStack
											data-testid='Hashpack'
											{...styles.providerStyle}
											shouldWrapChildren
											onClick={handleConnectHashpackWallet}
										>
											<PairingSpinner wallet={SupportedWallets.HASHPACK}>
												<Image src={HASHPACK_LOGO_PNG} w={20} />
												<Text>Hashpack</Text>
											</PairingSpinner>
										</VStack>
									) : (
										<VStack data-testid='Hashpack' {...styles.providerStyle}>
											<Link
												href='https://www.hashpack.app/download'
												isExternal
												_hover={{ textDecoration: 'none' }}
											>
												<Image src={HASHPACK_LOGO_PNG} w={20} />
												<Text>Hashpack</Text>
											</Link>
										</VStack>
									)}
									{availableWallets.includes(SupportedWallets.METAMASK) ? (
										<VStack
											data-testid='Metamask'
											{...styles.providerStyle}
											shouldWrapChildren
											onClick={handleConnectMetamaskWallet}
										>
											<PairingSpinner wallet={SupportedWallets.METAMASK}>
												<Image src={METAMASK_LOGO} w={20} />
												<Text textAlign='center'>Metamask</Text>
											</PairingSpinner>
										</VStack>
									) : (
										<VStack data-testid='Metamask' {...styles.providerStyle}>
											<Link
												href='https://metamask.io/download/'
												isExternal
												_hover={{ textDecoration: 'none' }}
											>
												<Image src={METAMASK_LOGO} w={20} />
												<Text textAlign='center'>Metamask</Text>
											</Link>
										</VStack>
									)}
									{isChrome ? (
										availableWallets.includes(SupportedWallets.BLADE) ? (
											<VStack
												data-testid='Blade'
												{...styles.providerStyle}
												shouldWrapChildren
												onClick={handleConnectBladeWallet}
											>
												<PairingSpinner wallet={SupportedWallets.BLADE}>
													<Image src={BLADE_LOGO_PNG} w={20} />
													<Text textAlign='center'>Blade</Text>
												</PairingSpinner>
											</VStack>
										) : (
											<VStack data-testid='Blade' {...styles.providerStyle}>
												<Link
													href='https://bladewallet.io/'
													isExternal
													_hover={{ textDecoration: 'none' }}
												>
													<Image src={BLADE_LOGO_PNG} w={20} />
													<Text textAlign='center'>Blade</Text>
												</Link>
											</VStack>
										)
									) : (
										//* Blade is not supported in this browser
										<></>
									)}
									{!availableWallets.includes(SupportedWallets.MULTISIG) ? (
										<VStack
											data-testid='Multisig'
											{...styles.providerStyle}
											shouldWrapChildren
											onClick={handleMultiSigMode}
										>
											<PairingSpinner wallet={SupportedWallets.MULTISIG}>
												<Image src={MULTISIG_LOGO_PNG} w={20} />
												<Text textAlign='center'>Multisig</Text>
											</PairingSpinner>
										</VStack>
									) : (
										<></>
									)}
								</HStack>
							</ModalFooter>
						</>
					)}
					{hashpackSelected && (
						<>
							<ModalHeader p='0' justifyContent='center'>
								<Text
									fontSize='20px'
									fontWeight={700}
									textAlign='center'
									lineHeight='16px'
									color='brand.black'
								>
									{t('walletActions.selectWallet')}
								</Text>
							</ModalHeader>
							<ModalFooter alignSelf='center' pt='24px' pb='0'>
								<VStack>
									<SelectController
										control={control}
										isRequired
										name='networkHashpack'
										defaultValue='0'
										options={networkOptions}
										addonLeft={true}
										overrideStyles={stylesNetworkOptions}
										variant='unstyled'
									/>
									<HStack>
										<Button
											data-testid='modal-notification-button-Hashpack'
											onClick={unHandleConnectHashpackWallet}
											variant='secondary'
										>
											{t('common.cancel')}
										</Button>
										<Button
											data-testid='modal-notification-button-Hashpack'
											onClick={handleConnectHashpackWalletConfirmed}
											variant='primary'
										>
											{t('common.accept')}
										</Button>
									</HStack>
								</VStack>
							</ModalFooter>
						</>
					)}
					{bladeSelected && (
						<>
							<ModalHeader p='0' justifyContent='center'>
								<Text
									fontSize='20px'
									fontWeight={700}
									textAlign='center'
									lineHeight='16px'
									color='brand.black'
								>
									{t('walletActions.selectWallet')}
								</Text>
							</ModalHeader>
							<ModalFooter alignSelf='center' pt='24px' pb='0'>
								<VStack>
									<SelectController
										control={control}
										isRequired
										name='networkBlade'
										defaultValue='0'
										options={networkOptions}
										addonLeft={true}
										overrideStyles={stylesNetworkOptions}
										variant='unstyled'
									/>
									<HStack>
										<Button
											data-testid='modal-notification-button-Blade'
											onClick={unHandleConnectBladeWallet}
											variant='secondary'
										>
											{t('common.cancel')}
										</Button>
										<Button
											data-testid='modal-notification-button-Blade'
											onClick={handleConnectBladeWalletConfirmed}
											variant='primary'
										>
											{t('common.accept')}
										</Button>
									</HStack>
								</VStack>
							</ModalFooter>
						</>
					)}
					{(error || rejected) && (
						<>
							<ModalHeader alignSelf='center' p='0'>
								<Image
									data-testid='modal-notification-icon'
									src={error ? ERROR_ICON : WARNING_ICON}
									width='54px'
									height='54px'
								/>
							</ModalHeader>
							<ModalBody textAlign='center' pt='14px'>
								<Text
									data-testid='modal-notification-title'
									fontSize='14px'
									fontWeight={700}
									lineHeight='16px'
									color='brand.black'
								>
									{error ?? t('pairing.rejected')}
								</Text>
							</ModalBody>
							<ModalFooter alignSelf='center' pt='24px' pb='0'>
								<Button
									data-testid='modal-notification-button'
									onClick={() => {
										dispatch(walletActions.clearData());
										setError(undefined);
										setRejected(false);
									}}
									variant='primary'
								>
									{t('common.goBack')}
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
			<Modal
				isOpen={isHederaAccountIdModalOpen}
				onClose={() => setIsHederaAccountIdModalOpen(false)}
			>
				<ModalContent>
					<ModalHeader>Enter your Hedera Account ID</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Input
							placeholder='Your Hedera MultiSig Account ID'
							value={hederaAccountId}
							onChange={(e) => setHederaAccountId(e.target.value)}
						/>
					</ModalBody>
					<ModalFooter>
						<Button mr={3} onClick={handleHederaIdSubmit}>
							Submit
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ModalWalletConnect;
