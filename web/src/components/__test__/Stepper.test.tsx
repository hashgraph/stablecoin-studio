import { Box } from '@chakra-ui/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/index';
import type { Step } from '../Stepper';
import Stepper from '../Stepper';

const steps: Step[] = [
	{
		number: '01',
		title: 'Option 1',
		children: <Box>Tab 1</Box>,
	},
	{
		number: '02',
		title: 'Option 2',
		children: <Box>Tab 2</Box>,
	},
];

const StepsProps = {
	steps,
	textLastButtonPrimary: 'Last button',
	handleLastButtonPrimary: () => jest.fn,
	handleFirstButtonSecondary: () => jest.fn,
	isValid: true,
	currentStep: 0,
	setCurrentStep: jest.fn(),
};

describe(`<${Stepper.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Stepper {...StepsProps} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should have number and title each tabs', () => {
		const component = render(<Stepper {...StepsProps} />);

		const titleTab1 = component.getByTestId('stepper-step-title-1');
		const titleTab2 = component.getByTestId('stepper-step-title-2');

		const numberTab1 = component.getByTestId('stepper-step-number-1');
		const numberTab2 = component.getByTestId('stepper-step-number-2');

		expect(titleTab1).toHaveTextContent(steps[0].title);
		expect(titleTab2).toHaveTextContent(steps[1].title);
		expect(numberTab1).toHaveTextContent(steps[0].number);
		expect(numberTab2).toHaveTextContent(steps[1].number);
	});

	test('should change tab when next step button clicked', () => {
		const component = render(<Stepper {...StepsProps} />);

		const buttonPrimaryTab1 = component.getByTestId('stepper-step-panel-button-primary-1');
		userEvent.click(buttonPrimaryTab1);

		expect(StepsProps.setCurrentStep).toHaveBeenCalledWith(1);
	});

	test('Cancel button should call function passed by handleFirstButtonSecondary prop', async () => {
		const handleFirstButtonSecondary = jest.fn();

		const component = render(
			<Stepper {...StepsProps} handleFirstButtonSecondary={handleFirstButtonSecondary} />,
		);

		const buttonSecondaryTab1 = component.getByTestId('stepper-step-panel-button-secondary-1');
		userEvent.click(buttonSecondaryTab1);

		expect(handleFirstButtonSecondary).toHaveBeenCalled();
	});

	test('Last button should call function passed by handleLastButtonPrimary prop', async () => {
		const handleLastButtonPrimary = jest.fn();

		const component = render(
			<Stepper
				{...StepsProps}
				handleLastButtonPrimary={handleLastButtonPrimary}
				currentStep={steps.length - 1}
			/>,
		);

		const buttonPrimaryTab2 = component.getByTestId('stepper-step-panel-button-primary-2');
		userEvent.click(buttonPrimaryTab2);

		expect(handleLastButtonPrimary).toHaveBeenCalled();
	});
});
