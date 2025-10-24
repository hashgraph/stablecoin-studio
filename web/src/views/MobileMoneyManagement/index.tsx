import {
        Box,
        Heading,
        Stack,
        Text,
        Select,
        Input,
        HStack,
        Stat,
        StatLabel,
        StatNumber,
        StatHelpText,
        useToast,
        Button,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import Plot from 'react-plotly.js';
import { parseCSV, TX_TYPES, TX_COLORS } from '../../utils/mobileMoneyUtils';
import type { TransactionRow } from '../../utils/mobileMoneyUtils';
import {
        processCSVActivity,
        getBinaryActivityStats,
        computeDailyFlows,
        computeTypeMatrix,
        computeTypeHistogram,
        type FrequencyLabel,
        type ProcessedData,
        type ActivityStats,
        type DailyFlows,
        type TypeHistogramData,
} from '../../utils/csvProcessor';
import { fetchWebhookTransactions } from '../../utils/webhookDataAdapter';

const GREEN_IN = '#2ECC71';
const RED_OUT = '#E53935';
const CYAN_BALANCE = '#00E5FF';
const GRAY_INACTIVE = '#C7C7C7';

const MobileMoneyManagement = () => {
        const { t } = useTranslation(['global']);
        const toast = useToast();
        
        const [transactions, setTransactions] = useState<TransactionRow[]>([]);
        const [frequency, setFrequency] = useState<FrequencyLabel>('1D');
        const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
        const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
        const [dailyFlows, setDailyFlows] = useState<DailyFlows | null>(null);
        const [typeMatrix, setTypeMatrix] = useState<number[][] | null>(null);
        const [typeHistogram, setTypeHistogram] = useState<TypeHistogramData | null>(null);
        const [isLoading, setIsLoading] = useState(false);
        const [dataSource, setDataSource] = useState<'webhooks' | 'csv'>('webhooks');

        useEffect(() => {
                handleLoadFromWebhooks();
        }, []);

        const handleLoadFromWebhooks = async () => {
                setIsLoading(true);
                try {
                        const webhookTransactions = await fetchWebhookTransactions();
                        
                        if (webhookTransactions.length === 0) {
                                toast({
                                        title: 'No webhook data',
                                        description: 'No webhook messages found. You can upload a CSV file instead.',
                                        status: 'info',
                                        duration: 5000,
                                        isClosable: true,
                                });
                                setIsLoading(false);
                                return;
                        }

                        setTransactions(webhookTransactions);
                        setDataSource('webhooks');
                        processData(webhookTransactions, frequency);
                        
                        toast({
                                title: 'Webhook data loaded',
                                description: `${webhookTransactions.length} transactions loaded from API webhooks`,
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                        });
                } catch (error) {
                        toast({
                                title: 'Failed to load webhooks',
                                description: error instanceof Error ? error.message : 'Could not fetch webhook data',
                                status: 'error',
                                duration: 5000,
                                isClosable: true,
                        });
                } finally {
                        setIsLoading(false);
                }
        };

        const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0];
                if (!file) return;

                try {
                        const text = await file.text();
                        const parsedTransactions = parseCSV(text);
                        setTransactions(parsedTransactions);
                        setDataSource('csv');
                        
                        processData(parsedTransactions, frequency);
                        
                        toast({
                                title: t('mobileMoney.csvLoaded'),
                                description: `${parsedTransactions.length} transactions loaded from CSV`,
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                        });
                } catch (error) {
                        toast({
                                title: t('mobileMoney.csvError'),
                                description: error instanceof Error ? error.message : 'Failed to parse CSV',
                                status: 'error',
                                duration: 5000,
                                isClosable: true,
                        });
                }
        };

        const processData = (txs: TransactionRow[], freq: FrequencyLabel) => {
                if (txs.length === 0) return;

                try {
                        const processed = processCSVActivity(txs, freq);
                        const stats = getBinaryActivityStats(
                                processed.binaryActivity,
                                processed.tmin,
                                processed.tmax,
                                freq
                        );
                        const flows = computeDailyFlows(txs);
                        const matrix = computeTypeMatrix(txs, processed.fullIndex, freq, TX_TYPES);
                        const histogram = computeTypeHistogram(txs, processed.fullIndex, freq, TX_TYPES);

                        setProcessedData(processed);
                        setActivityStats(stats);
                        setDailyFlows(flows);
                        setTypeMatrix(matrix);
                        setTypeHistogram(histogram);

                        if (flows.balance && flows.balance.length > 0) {
                                const lastBalance = flows.balance[flows.balance.length - 1];
                                localStorage.setItem('mobileMoneyLastBalance', lastBalance.toString());
                                console.log('📊 Stored last Mobile Money balance:', lastBalance);
                        }
                } catch (error) {
                        toast({
                                title: 'Processing Error',
                                description: error instanceof Error ? error.message : 'Failed to process data',
                                status: 'error',
                                duration: 5000,
                                isClosable: true,
                        });
                }
        };

        const handleFrequencyChange = (newFreq: FrequencyLabel) => {
                setFrequency(newFreq);
                if (transactions.length > 0) {
                        processData(transactions, newFreq);
                }
        };

        return (
                <Stack spacing={6} maxW='100%'>
                        <Box>
                                <Heading
                                        fontSize='16px'
                                        fontWeight='600'
                                        mb={4}
                                        lineHeight='15.2px'
                                        textAlign='left'
                                >
                                        {t('mobileMoney.title')}
                                </Heading>
                                <Text fontSize='14px' color='gray.600' mb={4}>
                                        {t('mobileMoney.description')}
                                </Text>
                        </Box>

                        <HStack spacing={4} alignItems='flex-end' flexWrap='wrap'>
                                <Box>
                                        <Text fontSize='14px' fontWeight='500' mb={2}>
                                                Data Source
                                        </Text>
                                        <Button
                                                colorScheme={dataSource === 'webhooks' ? 'blue' : 'gray'}
                                                onClick={handleLoadFromWebhooks}
                                                isLoading={isLoading}
                                                loadingText='Loading...'
                                        >
                                                Load from API Webhooks
                                        </Button>
                                </Box>
                                <Box flex={1} minW='200px'>
                                        <Text fontSize='14px' fontWeight='500' mb={2}>
                                                Or upload CSV (legacy)
                                        </Text>
                                        <Input
                                                type='file'
                                                accept='.csv'
                                                onChange={handleFileUpload}
                                                p={1}
                                                size='sm'
                                        />
                                </Box>
                                <Box>
                                        <Text fontSize='14px' fontWeight='500' mb={2}>
                                                {t('mobileMoney.frequency')}
                                        </Text>
                                        <Select
                                                value={frequency}
                                                onChange={(e) => handleFrequencyChange(e.target.value as FrequencyLabel)}
                                                width='150px'
                                        >
                                                <option value='15min'>15 min</option>
                                                <option value='30min'>30 min</option>
                                                <option value='1H'>1 hour</option>
                                                <option value='6H'>6 hours</option>
                                                <option value='1D'>1 day</option>
                                        </Select>
                                </Box>
                        </HStack>

                        {activityStats && (
                                <Box
                                        p={4}
                                        border='1px'
                                        borderColor='brand.black'
                                        borderRadius='8px'
                                        bg='brand.white'
                                >
                                        <Heading fontSize='14px' fontWeight='600' mb={3}>
                                                {t('mobileMoney.activityStats')}
                                        </Heading>
                                        <HStack spacing={6} flexWrap='wrap'>
                                                <Stat>
                                                        <StatLabel>{t('mobileMoney.totalSlots')}</StatLabel>
                                                        <StatNumber>{activityStats.totalSlots}</StatNumber>
                                                        <StatHelpText>{activityStats.granularity}</StatHelpText>
                                                </Stat>
                                                <Stat>
                                                        <StatLabel>{t('mobileMoney.activeSlots')}</StatLabel>
                                                        <StatNumber>{activityStats.activeSlots}</StatNumber>
                                                </Stat>
                                                <Stat>
                                                        <StatLabel>{t('mobileMoney.inactiveSlots')}</StatLabel>
                                                        <StatNumber>{activityStats.inactive}</StatNumber>
                                                </Stat>
                                        </HStack>
                                </Box>
                        )}

                        {processedData && (
                                <Box
                                        p={4}
                                        border='1px'
                                        borderColor='brand.black'
                                        borderRadius='8px'
                                        bg='brand.white'
                                >
                                        <Plot
                                                data={[
                                                        {
                                                                z: [processedData.binaryActivity],
                                                                x: processedData.fullIndex.map(d => d.toISOString()),
                                                                y: ['Activity'],
                                                                type: 'heatmap',
                                                                colorscale: [[0, GRAY_INACTIVE], [1, GREEN_IN]],
                                                                showscale: false,
                                                                hovertemplate: 'Period: %{x}<br>Status: %{z}<extra></extra>',
                                                                xgap: 1,
                                                        },
                                                ]}
                                                layout={{
                                                        height: 140,
                                                        margin: { l: 60, r: 20, t: 40, b: 40 },
                                                        title: `Binary activity (${frequency})`,
                                                        xaxis: {
                                                                type: 'date',
                                                                tickformat: frequency === '1D' ? '%Y-%m-%d' : '%Y-%m-%d %H:%M',
                                                        },
                                                        yaxis: { visible: false },
                                                }}
                                                config={{ responsive: true }}
                                                style={{ width: '100%' }}
                                        />
                                </Box>
                        )}

                        {processedData && typeMatrix && (
                                <Box
                                        p={4}
                                        border='1px'
                                        borderColor='brand.black'
                                        borderRadius='8px'
                                        bg='brand.white'
                                >
                                        <Plot
                                                data={TX_TYPES.map((txType, idx) => ({
                                                        z: [typeMatrix[idx]],
                                                        x: processedData.fullIndex.map(d => d.toISOString()),
                                                        y: [txType.replace(/_/g, ' ')],
                                                        type: 'heatmap' as const,
                                                        colorscale: [[0, '#eeeeee'], [1, TX_COLORS[txType]]],
                                                        showscale: false,
                                                        zmin: 0,
                                                        zmax: 1,
                                                        hovertemplate: `Type: ${txType.replace(/_/g, ' ')}<br>Period: %{x|%Y-%m-%d %H:%M}<br>Present: %{z}<extra></extra>`,
                                                        xgap: 1,
                                                }))}
                                                layout={{
                                                        height: 38 * TX_TYPES.length + 70,
                                                        margin: { l: 100, r: 20, t: 40, b: 40 },
                                                        title: 'Transaction heatmap by type',
                                                        xaxis: {
                                                                type: 'date',
                                                                tickformat: frequency === '1D' ? '%Y-%m-%d' : '%Y-%m-%d %H:%M',
                                                        },
                                                        yaxis: {
                                                                tickmode: 'array',
                                                                tickvals: TX_TYPES.map((t) => t.replace(/_/g, ' ')),
                                                                ticktext: TX_TYPES.map((t) => t.replace(/_/g, ' ')),
                                                        },
                                                }}
                                                config={{ responsive: true }}
                                                style={{ width: '100%' }}
                                        />
                                </Box>
                        )}

                        {processedData && typeHistogram && (
                                <Box
                                        p={4}
                                        border='1px'
                                        borderColor='brand.black'
                                        borderRadius='8px'
                                        bg='brand.white'
                                >
                                        <Plot
                                                data={TX_TYPES.map((txType) => {
                                                        const counts = typeHistogram.typeCounts.get(txType) || [];
                                                        return {
                                                                x: typeHistogram.dates.map(d => d.toISOString()),
                                                                y: counts,
                                                                type: 'bar' as const,
                                                                name: txType.replace(/_/g, ' '),
                                                                marker: { color: TX_COLORS[txType] },
                                                                hovertemplate: `%{fullData.name}<br>%{x|%Y-%m-%d %H:%M}<br>Count: %{y}<extra></extra>`,
                                                        };
                                                })}
                                                layout={{
                                                        barmode: 'stack',
                                                        height: 400,
                                                        margin: { l: 60, r: 20, t: 50, b: 60 },
                                                        title: 'Stacked histogram of transactions by type',
                                                        xaxis: {
                                                                type: 'date',
                                                                tickformat: frequency === '1D' ? '%Y-%m-%d' : '%Y-%m-%d %H:%M',
                                                                title: 'Period',
                                                        },
                                                        yaxis: {
                                                                title: 'Number of transactions',
                                                        },
                                                }}
                                                config={{ responsive: true }}
                                                style={{ width: '100%' }}
                                        />
                                </Box>
                        )}

                        {dailyFlows && dailyFlows.balance && dailyFlows.balance.length > 0 && (
                                <Box
                                        p={4}
                                        border='1px'
                                        borderColor='brand.black'
                                        borderRadius='8px'
                                        bg='brand.white'
                                >
                                        <Plot
                                                data={[
                                                        {
                                                                x: dailyFlows.dates.map(d => d.toISOString()),
                                                                y: dailyFlows.balance,
                                                                type: 'scatter',
                                                                mode: 'lines',
                                                                name: 'Balance (halo)',
                                                                line: { color: 'rgba(255,255,255,0.15)', width: 6 },
                                                                hoverinfo: 'skip',
                                                                xaxis: 'x',
                                                                yaxis: 'y',
                                                                showlegend: false,
                                                        },
                                                        {
                                                                x: dailyFlows.dates.map(d => d.toISOString()),
                                                                y: dailyFlows.balance,
                                                                type: 'scatter',
                                                                mode: 'lines',
                                                                name: 'Balance',
                                                                line: { color: CYAN_BALANCE, width: 2.5 },
                                                                hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Balance: %{y:,.0f}<extra></extra>',
                                                                xaxis: 'x',
                                                                yaxis: 'y',
                                                        },
                                                        {
                                                                x: dailyFlows.dates.map(d => d.toISOString()),
                                                                y: dailyFlows.balanceMA7,
                                                                type: 'scatter',
                                                                mode: 'lines',
                                                                name: 'Balance (7-day MA)',
                                                                line: { color: CYAN_BALANCE, width: 1.5, dash: 'dot' },
                                                                hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Balance (MA7): %{y:,.0f}<extra></extra>',
                                                                xaxis: 'x',
                                                                yaxis: 'y',
                                                        },
                                                        {
                                                                x: dailyFlows.dates.map(d => d.toISOString()),
                                                                y: dailyFlows.inflows,
                                                                type: 'bar',
                                                                name: 'Inflows',
                                                                marker: { color: GREEN_IN, opacity: 0.6 },
                                                                hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Inflows: %{y:,.0f}<extra></extra>',
                                                                xaxis: 'x2',
                                                                yaxis: 'y2',
                                                        },
                                                        {
                                                                x: dailyFlows.dates.map(d => d.toISOString()),
                                                                y: dailyFlows.outflows,
                                                                type: 'bar',
                                                                name: 'Outflows',
                                                                marker: { color: RED_OUT, opacity: 0.6 },
                                                                hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Outflows: %{y:,.0f}<extra></extra>',
                                                                xaxis: 'x2',
                                                                yaxis: 'y2',
                                                        },
                                                ]}
                                                layout={{
                                                        height: 600,
                                                        margin: { l: 60, r: 60, t: 60, b: 100 },
                                                        title: 'Balance & daily flows',
                                                        grid: {
                                                                rows: 2,
                                                                columns: 1,
                                                                subplots: [['xy'], ['x2y2']],
                                                                roworder: 'top to bottom',
                                                        },
                                                        xaxis: {
                                                                domain: [0, 1],
                                                                anchor: 'y',
                                                                showgrid: false,
                                                                showticklabels: false,
                                                                type: 'date',
                                                        },
                                                        yaxis: {
                                                                domain: [0.55, 1],
                                                                anchor: 'x',
                                                                title: { text: 'Balance' },
                                                        },
                                                        xaxis2: {
                                                                domain: [0, 1],
                                                                anchor: 'y2',
                                                                type: 'date',
                                                                tickformat: '%Y-%m-%d',
                                                                rangeslider: { visible: true },
                                                        },
                                                        yaxis2: {
                                                                domain: [0, 0.45],
                                                                anchor: 'x2',
                                                                title: { text: 'Daily amounts' },
                                                                zeroline: true,
                                                        },
                                                        hovermode: 'x unified',
                                                        legend: {
                                                                orientation: 'h',
                                                                yanchor: 'bottom',
                                                                y: 1.04,
                                                                xanchor: 'right',
                                                                x: 1,
                                                        },
                                                }}
                                                config={{ responsive: true }}
                                                style={{ width: '100%' }}
                                        />
                                </Box>
                        )}
                </Stack>
        );
};

export default MobileMoneyManagement;
