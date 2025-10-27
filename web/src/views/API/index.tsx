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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [limit] = useState(50);

        const publicWebhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/webhook/messages` : 'https://your-domain.replit.dev/webhook/messages';

        const fetchMessages = async (currentPage: number = page) => {
                setLoading(true);
                try {
                        const apiUrl = typeof window !== 'undefined' 
                                ? window.location.origin 
                                : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000');
                        const response = await fetch(`${apiUrl}/webhook/messages?page=${currentPage}&limit=${limit}`);
                        if (!response.ok) {
                                throw new Error('Failed to fetch messages');
                        }
                        const data = await response.json();
                        setMessages(data.messages || []);
                        setTotal(data.total || 0);
                        setPage(data.page || 1);
                        setTotalPages(data.totalPages || 1);
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
                const interval = setInterval(() => fetchMessages(page), 30000);
                return () => clearInterval(interval);
        }, [page]);

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

        const deleteAllMessages = async () => {
                const apiUrl = typeof window !== 'undefined' 
                        ? window.location.origin 
                        : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000');
                const response = await fetch(`${apiUrl}/webhook/messages`, {
                        method: 'DELETE',
                });
                if (!response.ok) {
                        throw new Error('Failed to delete all messages');
                }
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
                                        <HStack>
                                                <Button onClick={() => fetchMessages(page)} size='sm' colorScheme='blue'>
                                                        {t('api.refresh')}
                                                </Button>
                                                <Button
                                                        colorScheme="red"
                                                        onClick={async () => {
                                                                if (window.confirm('Are you sure you want to delete all webhook messages?')) {
                                                                        try {
                                                                                await deleteAllMessages();
                                                                                await fetchMessages();
                                                                                alert('All messages deleted successfully');
                                                                        } catch (error) {
                                                                                console.error('Error deleting messages:', error);
                                                                                alert('Failed to delete messages');
                                                                        }
                                                                }
                                                        }}
                                                        size='sm'
                                                >
                                                        Delete All
                                                </Button>
                                        </HStack>
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
                        </Box>

                        {loading && messages.length === 0 ? (
                                <Box textAlign='center' p={10}>
                                        <Spinner size='xl' color='blue.500' />
                                        <Text mt={4}>{t('api.loading')}</Text>
                                </Box>
                        ) : messages.length === 0 ? (
                                <Alert status='info' borderRadius='md'>
                                        <AlertIcon />
                                        {t('api.noMessages')}
                                </Alert>
                        ) : (
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
                                                        {messages.map((message, index) => (
                                                                <Tr key={message.dbId}>
                                                                        <Td>
                                                                                <Text fontWeight="bold">{(page - 1) * limit + index + 1}</Text>
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
                                        <Box p={4} borderTop='1px' borderColor='gray.200'>
                                                <HStack justify='space-between' align='center'>
                                                        <Text fontSize='sm' color='gray.600'>
                                                                {t('api.totalMessages', { count: total })} • Page {page} of {totalPages}
                                                        </Text>
                                                        <HStack spacing={2}>
                                                                <Button
                                                                        size='sm'
                                                                        onClick={() => {
                                                                                const newPage = page - 1;
                                                                                setPage(newPage);
                                                                                fetchMessages(newPage);
                                                                        }}
                                                                        isDisabled={page === 1 || loading}
                                                                        colorScheme='blue'
                                                                        variant='outline'
                                                                >
                                                                        Previous
                                                                </Button>
                                                                <Button
                                                                        size='sm'
                                                                        onClick={() => {
                                                                                const newPage = page + 1;
                                                                                setPage(newPage);
                                                                                fetchMessages(newPage);
                                                                        }}
                                                                        isDisabled={page === totalPages || loading}
                                                                        colorScheme='blue'
                                                                        variant='outline'
                                                                >
                                                                        Next
                                                                </Button>
                                                        </HStack>
                                                </HStack>
                                        </Box>
                                </Box>
                        )}
                </Stack>
        );
};

export default APIPage;