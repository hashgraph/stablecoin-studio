import Router from '../Router';
import { render } from '../../test';

describe(`<${Router.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Router />);

		expect(component.asFragment()).toMatchSnapshot();
	});
});
