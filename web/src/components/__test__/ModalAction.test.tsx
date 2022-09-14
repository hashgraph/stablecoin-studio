import userEvent from '@testing-library/user-event';
import ModalAction from '../ModalAction';
import { render } from '../../test/index';

const defaultProps = {
	cancelButtonLabel: 'Cancel',
	confirmButtonLabel: 'Confirm',
	isOpen: true,
	onClose: jest.fn(),
	onConfirm: jest.fn(),
	title: 'Modal Action TEST',
};

const detailText = 'Testing Content';
const Detail = () => <span data-testid='detail'>{detailText}</span>;

describe(`<${ModalAction.name} />`, () => {
	test('should render correctly', () => {
		const component = render(
			<ModalAction {...defaultProps}>
				<Detail />
			</ModalAction>,
		);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render title', () => {
		const component = render(
			<ModalAction {...defaultProps}>
				<Detail />
			</ModalAction>,
		);

		const title = component.getByTestId('modal-action-title');
		expect(title).toBeInTheDocument();
		expect(title).toHaveTextContent(defaultProps.title);
	});

	test('should has a cancel button with cancelButtonLabel as text', () => {
		const component = render(
			<ModalAction {...defaultProps}>
				<Detail />
			</ModalAction>,
		);

		const cancelButton = component.getByTestId('modal-action-cancel-button');
		expect(cancelButton).toBeInTheDocument();
		expect(cancelButton).toHaveTextContent(defaultProps.cancelButtonLabel);
	});

	test('cancel button close modal by default', () => {
		const component = render(
			<ModalAction {...defaultProps}>
				<Detail />
			</ModalAction>,
		);

		const cancelButton = component.getByTestId('modal-action-cancel-button');
		userEvent.click(cancelButton);
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	test('cancel button call onCancel function if this prop exists', () => {
		const onCancel = jest.fn();
		const component = render(
			<ModalAction onCancel={onCancel} {...defaultProps}>
				<Detail />
			</ModalAction>,
		);

		const cancelButton = component.getByTestId('modal-action-cancel-button');
		userEvent.click(cancelButton);
		expect(onCancel).toHaveBeenCalled();
	});

	test('should has a confirm button with confirmButtonLabel as text', () => {
		const component = render(
			<ModalAction {...defaultProps}>
				<Detail />
			</ModalAction>,
		);

		const confirmButton = component.getByTestId('modal-action-confirm-button');
		expect(confirmButton).toBeInTheDocument();
		expect(confirmButton).toHaveTextContent(defaultProps.confirmButtonLabel);
	});

	test('confirm button call confirm function', () => {
		const component = render(
			<ModalAction {...defaultProps}>
				<Detail />
			</ModalAction>,
		);

		const confirmButton = component.getByTestId('modal-action-confirm-button');
		userEvent.click(confirmButton);
		expect(defaultProps.onConfirm).toHaveBeenCalled();
	});

	test('should render children', () => {
		const component = render(
			<ModalAction {...defaultProps}>
				<Detail />
			</ModalAction>,
		);

		const detail = component.getByTestId('detail');
		expect(detail).toBeInTheDocument();
		expect(detail).toHaveTextContent(detailText);
	});
});
