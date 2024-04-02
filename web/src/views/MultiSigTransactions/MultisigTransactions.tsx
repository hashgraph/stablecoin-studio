import React, { useEffect, useState } from 'react';
import {
	Box,
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Select,
	Table,
	TableContainer,
	Tag,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useDisclosure,
} from '@chakra-ui/react';
// @ts-ignore
import { AccountViewModel, GetTransactionsRequest, MultiSigTransactionViewModel } from '@hashgraph/stablecoin-npm-sdk';
import { ArrowForwardIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import BaseContainer from '../../components/BaseContainer';
import { useTranslation } from 'react-i18next';
import MultiSigTransactionModal from './components/MultiSigTransactionModal';
import SDKService from '../../services/SDKService';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET_ACCOUNT_INFO, SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';

// @ts-ignore
const MultiSigTransactions = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const wallet:AccountViewModel = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
	const publicKey = wallet.publicKey?.key;

	const {
		isOpen: isDeleteModalOpen,
		onOpen: onDeleteModalOpen,
		onClose: onDeleteModalClose,
	} = useDisclosure();
	const [transactionToDelete, setTransactionToDelete] =
		useState<MultiSigTransactionViewModel | null>(null);
	const [transactions, setTransactions] = useState<MultiSigTransactionViewModel[]>([]);
	const [selectedTransaction, setSelectedTransaction] =
		useState<MultiSigTransactionViewModel | null>(null);
	const [filter, setFilter] = useState('');
	const { t } = useTranslation(['multiSig', 'global']);

	useEffect(() => {
		const fetchTransactions = async () => {
			if(wallet.multiKey && wallet.multiKey.keys.length > 0) {
				const request = new GetTransactionsRequest({
					page: 1,
					limit: 10,
					account: wallet.id,
				});
				const resp = await SDKService.getMultiSigTransactions(request);
				setTransactions(resp);
			} else if (publicKey) {
				const request = new GetTransactionsRequest({
					publicKey: {
						key: publicKey,
					},
					page: 1,
					limit: 10,
				});
				const resp = await SDKService.getMultiSigTransactions(request);
				setTransactions(resp);
			} else {
				console.error('Public key not found');
			}
		};
		fetchTransactions();
	});

	const canSignTransaction = (transaction: MultiSigTransactionViewModel) => {
		return publicKey && transaction.signed_keys.includes(publicKey) && transaction.status === 'PENDING';
	};

	const canSendTransaction = (transaction: MultiSigTransactionViewModel) => {
		return (
			transaction.signed_keys.length >= transaction.threshold && transaction.status !== 'SIGNED'
		);
	};

	const filteredTransactions = transactions.filter((transaction) => {
		if (!filter) return true;
		return transaction.status.toUpperCase() === filter.toUpperCase();
	});

	const handleSignTransaction = async (transaction: MultiSigTransactionViewModel) => {
		try {
			await SDKService.signMultiSigTransaction(transaction.id, publicKey);
			const updatedTransaction = {
				...transaction,
				signed_keys: [...transaction.signed_keys, publicKey],
			};
			setTransactions(transactions.map((t) => (t.id === transaction.id ? updatedTransaction : t);
			onClose();
		} catch (error) {
			console.error('Error signing transaction:', error);
		}
	};

	const handleSendTransaction = async (transaction: MultiSigTransactionViewModel) => {
		try {
			await SDKService.submitMultiSigTransaction(transaction.id)
			const updatedTransaction = {
				...transaction,
				status: 'completed',
			};
			setTransactions(transactions.map((t) => (t.id === transaction.id ? updatedTransaction : t)));
			onClose();
		} catch (error) {
			console.error('Error sending transaction:', error);
		}
	};

	const handleDeleteTransaction = async (transaction: MultiSigTransactionViewModel) => {
		try {
			showDeleteConfirmationModal(transaction);
			console.log(`Deleting transaction ${transaction.id}`);
		} catch (error) {
			console.error('Error deleting transaction:', error);
		}
	};

	const handleDeleteConfirmation = async () => {
		if (!transactionToDelete) {
			console.error('No transaction to delete');
		} else {
			await SDKService.removeMultiSigTransaction(transactionToDelete.id);
			setTransactions(transactions.filter((t) => t.id !== transactionToDelete.id));
			setTransactionToDelete(null);
			onDeleteModalClose();
		}
	};

	const showDeleteConfirmationModal = (transaction: MultiSigTransactionViewModel) => {
		setTransactionToDelete(transaction);
		onDeleteModalOpen();
	};

	const handleDetailsClick = (transaction: MultiSigTransactionViewModel) => {
		setSelectedTransaction(transaction);
		onOpen();
	};

	return (
		<BaseContainer title={t('Multi-sig transactions')}>
			<Box position='relative' mb='4'>
				<Select
					position='absolute'
					right='0'
					mt='2'
					mr='2'
					size='sm'
					width='auto'
					bg='white'
					zIndex='1'
					placeholder='Filter by status'
					onChange={(e) => setFilter(e.target.value)}
				>
					<option >All</option>
					<option value='pending'>Pending</option>
					<option value='signed'>Signed</option>
				</Select>
				<TableContainer bg='white' shadow='sm' overflow='hidden'>
					<Table variant='simple'>
						<Thead bg='#ece8ff'>
							<Tr>
								<Th>ID</Th>
								<Th>Description</Th>
								<Th>Account</Th>
								<Th>Threshold</Th>
								<Th>Status</Th>
								<Th>Actions</Th>
							</Tr>
						</Thead>
						<Tbody>
							{filteredTransactions.map((transaction) => (
								<Tr key={transaction.id}>
									<Td borderBottom='1px' borderColor='gray.200'>
										{transaction.id}
									</Td>
									<Td borderBottom='1px' borderColor='gray.200'>
										{transaction.description}
									</Td>
									<Td borderBottom='1px' borderColor='gray.200'>
										{transaction.hedera_account_id}
									</Td>
									<Td borderBottom='1px' borderColor='gray.200'>
										{transaction.threshold}
									</Td>
									<Td borderBottom='1px' borderColor='gray.200'>
										<Tag>{transaction.status}</Tag>
									</Td>
									<Td borderBottom='1px' borderColor='gray.200'>
										<Button
											size={'sm'}
											mr={2}
											style={{ maxWidth: '90px' }}
											rightIcon={<SearchIcon />}
											onClick={() => handleDetailsClick(transaction)}
										>
											Details
										</Button>
										{canSignTransaction(transaction) && (
											<Button
												size={'sm'}
												mr={2}
												style={{ maxWidth: '90px' }}
												rightIcon={<ArrowForwardIcon />}
												onClick={() => handleSignTransaction(transaction)}
											>
												Sign
											</Button>
										)}
										{canSendTransaction(transaction) && (
											<Button
												size={'sm'}
												mr={2}
												style={{ maxWidth: '90px' }}
												rightIcon={<ArrowForwardIcon />}
												onClick={() => handleSendTransaction(transaction)}
											>
												Send
											</Button>
										)}
										<Button
											size={'sm'}
											mr={2}
											style={{ maxWidth: '90px' }}
											rightIcon={<DeleteIcon />}
											onClick={() => handleDeleteTransaction(transaction)}
										>
											Delete
										</Button>
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</TableContainer>
			</Box>
			{selectedTransaction && (
				<MultiSigTransactionModal
					selectedTransaction={selectedTransaction}
					isOpen={isOpen}
					onClose={onClose}
				/>
			)}
			{transactionToDelete && (
				<Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
					<ModalOverlay />
					<ModalContent>
						<ModalHeader>Confirm Delete</ModalHeader>
						<ModalCloseButton />
						<ModalBody>Are you sure you want to delete this transaction?</ModalBody>
						<ModalFooter>
							<Button variant='ghost' onClick={onDeleteModalClose}>
								Cancel
							</Button>
							<Button colorScheme='red' mr={3} onClick={handleDeleteConfirmation}>
								Delete
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
		</BaseContainer>
	);
};

export default MultiSigTransactions;
