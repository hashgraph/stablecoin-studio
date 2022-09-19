import { useForm } from 'react-hook-form';
import SwitchController, {
	SwitchControllerProps as AllSwitchControllerProps,
} from '../SwitchController';
import { render } from '../../../test';
import userEvent from '@testing-library/user-event';

type SwitchControllerProps = Omit<AllSwitchControllerProps, 'control'>;

const defaultProps: SwitchControllerProps = {
	defaultValue: true,
	name: 'switch-controller',
};

const RenderWithForm = (props: SwitchControllerProps) => {
	const localForm = useForm({
		mode: 'onChange',
		criteriaMode: 'all',
	});

	return <SwitchController control={localForm.control} {...props} />;
};

const factoryComponent = (props: SwitchControllerProps = defaultProps) => {
	return render(<RenderWithForm {...props} />);
};

describe(`<${SwitchController.name} />`, () => {
	it('should render correctly', () => {
		const component = factoryComponent();

		expect(component.asFragment()).toMatchSnapshot();
	});

	it('should change value on click', () => {
		const component = factoryComponent();

		const handler = component.getByRole('switch');
		expect(handler).toHaveAttribute('aria-checked', 'true');

		const yesHandler = component.getByTestId('switch-handler-yes');
		expect(yesHandler).toBeVisible();

		const noHandler = component.getByTestId('switch-handler-no');
		expect(noHandler).not.toBeVisible();

		const switchComponent = component.getByTestId('switch');
		userEvent.click(switchComponent);

		expect(handler).toHaveAttribute('aria-checked', 'false');
		expect(yesHandler).not.toBeVisible();
		expect(noHandler).toBeVisible();
	});
});
