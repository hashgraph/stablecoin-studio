import { render } from '@testing-library/react';
import App from '../App';
import * as reactDeviceDetect from 'react-device-detect';
import userEvent from '@testing-library/user-event';

describe(`<${App.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<App />, {});

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render correctly when is mobile', () => {
		Object.defineProperty(reactDeviceDetect, 'isMobile', { get: () => true });

		const component = render(<App />, {});

		const text = component.getByTestId('isMobile');
		expect(text).toHaveTextContent('This app is for desktop use only');
	});

	test('should render correctly disclaimer', async () => {
		Object.defineProperty(reactDeviceDetect, 'isMobile', { get: () => false });
		process.env = {
			REACT_APP_SHOW_DISCLAIMER: 'true',
		};
		const component = render(<App />, {});

		let button = component.getByTestId('modal-action-cancel-button');
		await userEvent.click(button);

		button = component.getByTestId('modal-term-conditions-button');
		await userEvent.click(button);

		button = component.getByTestId('modal-action-confirm-button');
		await userEvent.click(button);
	});
});
