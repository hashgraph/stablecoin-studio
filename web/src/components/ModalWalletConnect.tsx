import {
	HStack,
	Image,
	Modal,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalOverlay,
	Text,
	VStack,
} from '@chakra-ui/react';
import { SupportedWallets } from 'hedera-stable-coin-sdk';
import HEDERA_LOGO from '../assets/png/hashpackLogo.png';
import METAMASK_LOGO from '../assets/svg/MetaMask_Fox.svg';
import SDKService from '../services/SDKService';

interface ModalWalletConnectProps {
	isOpen: boolean;
	onClose: () => void;
}

const ModalWalletConnect = ({ isOpen, onClose }: ModalWalletConnectProps) => {
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

	const handleConnectHashpackWallet = async () => {
		await SDKService.connectWallet(SupportedWallets.HASHPACK);
	};

	const handleConnectMetamaskWallet = async () => {
		await SDKService.connectWallet(SupportedWallets.METAMASK);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'xl'} isCentered>
			<ModalOverlay />
			<ModalContent data-testid='modal-action-content' p='50' w='500px'>
				<ModalCloseButton />
				<ModalFooter p='0' justifyContent='center'>
					<HStack spacing={14} pt={8} w='full' justifyContent={'center'}>
						<VStack {...styles.providerStyle} onClick={handleConnectHashpackWallet}>
							<Image src={HEDERA_LOGO} w={20} />
							<Text>Hashpack</Text>
						</VStack>
						<VStack {...styles.providerStyle}>
							<Image src={METAMASK_LOGO} w={20} onClick={handleConnectMetamaskWallet} />
							<Text>Metamask</Text>
						</VStack>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default ModalWalletConnect;
