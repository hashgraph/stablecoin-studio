import { render } from '../../test/index';
import ModalsHandler from '../ModalsHandler';
import type { ModalsHandlerProps } from '../ModalsHandler';

describe(`<${ModalsHandler.name} />`, () => {
	const props: ModalsHandlerProps = {
		ModalActionChildren: <span data-testid='details'></span>,
		modalActionProps: {
			isOpen: false,
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

	test.todo('rest of the tests');
});
