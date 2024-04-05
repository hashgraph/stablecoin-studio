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
import type {
	AccountViewModel,
	MultiSigTransactionsViewModel,
	MultiSigTransactionViewModel,
} from '@hashgraph/stablecoin-npm-sdk';

import { GetTransactionsRequest, SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';
import { ArrowForwardIcon, DeleteIcon } from '@chakra-ui/icons';
import BaseContainer from '../../components/BaseContainer';
import { useTranslation } from 'react-i18next';
import MultiSigTransactionModal from './components/MultiSigTransactionModal';
import SDKService from '../../services/SDKService';
import { useSelector } from 'react-redux';
import { LAST_WALLET_SELECTED, SELECTED_WALLET_ACCOUNT_INFO } from '../../store/slices/walletSlice';

// @ts-ignore
const MultiSigTransactions = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const selectedWallet = useSelector(LAST_WALLET_SELECTED);
	const wallet: AccountViewModel = useSelector(SELECTED_WALLET_ACCOUNT_INFO);
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
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');

	useEffect(() => {
		const fetchTransactions = async () => {
			const request = new GetTransactionsRequest({
				limit: 8,
				page: currentPage,
			});

			if (selectedWallet === SupportedWallets.MULTISIG) {
				request.account = wallet.id;
			} else if (publicKey) {
				request.publicKey = { key: publicKey };
			}
			if (request.account || request.publicKey) {
				const resp = await SDKService.getMultiSigTransactions(request);
				setTotalPages(resp.pagination.totalPages);
				setTransactions(resp.transactions);
			}
		};

		fetchTransactions();
	}, [selectedWallet, currentPage]);

	const canSignTransaction = (transaction: MultiSigTransactionViewModel) => {
		return (
			publicKey && transaction.key_list.includes(publicKey) && transaction.status === 'PENDING'
		);
	};

	const canSendTransaction = (transaction: MultiSigTransactionViewModel) => {
		if (selectedWallet === SupportedWallets.METAMASK) return false;
		return transaction.signed_keys.length >= transaction.threshold;
	};

	const filteredTransactions = transactions.filter((transaction) => {
		if (!filter) return true;
		return transaction.status.toUpperCase() === filter.toUpperCase();
	});

	const handleSignTransaction = async (transactionId: string) => {
		try {
			const response = await SDKService.signMultiSigTransaction(transactionId);
			if (publicKey) {
				setTransactions(
					transactions.map((t) => {
						if (t.id === transactionId) {
							return {
								...t,
								status: 'SIGNED',
								signed_keys: [...t.signed_keys, publicKey],
							};
						}
						return t;
					}),
				);
				console.log('Transaction signed:', response);
			} else {
				console.error('Public key is undefined, cannot sign transaction');
			}
		} catch (error) {
			console.error('Error signing transaction:', error);
		}
	};

	const handleSendTransaction = async (transactionId: string) => {
		try {
			SDKService.submitMultiSigTransaction(transactionId);
			// Remove the transaction from the list as it is sent
			setSuccessMessage(`Operation successfully sent.`);
			setIsSuccessModalOpen(true); // Open the success modal
			setTransactions(transactions.filter((t) => t.id !== transactionId));
		} catch (error) {
			// @ts-ignore
			setSuccessMessage(`Error sending transaction: ${error.message}`);
			setIsSuccessModalOpen(true); // Open the success modal
		}
	};

	const handleConfirmDeleteTransaction = async () => {
		if (transactionToDelete) {
			try {
				await SDKService.removeMultiSigTransaction(transactionToDelete.id);
				setTransactions(transactions.filter((t) => t.id !== transactionToDelete.id));
				onDeleteModalClose();
			} catch (error) {
				console.error('Error deleting transaction:', error);
			}
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

	// @ts-ignore
	return (
		<BaseContainer title={t('Multi-sig transactions')}>
			<Box display='flex' justifyContent='space-between' p={4} bg='white' shadow='sm'>
				<Select
					placeholder='Filter by status'
					width='auto'
					onChange={(e) => setFilter(e.target.value)}
				>
					<option value='pending'>Pending</option>
					<option value='signed'>Signed</option>
				</Select>
			</Box>
			<Box position='relative' mb='4'>
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
									<Td
										borderBottom='1px'
										borderColor='gray.200'
										maxWidth='200px'
										whiteSpace='nowrap'
										overflow='hidden'
										textOverflow='ellipsis'
									>
										<span
											style={{ textDecoration: 'underline', cursor: 'pointer' }}
											onClick={() => handleDetailsClick(transaction)}
										>
											{transaction.description}
										</span>
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
										{canSignTransaction(transaction) && (
											<Button
												size={'sm'}
												mr={2}
												style={{ maxWidth: '90px' }}
												rightIcon={<ArrowForwardIcon />}
												onClick={() => handleSignTransaction(transaction.id)}
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
												onClick={() => handleSendTransaction(transaction.id)}
											>
												Send
											</Button>
										)}
										<Button
											size={'sm'}
											mr={2}
											style={{ maxWidth: '90px' }}
											rightIcon={<DeleteIcon />}
											onClick={() => showDeleteConfirmationModal(transaction)}
										>
											Delete
										</Button>
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</TableContainer>
				{totalPages > 1 && (
					<Box display='flex' justifyContent='center' alignItems='center' p={4}>
						<Button
							size={'sm'}
							style={{ maxWidth: '50px' }}
							onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
							disabled={currentPage <= 1}
						>
							Prev
						</Button>
						<Box mx={2}>
							Page {currentPage} of {totalPages}
						</Box>
						<Button
							size={'sm'}
							style={{ maxWidth: '50px' }}
							onClick={() => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))}
							disabled={currentPage >= totalPages}
						>
							Next
						</Button>
					</Box>
				)}
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
							<Button colorScheme='red' mr={3} onClick={handleConfirmDeleteTransaction}>
								Delete
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
			<Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Success</ModalHeader>
					<ModalCloseButton />
					<ModalBody>{successMessage}</ModalBody>
					<ModalFooter>
						<Button colorScheme='blue' mr={3} onClick={() => setIsSuccessModalOpen(false)}>
							OK
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</BaseContainer>
	);
};

export default MultiSigTransactions;
