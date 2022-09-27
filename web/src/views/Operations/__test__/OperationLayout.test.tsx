import userEvent from '@testing-library/user-event';
import { render } from '../../../test/index';
import type { OperationLayoutProps } from '../OperationLayout';
import OperationLayout from '../OperationLayout';
import translations from '../../../translations/en/operations.json';
import { RouterManager } from '../../../Router/RouterManager';

jest.mock('../../../Router/RouterManager', () => ({
	RouterManager: {
		goBack: jest.fn(),
	},
}));
describe(`<${OperationLayout.name} />`, () => {
	const props: OperationLayoutProps = {
		LeftContent: <span data-testid='left-content'></span>,
		onConfirm: jest.fn(),
	};

	test('should render correctly', () => {
		const component = render(<OperationLayout {...props} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render leftContent & rightContent', () => {
		const component = render(<OperationLayout {...props} />);

		expect(component.getByTestId('left-content')).toBeInTheDocument();
	});

	test('should call onConfirm when confirm btn is clicked', () => {
		const component = render(<OperationLayout {...props} />);

		userEvent.click(component.getByTestId('confirm-btn'));

		expect(props.onConfirm).toHaveBeenCalled();
	});

	test('should go to operations route when cancel btn is clicked', () => {
		const component = render(<OperationLayout {...props} />);

		userEvent.click(component.getByTestId('cancel-btn'));

		expect(RouterManager.goBack).toHaveBeenCalled();
	});

	test('should render stable coin details in right side', () => {
		const component = render(<OperationLayout {...props} />);
		expect(component.getByTestId('details-title')).toHaveTextContent(translations.details.title);
		expect(component.queryAllByTestId('details-review-title')[0]).toHaveTextContent(
			translations.details.basicTitle,
		);
		expect(component.queryAllByTestId('details-review-detail-0')[0]).toHaveTextContent(
			translations.details.name,
		);
		expect(component.queryAllByTestId('details-review-detail-1')[0]).toHaveTextContent(
			translations.details.symbol,
		);
		expect(component.queryAllByTestId('details-review-detail-2')[0]).toHaveTextContent(
			translations.details.decimals,
		);
		expect(component.queryAllByTestId('details-review-title')[1]).toHaveTextContent(
			translations.details.optionalTitle,
		);
		expect(component.queryAllByTestId('details-review-detail-0')[1]).toHaveTextContent(
			translations.details.initialSupply,
		);
		expect(component.queryAllByTestId('details-review-detail-1')[1]).toHaveTextContent(
			translations.details.totalSupply,
		);
		expect(component.queryAllByTestId('details-review-detail-2')[1]).toHaveTextContent(
			translations.details.supplyType,
		);
	});
});
