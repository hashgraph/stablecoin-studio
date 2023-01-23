import {
	Tabs as ChakraTabs,
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
import type { MouseEvent, ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export interface Step {
	number: string;
	title: string;
	children: ReactNode;
}

interface StepperProps {
	isValid: boolean;
	steps: Step[];
	textDefaultButtonPrimary?: string;
	textLastButtonPrimary?: string;
	textDefaultButtonSecondary?: string;
	textFirstButtonSecondary?: string;
	currentStep: number;
	setCurrentStep: (arg0: number) => void;
	handleFirstButtonSecondary: () => void;
	handleLastButtonPrimary: () => void;
}

interface StepperFormProps {
	form: UseFormReturn;
}

const FOOTER_HEIGHT = '88px';

const Stepper = (props: StepperProps, formProps: StepperFormProps) => {
	const { t } = useTranslation('global');

	const {
		isValid,
		steps,
		textDefaultButtonPrimary = t('stepper.nextStep'),
		textLastButtonPrimary = t('stepper.finish'),
		textDefaultButtonSecondary = t('stepper.goBack'),
		textFirstButtonSecondary = t('common.cancel'),
		currentStep,
		setCurrentStep,
		handleFirstButtonSecondary,
		handleLastButtonPrimary,
	} = props;

	const {
		form
	} = formProps;

	const supplyKey = form;
console.log(`supplykey: ${supplyKey}`);


	const handleStep = (e: MouseEvent<HTMLButtonElement>, index: number, type: 'next' | 'prev') => {
		e.preventDefault();

		return type === 'next' ? setCurrentStep(index + 1) : setCurrentStep(index - 1);
		// return type === 'next' ? setCurrentStep(index + 1) : index === 4 ? setCurrentStep(2) : setCurrentStep(index - 1);
	};

	return (
		<ChakraTabs isFitted isLazy variant='simple' index={currentStep} position='relative' h='full'>
			<TabList justifyContent='space-between'>
				{steps.map((step, index) => {
					const { title, number } = step;

					const isCurrentStep = currentStep === index;

					const handleChangeTab = () => {
						setCurrentStep(index);
					};

					return (
						<Tab
							key={index}
							p='15px'
							// isDisabled={index === 3}
							isDisabled={index > currentStep}
							onClick={handleChangeTab}
							_hover={{
								cursor: index < currentStep ? 'pointer' : 'default',
							}}
						>
							<Text
								data-testid={`stepper-step-number-${index + 1}`}
								fontSize='14px'
								color={isCurrentStep ? 'brand.primary' : 'brand.gray600'}
								mr='10px'
							>
								{number}
							</Text>
							<Text
								data-testid={`stepper-step-title-${index + 1}`}
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
				{steps.map((step, index) => {
					const { children } = step;

					const isFirstStep = index === 0;
					const isLastStep = index === steps.length - 1;

					return (
						<TabPanel
							data-testid={`stepper-step-panel-container-${index + 1}`}
							h='full'
							p='0px'
							key={index}
						>
							<VStack h='full' spacing={4} align='stretch'>
								<Flex flex={1} justify='center' overflowY='auto'>
									{children}
								</Flex>
								<Box h={FOOTER_HEIGHT}>
									<Divider color='brand.gray2' />
									<Flex p='0px 24px' justifyContent='flex-end' h='99%' alignItems='center'>
										<Button
											data-testid={`stepper-step-panel-button-secondary-${index + 1}`}
											variant='secondary'
											mr='20px'
											onClick={
												isFirstStep
													? handleFirstButtonSecondary
													: (e) => handleStep(e, index, 'prev')
											}
										>
											{isFirstStep ? textFirstButtonSecondary : textDefaultButtonSecondary}
										</Button>
										<Button
											data-testid={`stepper-step-panel-button-primary-${index + 1}`}
											disabled={!isValid}
											variant='primary'
											onClick={
												isLastStep ? handleLastButtonPrimary : (e) => handleStep(e, index, 'next')
											}
										>
											{isLastStep ? textLastButtonPrimary : textDefaultButtonPrimary}
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

export default Stepper;
