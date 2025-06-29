import {
	Button,
	HStack,
	Image,
	Input,
	Link,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spinner,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react';
import { SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';
import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import MULTISIG_LOGO_PNG from '../assets/png/multisigLogo.png';
import WALLETCONNECT_LOGO_PNG from '../assets/png/WCLogo.png';
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

	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		onOpen();
	}, [onOpen]);

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
	const [hashpackSelected] = useState<boolean>(false);
	const [hwcSelected, setHwcSelected] = useState<boolean>(false);
	const [multiSigSelected, setMultiSigSelected] = useState<boolean>(false);
	const availableWallets: SupportedWallets[] = useSelector(AVAILABLE_WALLETS);
	const selectedMirrors: IMirrorRPCNode[] = useSelector(SELECTED_MIRRORS);
	const selectedRPCs: IMirrorRPCNode[] = useSelector(SELECTED_RPCS);
	const [hederaAccountId, setHederaAccountId] = useState('');
	const [networkError, setNetworkError] = useState('');
	const [accountIdError, setAccountIdError] = useState('');

	const { control, getValues } = useForm({
		mode: 'onChange',
	});

	const isHWCProjectID =
		!!process.env.REACT_APP_PROJECT_ID && process.env.REACT_APP_PROJECT_ID.trim() !== '';

	const handleWalletConnect = async (
		wallet: SupportedWallets,
		network: string,
		hederaAccountId?: string,
	) => {
		if (loading) return;
		setLoading(wallet);
		dispatch(walletActions.setLastWallet(wallet));
		dispatch(walletActions.setNetwork(network));
		dispatch(walletActions.setSelectedStableCoin(undefined));
		dispatch(walletActions.setSelectedStableCoinConfigInfo(undefined));
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

			const result = await SDKService.connectWallet(
				wallet,
				network,
				mirrorNode,
				rpcNode,
				hederaAccountId,
			);

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

	const handleMultiSigMode = () => {
		setMultiSigSelected(true);
	};

	const handleConnectHederaWalletConnect = () => {
		setHwcSelected(true);
	};

	const unHandleConnectHederaWalletConnect = () => {
		setHwcSelected(false);
		setLoading(undefined);
	};

	const handleConnectHwcConfirmed = () => {
		const values = getValues();
		handleWalletConnect(SupportedWallets.HWALLETCONNECT, values.networkHwc.value);
		onClose();
	};

	const validateAccountId = (accountId: string) => {
		const regex = /^\d+\.\d+\.\d+$/;
		return regex.test(accountId);
	};

	const handleConnectClick = () => {
		const networkSelection = getValues('networkMultisig');
		const networkValue = networkSelection.value;
		const isValidAccountId = validateAccountId(hederaAccountId);

		// Reset errors
		setNetworkError('');
		setAccountIdError('');

		if (!networkValue) {
			setNetworkError('Please select a network.');
		}
		if (!isValidAccountId) {
			setAccountIdError('Please enter a valid Hedera Account ID (e.g., 0.0.123).');
		}
		if (!networkValue || !isValidAccountId) {
			return;
		}

		handleWalletConnect(SupportedWallets.MULTISIG, networkValue, hederaAccountId);
		setMultiSigSelected(false);
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

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size={'xl'}
				isCentered
				closeOnEsc={false}
				closeOnOverlayClick={false}
			>
				<ModalOverlay zIndex={88} />

				<ModalContent
					data-testid='modal-action-content'
					alignItems='center'
					justifyContent='center'
					p='50'
					maxW='1000px'
					containerProps={{
						zIndex: '88',
					}}
				>
					{!error && !rejected && !hashpackSelected && !multiSigSelected && !hwcSelected && (
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
									{isHWCProjectID ? (
										<VStack
											data-testid='HederaWalletConnect'
											{...styles.providerStyle}
											shouldWrapChildren
											onClick={handleConnectHederaWalletConnect}
										>
											<PairingSpinner wallet={SupportedWallets.HWALLETCONNECT}>
												<Image src={WALLETCONNECT_LOGO_PNG} w={20} />
												<Text>Hedera WC</Text>
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
						</>
					)}
					{multiSigSelected && (
						<>
							<ModalHeader>
								<Text
									fontSize='20px'
									fontWeight={700}
									textAlign='center'
									lineHeight='16px'
									color='brand.black'
								>
									{t('multiSigActions.title')}
								</Text>
							</ModalHeader>
							<ModalFooter>
								<VStack spacing={4} alignItems='center' justifyContent='center'>
									<SelectController
										control={control}
										isRequired
										name='networkMultisig'
										options={networkOptions}
										defaultValue='0'
										addonLeft={true}
										overrideStyles={stylesNetworkOptions}
										variant='unstyled'
									/>
									{networkError && <Text color='red'>{networkError}</Text>}
									<Input
										placeholder='0.0.0'
										value={hederaAccountId}
										onChange={(e) => setHederaAccountId(e.target.value)}
									/>
									{accountIdError && <Text color='red'>{accountIdError}</Text>}
									<HStack justifyContent='center' w='full'>
										<Button
											data-testid='modal-cancel-button-Multisig'
											onClick={() => setMultiSigSelected(false)}
											variant='secondary'
										>
											Cancel
										</Button>
										<Button
											data-testid='modal-confirm-button-Multisig'
											onClick={handleConnectClick}
											variant='primary'
										>
											Connect
										</Button>
									</HStack>
								</VStack>
							</ModalFooter>
						</>
					)}
					{hwcSelected && (
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
										name='networkHwc'
										defaultValue='0'
										options={networkOptions}
										addonLeft={true}
										overrideStyles={stylesNetworkOptions}
										variant='unstyled'
									/>
									<HStack>
										<Button
											data-testid='modal-notification-button-HederaWalletConnect'
											onClick={unHandleConnectHederaWalletConnect}
											variant='secondary'
										>
											{t('common.cancel')}
										</Button>
										<Button
											data-testid='modal-notification-button-HederaWalletConnect'
											onClick={handleConnectHwcConfirmed}
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
		</>
	);
};

export default ModalWalletConnect;
