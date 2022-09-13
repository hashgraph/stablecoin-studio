import { render } from '@testing-library/react';
import App from '../App';

describe(`<${App.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<App />, {});

		expect(component.asFragment()).toMatchSnapshot();
	});
});
