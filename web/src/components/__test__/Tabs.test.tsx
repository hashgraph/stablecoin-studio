import { Box } from '@chakra-ui/react';
import { fireEvent, act } from '@testing-library/react';
import { render } from '../../test/index';
import Tabs, { OptionBaseTabProps } from '../Tabs';

const options: OptionBaseTabProps[] = [
	{
		number: '01',
		title: 'Option 1',
		complete: false,
		children: <Box>Tab 1</Box>,
	},
	{
		number: '02',
		title: 'Option 2',
		complete: false,
		children: <Box>Tab 2</Box>,
	},
];

const tabsProps = {
	options,
	textLastButtonPrimary: 'Last button',
	handleLastButtonPrimary: () => jest.fn,
	handleFirstButtonSecondary: () => jest.fn,
};

describe(`<${Tabs.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Tabs {...tabsProps} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should have number and title each tabs', () => {
		const component = render(<Tabs {...tabsProps} />);

		const titleTab1 = component.getByTestId('tabs-tab-title-1');
		const titleTab2 = component.getByTestId('tabs-tab-title-2');

		const numberTab1 = component.getByTestId('tabs-tab-number-1');
		const numberTab2 = component.getByTestId('tabs-tab-number-2');

		expect(titleTab1).toHaveTextContent(options[0].title);
		expect(titleTab2).toHaveTextContent(options[1].title);
		expect(numberTab1).toHaveTextContent(options[0].number);
		expect(numberTab2).toHaveTextContent(options[1].number);
	});

	test('should change tab when next step button clicked', async () => {
		const component = render(<Tabs {...tabsProps} />);

		const buttonPrimaryTab1 = component.getByTestId('tabs-tabpanel-button-primary-1');

		act(() => {
			fireEvent.click(buttonPrimaryTab1);
		});

		await act(async () => {
			const buttonSecondaryTab2 = component.getByTestId('tabs-tabpanel-button-secondary-2');

			expect(buttonSecondaryTab2).toBeInTheDocument();
		});
	});

	test('Cancel button should call function passed by handleFirstButtonSecondary prop', async () => {
		const handleFirstButtonSecondary = jest.fn();

		const component = render(
			<Tabs {...tabsProps} handleFirstButtonSecondary={handleFirstButtonSecondary} />,
		);

		const buttonSecondaryTab1 = component.getByTestId('tabs-tabpanel-button-secondary-1');

		act(() => {
			fireEvent.click(buttonSecondaryTab1);
		});

		await act(async () => {
			expect(handleFirstButtonSecondary).toHaveBeenCalled();
		});
	});

	test('Last button should call function passed by handleLastButtonPrimary prop', async () => {
		const handleLastButtonPrimary = jest.fn();

		const component = render(
			<Tabs {...tabsProps} handleLastButtonPrimary={handleLastButtonPrimary} />,
		);

		const buttonPrimaryTab1 = component.getByTestId('tabs-tabpanel-button-primary-1');

		act(() => {
			fireEvent.click(buttonPrimaryTab1);
		});

		await act(async () => {
			const buttonPrimaryTab2 = component.getByTestId('tabs-tabpanel-button-primary-2');

			act(() => {
				fireEvent.click(buttonPrimaryTab2);
			});

			expect(handleLastButtonPrimary).toHaveBeenCalled();
		});
	});
});
