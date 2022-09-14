import {
	Tabs as ChakraTabs,
	TabsProps as ChakraTabsProps,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Text,
	Box,
	Divider,
	Flex,
	Button,
	VStack,
} from '@chakra-ui/react';
import { MouseEvent, ReactNode, useState } from 'react';

export interface OptionBaseTabProps {
	number: string;
	title: string;
	complete: boolean;
	children: ReactNode;
}

interface BaseTabsProps extends Omit<ChakraTabsProps, 'children'> {
	options: OptionBaseTabProps[];
	textDefaultButtonPrimary?: string;
	textLastButtonPrimary?: string;
	textDefaultButtonSecondary?: string;
	textFirstButtonSecondary?: string;
	handleFirstButtonSecondary: () => void;
	handleLastButtonPrimary: () => void;
}

const Tabs = (props: BaseTabsProps) => {
	const {
		options,
		textDefaultButtonPrimary,
		textLastButtonPrimary,
		textDefaultButtonSecondary,
		textFirstButtonSecondary,
		handleFirstButtonSecondary,
		handleLastButtonPrimary,
	} = props;

	const [tabIndex, setTabIndex] = useState(0);

	const handleStep = (e: MouseEvent<HTMLButtonElement>, index: number, type: string) => {
		e.preventDefault();

		return type === 'next' ? setTabIndex(index + 1) : setTabIndex(index - 1);
	};

	return (
		<ChakraTabs
			isFitted
			isLazy
			variant='simple'
			index={tabIndex}
			onChange={(index) => setTabIndex(index)}
			position='relative'
			h='full'
		>
			<TabList justifyContent='space-between'>
				{options.map((option, index) => {
					const { title, number } = option;

					const currentTab = tabIndex === index;

					return (
						<Tab key={index} p='15px'>
							<Text
								data-testid={`tabs-tab-number-${index + 1}`}
								fontSize='14px'
								color={currentTab ? 'brand.primary' : 'brand.gray600'}
								mr='10px'
							>
								{number}
							</Text>
							<Text
								data-testid={`tabs-tab-title-${index + 1}`}
								fontSize='14px'
								color='brand.gray600'
							>
								{title}
							</Text>
						</Tab>
					);
				})}
			</TabList>

			<TabPanels h='calc(100% - 55px)' bgColor='brand.gray100'>
				{options.map((option, index) => {
					const { children } = option;

					const firstTab = index === 0;
					const lastTab = index === options.length - 1;

					return (
						<TabPanel
							data-testid={`tabs-tabpanel-container-${index + 1}`}
							h='full'
							p='0px'
							key={index}
						>
							<VStack h='full' spacing={4} align='stretch'>
								<Box h='calc(100% - 85px)' overflowY='auto'>
									{children}
								</Box>
								<Box h='88px'>
									<Divider color='brand.gray2' />
									<Flex p='0px 24px' justifyContent='flex-end' h='99%' alignItems='center'>
										<Button
											data-testid={`tabs-tabpanel-button-secondary-${index + 1}`}
											variant='secondary'
											mr='20px'
											onClick={
												firstTab ? handleFirstButtonSecondary : (e) => handleStep(e, index, 'prev')
											}
										>
											{firstTab
												? textFirstButtonSecondary || 'Cancel'
												: textDefaultButtonSecondary || 'Go back'}
										</Button>
										<Button
											data-testid={`tabs-tabpanel-button-primary-${index + 1}`}
											variant='primary'
											onClick={
												lastTab ? handleLastButtonPrimary : (e) => handleStep(e, index, 'next')
											}
										>
											{lastTab
												? textLastButtonPrimary || 'Finish'
												: textDefaultButtonPrimary || 'Next step'}
										</Button>
									</Flex>
								</Box>
							</VStack>
						</TabPanel>
					);
				})}
			</TabPanels>
		</ChakraTabs>
	);
};

export default Tabs;
