import React from 'react';
import {
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
} from '@chakra-ui/react';

const copyToClipboard = (text: string) => {
	navigator.clipboard.writeText(text).then(() => {
		console.log('Text copied to clipboard');
	});
};

// @ts-ignore
const MultiSigTransactionModal = ({ isOpen, onClose, selectedTransaction }) => {
	if (!selectedTransaction) return null;

	const transactionMessagePreview = `${selectedTransaction.transaction_message.substring(
		0,
		10,
	)}...`;

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Transaction Details</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<p>
						<strong>ID:</strong> {selectedTransaction.id}
					</p>
					<p>
						<strong>Transaction Message:</strong>
						<code
							onClick={() => copyToClipboard(selectedTransaction.transaction_message)}
							style={{ cursor: 'pointer' }}
						>
							{transactionMessagePreview}
						</code>
					</p>
					<p>
						<strong>Description:</strong> {selectedTransaction.description}
					</p>
					<p>
						<strong>Status:</strong> {selectedTransaction.status}
					</p>
					<p>
						<strong>Threshold:</strong> {selectedTransaction.threshold}
					</p>

					<strong>Key List:</strong>
					<ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
						{selectedTransaction.key_list.map((key: string, index: string) => (
							<li key={index}>
								<code onClick={() => copyToClipboard(key)} style={{ cursor: 'pointer' }}>
									{key}
								</code>
							</li>
						))}
					</ul>

					<strong>Signed Keys:</strong>
					{selectedTransaction.signed_keys.length > 0 ? (
						<ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
							{selectedTransaction.signed_keys.map((key: string, index: string) => (
								<li key={index}>
									<code onClick={() => copyToClipboard(key)} style={{ cursor: 'pointer' }}>
										{key}
									</code>
								</li>
							))}
						</ul>
					) : (
						<p>No keys have signed this transaction yet.</p>
					)}
				</ModalBody>
				<ModalFooter>
					<Button onClick={onClose}>Close</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default MultiSigTransactionModal;
