import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import SDKService from '../../services/SDKService';
import { MultiSigTransactionViewModel } from '@hashgraph/stablecoin-npm-sdk';

const TransactionsTable = ({ webSDK, publicKey }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) return;
      try {
        const transactions:MultiSigTransactionViewModel[] = await SDKService.getMultiSigTransactions();
        setTransactions(transactions);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    };

    fetchTransactions();
  }, [publicKey, webSDK]);

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    onOpen();
  };

  return (
    <>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Description</Th>
            <Th>Threshold</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((transaction:MultiSigTransactionViewModel) => (
            <Tr key={transaction.id} onClick={() => handleRowClick(transaction)} cursor="pointer">
              <Td>{transaction.id}</Td>
              <Td>{transaction.description}</Td>
              <Td>{transaction.threshold}</Td>
              <Td>{transaction.status}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {selectedTransaction && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transaction Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <p>ID: {selectedTransaction.id}</p>
              <p>Transaction Message: {selectedTransaction.transaction_message}</p>
              <p>Description: {selectedTransaction.description}</p>
              <p>Status: {selectedTransaction.status}</p>
              <p>Threshold: {selectedTransaction.threshold}</p>
              <p>Key List: {selectedTransaction.key_list.join(', ')}</p>
              <p>Signed Keys: {selectedTransaction.signed_keys.join(', ')}</p>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
