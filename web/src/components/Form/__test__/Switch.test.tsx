import Switch from '../Switch';
import type { SwitchProps } from '../Switch';
import { render } from '../../../test';
import en from '../../../translations/en/global.json';
import userEvent from '@testing-library/user-event';

const translations = en.common;

const defaultProps: SwitchProps = {
	checked: true,
	disabled: false,
	onChange: jest.fn(),
};

describe(`<${Switch.name} />`, () => {
	test('should render directly', () => {
		const component = render(<Switch {...defaultProps} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('shoud has checked value as true', () => {
		const component = render(<Switch {...defaultProps} />);

		const handler = component.getByRole('switch');
		expect(handler).toHaveAttribute('aria-checked', 'true');

		const yesHandler = component.getByTestId('switch-handler-yes');
		expect(yesHandler).toBeVisible();

		const noHandler = component.getByTestId('switch-handler-no');
		expect(noHandler).not.toBeVisible();
	});

	test('should has YES text inside yes handler', () => {
		const component = render(<Switch {...defaultProps} />);

		const yesHandler = component.getByTestId('switch-handler-yes');
		expect(yesHandler).toHaveTextContent(translations.yes.toUpperCase());
	});

	test('shoud has checked value as false', () => {
		defaultProps.checked = false;
		const component = render(<Switch {...defaultProps} />);

		const handler = component.getByRole('switch');
		expect(handler).toHaveAttribute('aria-checked', 'false');

		const yesHandler = component.getByTestId('switch-handler-yes');
		expect(yesHandler).not.toBeVisible();

		const noHandler = component.getByTestId('switch-handler-no');
		expect(noHandler).toBeVisible();
	});

	test('should has NO text inside no handler', () => {
		const component = render(<Switch {...defaultProps} />);

		const noHandler = component.getByTestId('switch-handler-no');
		expect(noHandler).toHaveTextContent(translations.no.toUpperCase());
	});

	test('should call onChange function on click', () => {
		const component = render(<Switch {...defaultProps} />);

		const switchComponent = component.getByTestId('switch');
		userEvent.click(switchComponent);
		expect(defaultProps.onChange).toHaveBeenCalled();
	});

	test('should not call to onChange function if is disabled', () => {
		defaultProps.disabled = true;
		const component = render(<Switch {...defaultProps} />);

		const switchComponent = component.getByTestId('switch');
		userEvent.click(switchComponent);
		expect(defaultProps.onChange).not.toHaveBeenCalled();
	});
});
