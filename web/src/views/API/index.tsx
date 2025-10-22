import {
        Box,
        Heading,
        Stack,
        Text,
        Table,
        Thead,
        Tbody,
        Tr,
        Th,
        Td,
        Badge,
        useToast,
        Spinner,
        Alert,
        AlertIcon,
        Code,
        Button,
        HStack,
        Checkbox,
        Select,
        IconButton,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface WebhookMessage {
        dbId: string;
        id: string;
        body: string;
        sender: string;
        timestamp: string;
        sent: boolean;
        type: string;
        amount?: string;
        balance?: string;
        receivedAt: string;
}

const APIPage = () => {
        const { t } = useTranslation(['global']);
        const toast = useToast();
        const [messages, setMessages] = useState<WebhookMessage[]>([]);
        const [loading, setLoading] = useState(true);
        const [total, setTotal] = useState(0);
        const [hideAutre, setHideAutre] = useState(true);
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(20);

        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const publicWebhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/webhook/messages` : 'https://your-domain.replit.dev/webhook/messages';

        const fetchMessages = async () => {
                setLoading(true);
                try {
                        const response = await fetch(`${backendUrl}/webhook/messages`);
                        if (!response.ok) {
                                throw new Error('Failed to fetch messages');
                        }
                        const data = await response.json();
                        setMessages(data.messages || []);
                        setTotal(data.total || 0);
                } catch (error) {
                        toast({
                                title: t('api.fetchError'),
                                description: error instanceof Error ? error.message : 'Unknown error',
                                status: 'error',
                                duration: 5000,
                                isClosable: true,
                        });
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                fetchMessages();
                const interval = setInterval(fetchMessages, 10000);
                return () => clearInterval(interval);
        }, []);

        useEffect(() => {
                setCurrentPage(1);
        }, [hideAutre, itemsPerPage]);

        const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleString();
        };

        const getTypeColor = (type: string): string => {
                const colorMap: Record<string, string> = {
                        'P2P_IN': 'green',
                        'P2P_IN_INTL': 'teal',
                        'P2P_OUT': 'red',
                        'MERCHANT': 'purple',
                        'CASHIN': 'blue',
                        'B2W': 'cyan',
                        'AIRTIME': 'orange',
                        'OTP': 'gray',
                        'FAIL': 'red',
                        'AUTRE': 'gray',
                };
                return colorMap[type] || 'gray';
        };

        const filteredMessages = hideAutre 
                ? messages.filter(msg => msg.type !== 'AUTRE')
                : messages;

        const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

        const goToPage = (page: number) => {
                if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                }
        };

        const getPageNumbers = () => {
                const pages: (number | string)[] = [];
                const maxVisible = 7;

                if (totalPages <= maxVisible) {
                        for (let i = 1; i <= totalPages; i++) {
                                pages.push(i);
                        }
                } else {
                        pages.push(1);

                        if (currentPage > 3) {
                                pages.push('...');
                        }

                        const startPage = Math.max(2, currentPage - 1);
                        const endPage = Math.min(totalPages - 1, currentPage + 1);

                        for (let i = startPage; i <= endPage; i++) {
                                pages.push(i);
                        }

                        if (currentPage < totalPages - 2) {
                                pages.push('...');
                        }

                        pages.push(totalPages);
                }

                return pages;
        };

        return (
                <Stack spacing={6} maxW='100%'>
                        <Box>
                                <HStack justify='space-between' mb={4}>
                                        <Box>
                                                <Heading
                                                        fontSize='16px'
                                                        fontWeight='600'
                                                        mb={2}
                                                        lineHeight='15.2px'
                                                        textAlign='left'
                                                >
                                                        {t('api.title')}
                                                </Heading>
                                                <Text fontSize='14px' color='gray.600'>
                                                        {t('api.description')}
                                                </Text>
                                        </Box>
                                        <Button onClick={fetchMessages} size='sm' colorScheme='blue'>
                                                {t('api.refresh')}
                                        </Button>
                                </HStack>

                                <Alert status='info' borderRadius='md' mb={4}>
                                        <AlertIcon />
                                        <Box>
                                                <Text fontWeight='bold'>Webhook URL:</Text>
                                                <Code colorScheme='blue' p={2} mt={1} borderRadius='md' display='block'>
                                                        {publicWebhookUrl}
                                                </Code>
                                        </Box>
                                </Alert>

                                <HStack spacing={4} mb={4} flexWrap='wrap'>
                                        <Checkbox
                                                isChecked={hideAutre}
                                                onChange={(e) => setHideAutre(e.target.checked)}
                                                colorScheme='blue'
                                        >
                                                Hide AUTRE types
                                        </Checkbox>
                                        <HStack>
                                                <Text fontSize='sm' fontWeight='500'>Items per page:</Text>
                                                <Select
                                                        size='sm'
                                                        width='100px'
                                                        value={itemsPerPage}
                                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                                >
                                                        <option value='10'>10</option>
                                                        <option value='20'>20</option>
                                                        <option value='50'>50</option>
                                                        <option value='100'>100</option>
                                                </Select>
                                        </HStack>
                                        <Text fontSize='sm' color='gray.600'>
                                                Showing {filteredMessages.length} of {total} messages
                                        </Text>
                                </HStack>
                        </Box>

                        {loading && messages.length === 0 ? (
                                <Box textAlign='center' p={10}>
                                        <Spinner size='xl' color='blue.500' />
                                        <Text mt={4}>{t('api.loading')}</Text>
                                </Box>
                        ) : filteredMessages.length === 0 ? (
                                <Alert status='info' borderRadius='md'>
                                        <AlertIcon />
                                        {hideAutre ? 'No transaction messages found (all AUTRE types are hidden)' : t('api.noMessages')}
                                </Alert>
                        ) : (
                                <>
                                        <Box
                                                bg='white'
                                                borderRadius='md'
                                                boxShadow='sm'
                                                overflowX='auto'
                                        >
                                                <Table variant='simple'>
                                                        <Thead>
                                                                <Tr>
                                                                        <Th>#</Th>
                                                                        <Th>Type</Th>
                                                                        <Th>Amount</Th>
                                                                        <Th>Balance</Th>
                                                                        <Th>Body</Th>
                                                                        <Th>Sender</Th>
                                                                        <Th>Timestamp</Th>
                                                                        <Th>Status</Th>
                                                                        <Th>Received At</Th>
                                                                </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                                {paginatedMessages.map((message, index) => (
                                                                        <Tr key={message.dbId}>
                                                                                <Td>
                                                                                        <Text fontWeight="bold">{startIndex + index + 1}</Text>
                                                                                </Td>
                                                                                <Td>
                                                                                        <Badge colorScheme={getTypeColor(message.type)}>
                                                                                                {message.type}
                                                                                        </Badge>
                                                                                </Td>
                                                                                <Td>
                                                                                        {message.amount ? (
                                                                                                <Text fontWeight="semibold" color="blue.600">
                                                                                                        {message.amount} Ar
                                                                                                </Text>
                                                                                        ) : (
                                                                                                <Text color="gray.400">-</Text>
                                                                                        )}
                                                                                </Td>
                                                                                <Td>
                                                                                        {message.balance ? (
                                                                                                <Text fontWeight="semibold" color="green.600">
                                                                                                        {message.balance} Ar
                                                                                                </Text>
                                                                                        ) : (
                                                                                                <Text color="gray.400">-</Text>
                                                                                        )}
                                                                                </Td>
                                                                                <Td maxW='300px' isTruncated>
                                                                                        {message.body}
                                                                                </Td>
                                                                                <Td>{message.sender}</Td>
                                                                                <Td fontSize='sm'>{formatDate(message.timestamp)}</Td>
                                                                                <Td>
                                                                                        <Badge colorScheme={message.sent ? 'green' : 'gray'}>
                                                                                                {message.sent ? 'Sent' : 'Pending'}
                                                                                        </Badge>
                                                                                </Td>
                                                                                <Td fontSize='sm'>{formatDate(message.receivedAt)}</Td>
                                                                        </Tr>
                                                                ))}
                                                        </Tbody>
                                                </Table>
                                        </Box>

                                        {totalPages > 1 && (
                                                <HStack justify='center' spacing={2} mt={4}>
                                                        <IconButton
                                                                aria-label='First page'
                                                                icon={<ChevronLeftIcon />}
                                                                size='sm'
                                                                onClick={() => goToPage(1)}
                                                                isDisabled={currentPage === 1}
                                                                variant='outline'
                                                        />
                                                        <IconButton
                                                                aria-label='Previous page'
                                                                icon={<ChevronLeftIcon />}
                                                                size='sm'
                                                                onClick={() => goToPage(currentPage - 1)}
                                                                isDisabled={currentPage === 1}
                                                        />

                                                        {getPageNumbers().map((page, idx) => (
                                                                typeof page === 'number' ? (
                                                                        <Button
                                                                                key={idx}
                                                                                size='sm'
                                                                                variant={currentPage === page ? 'solid' : 'outline'}
                                                                                colorScheme={currentPage === page ? 'blue' : 'gray'}
                                                                                onClick={() => goToPage(page)}
                                                                        >
                                                                                {page}
                                                                        </Button>
                                                                ) : (
                                                                        <Text key={idx} px={2} color='gray.500'>
                                                                                {page}
                                                                        </Text>
                                                                )
                                                        ))}

                                                        <IconButton
                                                                aria-label='Next page'
                                                                icon={<ChevronRightIcon />}
                                                                size='sm'
                                                                onClick={() => goToPage(currentPage + 1)}
                                                                isDisabled={currentPage === totalPages}
                                                        />
                                                        <IconButton
                                                                aria-label='Last page'
                                                                icon={<ChevronRightIcon />}
                                                                size='sm'
                                                                onClick={() => goToPage(totalPages)}
                                                                isDisabled={currentPage === totalPages}
                                                                variant='outline'
                                                        />
                                                </HStack>
                                        )}

                                        <Text textAlign='center' fontSize='sm' color='gray.600'>
                                                Page {currentPage} of {totalPages} ({startIndex + 1}-{Math.min(endIndex, filteredMessages.length)} of {filteredMessages.length} items)
                                        </Text>
                                </>
                        )}
                </Stack>
        );
};

export default APIPage;
