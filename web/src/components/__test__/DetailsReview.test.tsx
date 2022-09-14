import DetailsReview from '../DetailsReview';
import { render } from '../../test/index';

const details = [
	{
		label: 'Account to revoke rol',
		value: '0.0.734953',
	},
	{
		label: 'Role to revoke',
		value: 'Rescuer',
		valueInBold: true,
	},
];

const defaultProps = {
	details,
	title: 'Datails Review',
};

describe(`<${DetailsReview.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<DetailsReview {...defaultProps} />);

		expect(component).toMatchSnapshot();
	});

	test('should render title if exists', () => {
		const component = render(<DetailsReview {...defaultProps} />);

		const title = component.getByTestId('details-review-title');
		expect(title).toBeInTheDocument();
		expect(title).toHaveTextContent(defaultProps.title);
	});

	test('should not render title if it is not in props', () => {
		const component = render(<DetailsReview details={details} />);

		const title = component.queryByTestId('details-review-title');
		expect(title).not.toBeInTheDocument();
	});

	test('should render all details', () => {
		const component = render(<DetailsReview {...defaultProps} />);
		const { details } = defaultProps;

		details.forEach((item, index) => {
			const detail = component.getByTestId(`details-review-detail-${index}`);
			expect(detail).toHaveTextContent(item.label);
			expect(detail).toHaveTextContent(item.value);
		});
	});

	test('should has a divider between details by default', () => {
		const detail = {
			label: 'testing',
			value: 'testing',
		};
		const details = Array.from({ length: 15 }, () => detail);
		const props = {
			details,
			title: 'Long details list for testing',
		};
		const component = render(<DetailsReview {...props} />);

		const dividers = component.getAllByTitle('divider');
		expect(dividers).toHaveLength(details.length - 1);
	});

	test('should not has dividers is divider prop is false', () => {
		const component = render(<DetailsReview divider={false} {...defaultProps} />);

		const dividers = component.queryAllByTitle('divider');
		expect(dividers).toHaveLength(0);
	});
});
