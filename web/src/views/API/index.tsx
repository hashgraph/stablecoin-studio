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
        receivedAt: string;
}

const APIPage = () => {
        const { t } = useTranslation(['global']);
        const toast = useToast();
        const [messages, setMessages] = useState<WebhookMessage[]>([]);
        const [loading, setLoading] = useState(true);
        const [total, setTotal] = useState(0);

        const publicWebhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/webhook/messages` : 'https://your-domain.replit.dev/webhook/messages';

        const fetchMessages = async () => {
                setLoading(true);
                try {
                        const response = await fetch(`/webhook/messages`);
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

        const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleString();
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
                                                                                <Text fontWeight="bold">{index + 1}</Text>
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
                                                <Text fontSize='sm' color='gray.600'>
                                                        {t('api.totalMessages', { count: total })}
                                                </Text>
                                        </Box>
                                </Box>
                        )}
                </Stack>
        );
};

export default APIPage;
