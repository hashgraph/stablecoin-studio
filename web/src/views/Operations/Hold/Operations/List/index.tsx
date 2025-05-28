import {
	Button,
	Flex,
	Heading,
	HStack,
	Skeleton,
	Stack,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET, SELECTED_WALLET_COIN } from '../../../../../store/slices/walletSlice';
import { useEffect, useState } from 'react';
import type { HoldViewModel } from '@hashgraph/stablecoin-npm-sdk';
import { GetHoldForRequest, GetHoldsIdForRequest } from '@hashgraph/stablecoin-npm-sdk';
import { useRefreshCoinInfo } from '../../../../../hooks/useRefreshCoinInfo';
import { useTranslation } from 'react-i18next';
import SDKService from '../../../../../services/SDKService';
import BaseContainer from '../../../../../components/BaseContainer';
import { useNavigate } from 'react-router-dom';
import { RouterManager } from '../../../../../Router/RouterManager';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { formatDate } from '../../../../../utils/format';

export const ListOperationHold = () => {
	const navigate = useNavigate();

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const selectedWallet = useSelector(SELECTED_WALLET);

	const [holds, setHolds] = useState<HoldViewModel[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useRefreshCoinInfo();

	const { t } = useTranslation(['hold', 'global', 'operations', 'multiSig']);

	useEffect(() => {
		const getHolds = async () => {
			setIsLoading(true);

			const holdsIds = await SDKService.getHoldsIdFor(
				new GetHoldsIdForRequest({
					tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
					sourceId: selectedWallet.accountInfo.id?.toString() ?? '',
					start: 0,
					end: 10000,
				}),
			);
			if (holdsIds) {
				const holdDetails = await Promise.all(
					holdsIds.map(async (holdId) => {
						const holdRequest = new GetHoldForRequest({
							holdId,
							sourceId: selectedWallet.accountInfo.id?.toString() ?? '',
							tokenId: selectedStableCoin?.tokenId?.toString() ?? '',
						});
						return await SDKService.getHoldFor(holdRequest);
					}),
				);

				setHolds(holdDetails);

				setIsLoading(false);
			}

			setIsLoading(false);
		};

		getHolds();
	}, []);

	const handleGoBack = () => {
		RouterManager.goBack(navigate);
	};

	return (
		<>
			<BaseContainer title={t('global:operations.title')}>
				<Flex
					direction='column'
					bg='brand.gray100'
					px={{ base: 4, lg: 14 }}
					pt={{ base: 4, lg: 14 }}
					pb={6}
				>
					<HStack mb={10} gap={2}>
						<Button data-testid='cancel-btn' onClick={handleGoBack} variant='secondary' w={10}>
							<ChevronLeftIcon boxSize={8} />
						</Button>
						<Heading data-testid='title' fontSize='24px' fontWeight='700' lineHeight='16px'>
							{t('operations:hold.list.title')}
						</Heading>
					</HStack>
					<Stack spacing={6}>
						<TableContainer bg='white' shadow='sm' overflowX='auto'>
							<Table variant='simple'>
								<Thead bg='#ece8ff'>
									<Tr>
										<Th>{t('operations:hold.list.columns.id')}</Th>
										<Th>{t('operations:hold.list.columns.amount')}</Th>
										<Th>{t('operations:hold.list.columns.expirationDate')}</Th>
										<Th>{t('operations:hold.list.columns.escrowAddress')}</Th>
										<Th>{t('operations:hold.list.columns.destinationAddress')}</Th>
									</Tr>
								</Thead>
								<Tbody>
									{isLoading ? (
										<TableLoading />
									) : (
										holds.map((hold, index) => (
											<Tr key={index}>
												<Td>{hold.id}</Td>
												<Td>{hold.amount}</Td>
												<Td>{formatDate(hold.expirationDate, 'dd/MM/yyyy HH:mm:ss')}</Td>
												<Td>{hold.escrowAddress}</Td>
												<Td>{hold.destinationAddress}</Td>
											</Tr>
										))
									)}
								</Tbody>
							</Table>
						</TableContainer>
					</Stack>
				</Flex>
			</BaseContainer>
		</>
	);
};

export const TableLoading = () => {
	return (
		<>
			{Array.from({ length: 3 }).map((_item, index) => (
				<Tr key={index}>
					{Array.from({ length: 5 }).map((_, tdIndex) => (
						<Td key={tdIndex}>
							<Skeleton w='full' height='20px' />
						</Td>
					))}
				</Tr>
			))}
		</>
	);
};
