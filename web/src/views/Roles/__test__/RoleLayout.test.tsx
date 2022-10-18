import { useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import RoleLayout from '../RoleLayout';
import type { RoleLayoutProps as AllRoleLayoutProps } from '../RoleLayout';
import en from '../../../translations/en/roles.json';
import { render } from '../../../test';
import { fakeOptions, fields } from '../constants';
import { RouterManager } from '../../../Router/RouterManager';

jest.mock('../../../Router/RouterManager', () => ({
	RouterManager: {
		to: jest.fn(),
	},
}));

const translations = en.giveRole;

type RoleLayoutProps = Omit<AllRoleLayoutProps, 'control'>;
const defaultProps: RoleLayoutProps = {
	accountLabel: translations.accountLabel,
	accountPlaceholder: translations.accountPlaceholder,
	onConfirm: jest.fn(),
	options: fakeOptions,
	selectorLabel: translations.selectLabel,
	selectorPlaceholder: translations.selectPlaceholder,
	title: en.give,
	roleRequest: true
};

const RenderWithForm = (props: RoleLayoutProps) => {
	const localForm = useForm({
		mode: 'onChange',
	});

	return <RoleLayout control={localForm.control} {...props} />;
};

const factoryComponent = (props: RoleLayoutProps = defaultProps) => {
	return render(<RenderWithForm {...props} />);
};

describe(`<${RoleLayout.name} />`, () => {
	test('should render correctly', () => {
		const component = factoryComponent();

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has a title', () => {
		const component = factoryComponent();

		const title = component.getByTestId('title');
		expect(title).toHaveTextContent(defaultProps.title);
	});

	test('should has a input field to enter account', () => {
		const component = factoryComponent();

		const account = component.getByTestId(fields.account);
		expect(account).toBeInTheDocument();
	});

	test('should has a selector of roles', () => {
		const component = factoryComponent();

		const roles = component.getByTestId('select-placeholder');
		expect(roles).toBeInTheDocument();
	});

	test('can has a children', () => {
		defaultProps.children = <span data-testid='children-test'>TESTING</span>;
		const component = factoryComponent();

		const children = component.getByTestId('children-test');
		expect(children).toBeInTheDocument();
	});

	test('Confirm button call to onConfirm', () => {
		const component = factoryComponent();

		const confirmButton = component.getByTestId('confirm-btn');
		userEvent.click(confirmButton);
		expect(defaultProps.onConfirm).toHaveBeenCalled();
	});

	test('Confirm button can be setted as disabled', () => {
		defaultProps.buttonConfirmEnable = false;
		const component = factoryComponent();

		const confirmButton = component.getByTestId('confirm-btn');
		expect(confirmButton).toHaveAttribute('disabled');
		userEvent.click(confirmButton);
		expect(defaultProps.onConfirm).not.toHaveBeenCalled();
	});

	test('Cancel button redirect to Roles view', () => {
		const component = factoryComponent();
		const anything = expect.any(Function);

		const cancelButton = component.getByTestId('cancel-btn');
		userEvent.click(cancelButton);
		expect(RouterManager.to).toHaveBeenCalledWith(anything, 'roles');
	});
});
