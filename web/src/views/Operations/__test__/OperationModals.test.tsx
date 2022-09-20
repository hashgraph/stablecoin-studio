import { render } from '../../../test/index';
import OperationModals, { OperationModalsProps } from '../OperationModals';

describe(`<${OperationModals.name} />`, () => {
	const props: OperationModalsProps = {
		ModalActionChildren: <span data-testid='details'></span>,
		modalActionProps: {
			isOpen: false,
			onClose: jest.fn(),
			title: 'Title',
			confirmButtonLabel: 'Accept',
			onConfirm: jest.fn(),
		},
	};

	test('should render correctly', () => {
		const component = render(<OperationModals {...props} />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test.todo('rest of the tests');
});
