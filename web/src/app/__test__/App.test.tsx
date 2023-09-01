import { render } from '@testing-library/react';
import App from '../App';
import * as reactDeviceDetect from 'react-device-detect';

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

		expect(component.asFragment()).toMatchSnapshot();
	});
});
