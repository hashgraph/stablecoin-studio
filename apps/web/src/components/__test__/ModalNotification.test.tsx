import userEvent from '@testing-library/user-event';
import ModalNotification from '../ModalNotification';
import { render } from '../../test/index';
import HEDERA_LOGO from '../../assets/png/hedera-hbar-logo.png';

const defaultProps = {
	title: 'Title',
	isOpen: true,
	onClose: jest.fn(),
};

describe(`<${ModalNotification.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<ModalNotification {...defaultProps} />);

		expect(component.asFragment()).toMatchSnapshot('default');
	});

	test('should not has icon without icon or variant props', () => {
		const component = render(<ModalNotification {...defaultProps} />);

		const icon = component.queryByTestId('modal-notification-icon');
		expect(icon).not.toBeInTheDocument();
	});

	test('should render icon passed by prop', () => {
		const component = render(<ModalNotification icon={HEDERA_LOGO} {...defaultProps} />);

		const icon = component.getByTestId('modal-notification-icon');
		expect(icon).toBeInTheDocument();
	});

	test('should render success icon if variant is success', () => {
		const component = render(<ModalNotification variant='success' {...defaultProps} />);

		const successIcon = component.getByTestId('modal-notification-icon');
		expect(successIcon).toBeInTheDocument();
		expect(successIcon).toHaveAttribute('src', 'success.svg');

		expect(component.asFragment()).toMatchSnapshot('success');
	});

	test('should render error icon if variant is error', () => {
		const component = render(<ModalNotification variant='error' {...defaultProps} />);

		const successIcon = component.getByTestId('modal-notification-icon');
		expect(successIcon).toBeInTheDocument();
		expect(successIcon).toHaveAttribute('src', 'error.svg');

		expect(component.asFragment()).toMatchSnapshot('error');
	});

	test('should render title', () => {
		const component = render(<ModalNotification {...defaultProps} />);

		const title = component.getByTestId('modal-notification-title');
		expect(title).toBeInTheDocument();
		expect(title).toHaveTextContent(defaultProps.title);
	});

	test('should not render description if it is not on props', () => {
		const component = render(<ModalNotification {...defaultProps} />);

		const description = component.queryByTestId('modal-notification-description');
		expect(description).not.toBeInTheDocument();
	});

	test('should render description if it is on props', () => {
		const descriptionProp = 'notification description';
		const component = render(<ModalNotification description={descriptionProp} {...defaultProps} />);

		const description = component.getByTestId('modal-notification-description');
		expect(description).toBeInTheDocument();
		expect(description).toHaveTextContent(descriptionProp);

		expect(component.asFragment()).toMatchSnapshot('with-description');
	});

	test('should has an Accept button', () => {
		const component = render(<ModalNotification {...defaultProps} />);

		const button = component.getByTestId('modal-notification-button');
		expect(button).toBeInTheDocument();
	});

	test('Accept button should close modal by default', async () => {
		const component = render(<ModalNotification {...defaultProps} />);

		const button = component.getByTestId('modal-notification-button');
		await userEvent.click(button);

		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	test('Accept button should call function passed by onClick prop', async () => {
		const acceptButton = jest.fn();
		const component = render(<ModalNotification onClick={acceptButton} {...defaultProps} />);

		const button = component.getByTestId('modal-notification-button');
		await userEvent.click(button);

		expect(acceptButton).toHaveBeenCalled();
	});
});
