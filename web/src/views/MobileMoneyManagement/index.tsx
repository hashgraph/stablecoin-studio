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
} from '@chakra-ui/react';
import { useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import Plot from 'react-plotly.js';
import { parseCSV } from '../../utils/mobileMoneyUtils';
import type { TransactionRow } from '../../utils/mobileMoneyUtils';
import {
        processCSVActivity,
        getBinaryActivityStats,
        computeDailyFlows,
        type FrequencyLabel,
        type ProcessedData,
        type ActivityStats,
        type DailyFlows,
} from '../../utils/csvProcessor';

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

        const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0];
                if (!file) return;

                try {
                        const text = await file.text();
                        const parsedTransactions = parseCSV(text);
                        setTransactions(parsedTransactions);
                        
                        processData(parsedTransactions, frequency);
                        
                        toast({
                                title: t('mobileMoney.csvLoaded'),
                                description: `${parsedTransactions.length} transactions loaded`,
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

                        setProcessedData(processed);
                        setActivityStats(stats);
                        setDailyFlows(flows);
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

        const binaryHeatmapData = processedData ? [{
                z: [processedData.binaryActivity],
                x: processedData.fullIndex.map(d => d.toISOString()),
                y: ['Activity'],
                type: 'heatmap' as const,
                colorscale: [[0, GRAY_INACTIVE], [1, GREEN_IN]] as any,
                showscale: false,
                hovertemplate: 'Period: %{x}<br>Status: %{z}<extra></extra>',
                xgap: 1,
        }] : [];

        const balanceFlowsData = dailyFlows && processedData ? [
                {
                        x: dailyFlows.dates.map(d => d.toISOString()),
                        y: dailyFlows.balance || [],
                        type: 'scatter' as const,
                        mode: 'lines' as const,
                        name: 'Balance',
                        line: { color: CYAN_BALANCE, width: 2.5 },
                        yaxis: 'y2',
                        hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Balance: %{y:,.2f}<extra></extra>',
                },
                {
                        x: dailyFlows.dates.map(d => d.toISOString()),
                        y: dailyFlows.balanceMA7 || [],
                        type: 'scatter' as const,
                        mode: 'lines' as const,
                        name: 'Balance (7-day MA)',
                        line: { color: CYAN_BALANCE, width: 1.5, dash: 'dot' as any },
                        yaxis: 'y2',
                        hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Balance (MA7): %{y:,.2f}<extra></extra>',
                },
                {
                        x: dailyFlows.dates.map(d => d.toISOString()),
                        y: dailyFlows.inflows,
                        type: 'bar' as const,
                        name: 'Inflows',
                        marker: { color: GREEN_IN },
                        yaxis: 'y',
                        hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Inflows: %{y:,.2f}<extra></extra>',
                },
                {
                        x: dailyFlows.dates.map(d => d.toISOString()),
                        y: dailyFlows.outflows.map(v => -Math.abs(v)),
                        type: 'bar' as const,
                        name: 'Outflows',
                        marker: { color: RED_OUT },
                        yaxis: 'y',
                        hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Outflows: %{y:,.2f}<extra></extra>',
                },
        ] : [];

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

                        <HStack spacing={4} alignItems='flex-end'>
                                <Box flex={1}>
                                        <Text fontSize='14px' fontWeight='500' mb={2}>
                                                {t('mobileMoney.uploadCSV')}
                                        </Text>
                                        <Input
                                                type='file'
                                                accept='.csv'
                                                onChange={handleFileUpload}
                                                p={1}
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

                        {binaryHeatmapData.length > 0 && (
                                <Box
                                        p={4}
                                        border='1px'
                                        borderColor='brand.black'
                                        borderRadius='8px'
                                        bg='brand.white'
                                >
                                        <Heading fontSize='14px' fontWeight='600' mb={4}>
                                                Binary Activity Heatmap ({frequency})
                                        </Heading>
                                        <Plot
                                                data={binaryHeatmapData as any}
                                                layout={{
                                                        height: 140,
                                                        margin: { l: 60, r: 20, t: 20, b: 40 },
                                                        xaxis: {
                                                                type: 'date',
                                                                tickformat: frequency === '1D' ? '%Y-%m-%d' : '%Y-%m-%d\n%H:%M',
                                                                tickfont: { size: 10 },
                                                        },
                                                        yaxis: { visible: false },
                                                        hovermode: 'closest',
                                                }}
                                                config={{ responsive: true }}
                                                style={{ width: '100%' }}
                                                useResizeHandler={true}
                                        />
                                </Box>
                        )}

                        {balanceFlowsData.length > 0 && (
                                <Box
                                        p={4}
                                        border='1px'
                                        borderColor='brand.black'
                                        borderRadius='8px'
                                        bg='brand.white'
                                >
                                        <Heading fontSize='14px' fontWeight='600' mb={4}>
                                                Balance & Daily Flows
                                        </Heading>
                                        <Plot
                                                data={balanceFlowsData as any}
                                                layout={{
                                                        height: 500,
                                                        margin: { l: 60, r: 60, t: 20, b: 40 },
                                                        xaxis: {
                                                                type: 'date',
                                                                tickformat: '%Y-%m-%d',
                                                                tickfont: { size: 10 },
                                                        },
                                                        yaxis: {
                                                                title: 'Daily Flows (Inflows + / Outflows -)',
                                                                side: 'left',
                                                        },
                                                        yaxis2: {
                                                                title: 'Balance',
                                                                side: 'right',
                                                                overlaying: 'y',
                                                        },
                                                        barmode: 'relative',
                                                        hovermode: 'x unified',
                                                        legend: {
                                                                orientation: 'h',
                                                                yanchor: 'bottom',
                                                                y: 1.02,
                                                                xanchor: 'right',
                                                                x: 1,
                                                        },
                                                }}
                                                config={{ responsive: true }}
                                                style={{ width: '100%' }}
                                                useResizeHandler={true}
                                        />
                                </Box>
                        )}
                </Stack>
        );
};

export default MobileMoneyManagement;
