import type { IconProps } from '../Icon';
import Icon from '../Icon';
import { render } from '../../test/index';

describe(`<${Icon.name} />`, () => {
	const factoryComponent = (props: IconProps) => render(<Icon {...props} />);

	test('should show icon', () => {
		const component = factoryComponent({ name: 'Airplane' });

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('shows icon with personalized color', async () => {
		const props: IconProps = {
			name: 'Airplane',
			color: 'red',
		};
		const component = factoryComponent(props);

		expect(component.asFragment()).toMatchSnapshot('IconWithPersonalizedColor');

		const svg = component.container.querySelector('svg');
		expect(svg).not.toBeNull();
		expect(window.getComputedStyle(svg!).color).toEqual(props.color);
	});

	test('raises error when icon is not found', () => {
		expect(() => factoryComponent({ name: 'Icon' })).toThrowError();
	});
});
