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

        const binaryHeatmapData = processedData ? {
                data: [{
                        z: [processedData.binaryActivity],
                        x: processedData.fullIndex.filter(d => d && !isNaN(d.getTime())),
                        y: ['Activity'],
                        type: 'heatmap' as const,
                        colorscale: [[0, GRAY_INACTIVE], [1, GREEN_IN]] as any,
                        showscale: false,
                        hovertemplate: 'Period: %{x|%Y-%m-%d %H:%M}<br>Status: %{z}<extra></extra>',
                        xgap: 1,
                }],
                layout: {
                        height: 140,
                        margin: { l: 60, r: 20, t: 40, b: 40 },
                        title: `Binary activity (${frequency}) from ${processedData.tmin.toLocaleDateString()} to ${processedData.tmax.toLocaleDateString()}`,
                        xaxis: {
                                type: 'date',
                                tickformat: frequency === '1D' ? '%Y-%m-%d' : '%Y-%m-%d\n%H:%M',
                                tickfont: { size: 10 },
                        },
                        yaxis: { visible: false },
                        hovermode: 'closest',
                }
        } : null;

        const balanceFlowsPlot = dailyFlows && processedData ? (() => {
                const validDates = dailyFlows.dates.filter(d => d && !isNaN(d.getTime()));
                const validIndices = dailyFlows.dates
                        .map((d, i) => (d && !isNaN(d.getTime()) ? i : -1))
                        .filter(i => i !== -1);

                const inVals = validIndices.map(i => dailyFlows.inflows[i] || 0);
                const outVals = validIndices.map(i => dailyFlows.outflows[i] || 0);
                const balanceVals = validIndices.map(i => dailyFlows.balance?.[i] || 0);
                const balanceMA7Vals = validIndices.map(i => dailyFlows.balanceMA7?.[i] || 0);

                const barsAbs = [...inVals.map(Math.abs), ...outVals.map(Math.abs)];
                const finite = barsAbs.filter(v => isFinite(v));
                finite.sort((a, b) => a - b);
                const p98Index = Math.floor(finite.length * 0.98);
                const cap = Math.max(finite[p98Index] || 1, 1);

                const balanceMin = Math.min(...balanceVals.filter(isFinite));
                const balanceMax = Math.max(...balanceVals.filter(isFinite));
                const balancePad = (balanceMax - balanceMin) * 0.05 || 1;

                const step = Math.max(1, Math.floor(validDates.length / 8));
                const tickIndices = [];
                for (let i = 0; i < validDates.length; i += step) {
                        tickIndices.push(i);
                }
                const tickDates = tickIndices.map(i => validDates[i]);
                const tickLabels = tickDates.map(d => d.toLocaleDateString());

                return {
                        data: [
                                {
                                        x: validDates,
                                        y: balanceVals,
                                        type: 'scatter' as const,
                                        mode: 'lines' as const,
                                        name: 'Balance (halo)',
                                        line: { color: 'rgba(255,255,255,0.15)', width: 6 },
                                        hoverinfo: 'skip',
                                        xaxis: 'x',
                                        yaxis: 'y',
                                        showlegend: false,
                                },
                                {
                                        x: validDates,
                                        y: balanceVals,
                                        type: 'scatter' as const,
                                        mode: 'lines' as const,
                                        name: 'Balance',
                                        line: { color: CYAN_BALANCE, width: 2.5 },
                                        hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Balance: %{y:,.2f}<extra></extra>',
                                        xaxis: 'x',
                                        yaxis: 'y',
                                },
                                {
                                        x: validDates,
                                        y: balanceMA7Vals,
                                        type: 'scatter' as const,
                                        mode: 'lines' as const,
                                        name: 'Balance (7-day MA)',
                                        line: { color: CYAN_BALANCE, width: 1.5, dash: 'dot' as any },
                                        hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Balance (MA7): %{y:,.2f}<extra></extra>',
                                        xaxis: 'x',
                                        yaxis: 'y',
                                },
                                {
                                        x: validDates,
                                        y: inVals,
                                        type: 'bar' as const,
                                        name: 'Inflows',
                                        marker: { color: GREEN_IN, opacity: 0.6 },
                                        hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Inflows: %{y:,.2f}<extra></extra>',
                                        xaxis: 'x2',
                                        yaxis: 'y2',
                                },
                                {
                                        x: validDates,
                                        y: outVals.map(v => -Math.abs(v)),
                                        type: 'bar' as const,
                                        name: 'Outflows',
                                        marker: { color: RED_OUT, opacity: 0.6 },
                                        customdata: outVals.map(Math.abs),
                                        hovertemplate: 'Date: %{x|%Y-%m-%d}<br>Outflows: %{customdata:,.2f}<extra></extra>',
                                        xaxis: 'x2',
                                        yaxis: 'y2',
                                },
                        ],
                        layout: {
                                height: 600,
                                margin: { l: 60, r: 60, t: 60, b: 100 },
                                title: 'Balance & daily flows (readable view)',
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
                                },
                                yaxis: {
                                        domain: [0.55, 1],
                                        anchor: 'x',
                                        title: 'Balance',
                                        range: [balanceMin - balancePad, balanceMax + balancePad],
                                },
                                xaxis2: {
                                        domain: [0, 1],
                                        anchor: 'y2',
                                        type: 'date',
                                        tickmode: 'array',
                                        tickvals: tickDates,
                                        ticktext: tickLabels,
                                        tickfont: { size: 10 },
                                        rangeslider: { visible: true },
                                },
                                yaxis2: {
                                        domain: [0, 0.45],
                                        anchor: 'x2',
                                        title: 'Daily amounts (inflows + / outflows -)',
                                        range: [-cap * 1.1, cap * 1.1],
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
                        }
                };
        })() : null;

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

                        {binaryHeatmapData && (
                                <Box
                                        p={4}
                                        border='1px'
                                        borderColor='brand.black'
                                        borderRadius='8px'
                                        bg='brand.white'
                                >
                                        <Plot
                                                data={binaryHeatmapData.data as any}
                                                layout={binaryHeatmapData.layout as any}
                                                config={{ responsive: true }}
                                                style={{ width: '100%' }}
                                                useResizeHandler={true}
                                        />
                                </Box>
                        )}

                        {balanceFlowsPlot && (
                                <Box
                                        p={4}
                                        border='1px'
                                        borderColor='brand.black'
                                        borderRadius='8px'
                                        bg='brand.white'
                                >
                                        <Plot
                                                data={balanceFlowsPlot.data as any}
                                                layout={balanceFlowsPlot.layout as any}
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
