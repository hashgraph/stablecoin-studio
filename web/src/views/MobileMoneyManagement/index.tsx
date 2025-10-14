import {
	Box,
	Heading,
	Stack,
	Text,
	Select,
	Input,
	VStack,
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
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
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

	const activityChartData = processedData?.fullIndex.map((date, index) => ({
		date: date.toLocaleString(),
		activity: processedData.binaryActivity[index],
	})) || [];

	const flowsChartData = dailyFlows?.dates.map((date, index) => ({
		date: date.toLocaleDateString(),
		inflows: dailyFlows.inflows[index],
		outflows: dailyFlows.outflows[index],
		balance: dailyFlows.balance?.[index],
		balanceMA7: dailyFlows.balanceMA7?.[index],
	})) || [];

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

			{activityChartData.length > 0 && (
				<Box
					p={4}
					border='1px'
					borderColor='brand.black'
					borderRadius='8px'
					bg='brand.white'
				>
					<Heading fontSize='14px' fontWeight='600' mb={4}>
						{t('mobileMoney.activityChart')}
					</Heading>
					<ResponsiveContainer width='100%' height={300}>
						<BarChart data={activityChartData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis
								dataKey='date'
								tick={{ fontSize: 12 }}
								interval='preserveStartEnd'
							/>
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar dataKey='activity' fill='#8884d8' name='Activity' />
						</BarChart>
					</ResponsiveContainer>
				</Box>
			)}

			{flowsChartData.length > 0 && (
				<VStack spacing={4} width='100%'>
					<Box
						w='100%'
						p={4}
						border='1px'
						borderColor='brand.black'
						borderRadius='8px'
						bg='brand.white'
					>
						<Heading fontSize='14px' fontWeight='600' mb={4}>
							{t('mobileMoney.flowsChart')}
						</Heading>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart data={flowsChartData}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis
									dataKey='date'
									tick={{ fontSize: 12 }}
									interval='preserveStartEnd'
								/>
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey='inflows' fill='#82ca9d' name='Inflows' />
								<Bar dataKey='outflows' fill='#ff6b6b' name='Outflows' />
							</BarChart>
						</ResponsiveContainer>
					</Box>

					{dailyFlows?.balance && (
						<Box
							w='100%'
							p={4}
							border='1px'
							borderColor='brand.black'
							borderRadius='8px'
							bg='brand.white'
						>
							<Heading fontSize='14px' fontWeight='600' mb={4}>
								{t('mobileMoney.balanceChart')}
							</Heading>
							<ResponsiveContainer width='100%' height={300}>
								<LineChart data={flowsChartData}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis
										dataKey='date'
										tick={{ fontSize: 12 }}
										interval='preserveStartEnd'
									/>
									<YAxis />
									<Tooltip />
									<Legend />
									<Line
										type='monotone'
										dataKey='balance'
										stroke='#8884d8'
										name='Balance'
									/>
									<Line
										type='monotone'
										dataKey='balanceMA7'
										stroke='#82ca9d'
										name='Balance MA7'
									/>
								</LineChart>
							</ResponsiveContainer>
						</Box>
					)}
				</VStack>
			)}
		</Stack>
	);
};

export default MobileMoneyManagement;
