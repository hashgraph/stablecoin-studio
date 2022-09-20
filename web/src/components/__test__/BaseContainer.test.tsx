import { Box } from '@chakra-ui/react';
import { render } from '../../test/index';
import BaseContainer from '../BaseContainer';

const baseContainerProps = {
	title: 'Test',
	children: <Box>Test</Box>,
};

describe(`<${BaseContainer.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<BaseContainer {...baseContainerProps} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title and children visible', () => {
		const component = render(<BaseContainer {...baseContainerProps} />);

		const title = component.getByTestId('base-container-heading');
		const children = component.getByTestId('base-container-children');

		expect(title).toHaveTextContent(baseContainerProps.title);
		expect(children).toBeInTheDocument();
	});
});
