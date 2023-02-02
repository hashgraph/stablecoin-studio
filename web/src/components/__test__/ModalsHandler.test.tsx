import { render } from '../../test/index';
import ModalsHandler from '../ModalsHandler';
import type { ModalsHandlerProps } from '../ModalsHandler';
import userEvent from '@testing-library/user-event';

describe(`<${ModalsHandler.name} />`, () => {
	const props: ModalsHandlerProps = {
		ModalActionChildren: <span data-testid='details'></span>,
		modalActionProps: {
			isOpen: true,
			onClose: jest.fn(),
			title: 'Title',
			confirmButtonLabel: 'Accept',
			onConfirm: jest.fn(),
		},
		errorNotificationDescription: 'Error testing description',
		errorNotificationTitle: 'Error testing title',
		successNotificationDescription: 'Success testing description',
		successNotificationTitle: 'Success testing title',
	};

	test('should render correctly', () => {
		const component = render(<ModalsHandler {...props} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<ModalsHandler {...props} />);

		const title = component.getByTestId('modal-action-title');

		expect(title).toHaveTextContent(props.modalActionProps.title);
	});

	test('Cancel button call onClose function', async () => {
		const component = render(<ModalsHandler {...props} />);

		const cancelButton = component.getByTestId('modal-action-cancel-button');

		expect(cancelButton).toBeInTheDocument();

		await userEvent.click(cancelButton);

		expect(props.modalActionProps.onClose).toHaveBeenCalled();
	});

	test('Confirm button call onConfirm function', async () => {
		const component = render(<ModalsHandler {...props} />);

		const confirmButton = component.getByTestId('modal-action-confirm-button');

		expect(confirmButton).toBeInTheDocument();

		await userEvent.click(confirmButton);

		expect(props.modalActionProps.onConfirm).toHaveBeenCalled();
	});
});
