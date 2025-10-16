import {
        Box,
        Heading,
        Stack,
        Text,
        Alert,
        AlertIcon,
        AlertTitle,
        AlertDescription,
        Stat,
        StatLabel,
        StatNumber,
        StatGroup,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';
import Plot from 'react-plotly.js';

const MOBILE_MONEY_RESERVE_KEY = 'mobileMoneyLastBalance';

const Analytics = () => {
        const { t } = useTranslation(['global']);
        const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);

        const totalSupply = selectedStableCoin?.totalSupply?.toString() || '0';
        const totalSupplyNumber = parseFloat(totalSupply);

        const mobileMoneyReserveStr = localStorage.getItem(MOBILE_MONEY_RESERVE_KEY);
        const mobileMoneyReserve = mobileMoneyReserveStr ? parseFloat(mobileMoneyReserveStr) : null;

        const hasStableCoin = selectedStableCoin && totalSupplyNumber > 0;
        const hasMobileMoneyReserve = mobileMoneyReserve !== null && mobileMoneyReserve > 0;

        const canShowChart = hasStableCoin && hasMobileMoneyReserve;

        const coverageRatio = canShowChart
                ? ((mobileMoneyReserve! / totalSupplyNumber) * 100).toFixed(2)
                : '0';

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
                                        {t('analytics.title')}
                                </Heading>
                                <Text fontSize='14px' color='gray.600' mb={4}>
                                        {t('analytics.description')}
                                </Text>
                        </Box>

                        {!hasStableCoin && (
                                <Alert status='warning' borderRadius='md'>
                                        <AlertIcon />
                                        <Box>
                                                <AlertTitle>{t('analytics.noStablecoin')}</AlertTitle>
                                                <AlertDescription>
                                                        {t('analytics.selectStablecoin')}
                                                </AlertDescription>
                                        </Box>
                                </Alert>
                        )}

                        {!hasMobileMoneyReserve && (
                                <Alert status='info' borderRadius='md'>
                                        <AlertIcon />
                                        <Box>
                                                <AlertTitle>{t('analytics.noReserve')}</AlertTitle>
                                                <AlertDescription>
                                                        {t('analytics.uploadCSV')}
                                                </AlertDescription>
                                        </Box>
                                </Alert>
                        )}

                        {canShowChart && (
                                <>
                                        <StatGroup>
                                                <Stat>
                                                        <StatLabel>Total Supply (Stablecoin)</StatLabel>
                                                        <StatNumber color='blue.500'>
                                                                {totalSupplyNumber.toLocaleString()} {selectedStableCoin?.symbol}
                                                        </StatNumber>
                                                </Stat>
                                                <Stat>
                                                        <StatLabel>Mobile Money Reserve</StatLabel>
                                                        <StatNumber color='green.500'>
                                                                {mobileMoneyReserve!.toLocaleString()}
                                                        </StatNumber>
                                                </Stat>
                                                <Stat>
                                                        <StatLabel>Coverage Ratio</StatLabel>
                                                        <StatNumber
                                                                color={parseFloat(coverageRatio) >= 100 ? 'green.500' : 'orange.500'}
                                                        >
                                                                {coverageRatio}%
                                                        </StatNumber>
                                                </Stat>
                                        </StatGroup>

                                        <Box bg='white' p={4} borderRadius='md' boxShadow='sm'>
                                                <Heading size='sm' mb={4}>
                                                        {t('analytics.supplyVsReserve')}
                                                </Heading>
                                                <Plot
                                                        data={[
                                                                {
                                                                        values: [totalSupplyNumber, mobileMoneyReserve!],
                                                                        labels: [
                                                                                `Total Supply (${selectedStableCoin?.symbol})`,
                                                                                'Mobile Money Reserve',
                                                                        ],
                                                                        type: 'pie',
                                                                        marker: {
                                                                                colors: ['#3182CE', '#38A169'],
                                                                        },
                                                                        textinfo: 'label+percent+value',
                                                                        hovertemplate: '<b>%{label}</b><br>Amount: %{value:,.0f}<br>Percentage: %{percent}<extra></extra>',
                                                                },
                                                        ]}
                                                        layout={{
                                                                height: 500,
                                                                margin: { t: 20, b: 20, l: 20, r: 20 },
                                                                showlegend: true,
                                                                legend: {
                                                                        orientation: 'h',
                                                                        y: -0.1,
                                                                },
                                                        }}
                                                        config={{
                                                                responsive: true,
                                                                displayModeBar: true,
                                                                displaylogo: false,
                                                        }}
                                                        style={{ width: '100%' }}
                                                />
                                        </Box>

                                        {parseFloat(coverageRatio) < 100 && (
                                                <Alert status='warning' borderRadius='md'>
                                                        <AlertIcon />
                                                        <Box>
                                                                <AlertTitle>{t('analytics.underCollateralized')}</AlertTitle>
                                                                <AlertDescription>
                                                                        {t('analytics.reserveInsufficient')}
                                                                </AlertDescription>
                                                        </Box>
                                                </Alert>
                                        )}

                                        {parseFloat(coverageRatio) >= 100 && (
                                                <Alert status='success' borderRadius='md'>
                                                        <AlertIcon />
                                                        <Box>
                                                                <AlertTitle>{t('analytics.fullyCollateralized')}</AlertTitle>
                                                                <AlertDescription>
                                                                        {t('analytics.reserveSufficient')}
                                                                </AlertDescription>
                                                        </Box>
                                                </Alert>
                                        )}
                                </>
                        )}
                </Stack>
        );
};

export default Analytics;
