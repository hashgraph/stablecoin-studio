import userEvent from '@testing-library/user-event';
import { render } from '../../../test/index';
import OperationLayout, { OperationLayoutProps } from '../OperationLayout';

describe(`<${OperationLayout.name} />`, () => {
	const props: OperationLayoutProps = {
		LeftContent: <span data-testid='left-content'></span>,
		RightContent: <span data-testid='right-content'></span>,
		onConfirm: jest.fn(),
	};

	test('should render correctly', () => {
		const component = render(<OperationLayout {...props} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render leftContent & rightContent', () => {
		const component = render(<OperationLayout {...props} />);

		expect(component.getByTestId('left-content')).toBeInTheDocument();
		expect(component.getByTestId('right-content')).toBeInTheDocument();
	});

	test('should call onConfirm when confirm btn is clicked', () => {
		const component = render(<OperationLayout {...props} />);

		userEvent.click(component.getByTestId('confirm-btn'));

		expect(props.onConfirm).toHaveBeenCalled();
	});

	test.todo('should go to operations route when cancel btn is clicked');
});
