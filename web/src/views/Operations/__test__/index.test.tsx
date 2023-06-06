import { render } from '../../../test/index';
import Operations from '../../../Router/index';
import translations from '../../../translations/en/operations.json';
import { waitFor } from '@testing-library/react';

describe(`<${Operations.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<Operations />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', async () => {
		const component = render(<Operations />);

		await waitFor(() => {
			expect(component.getByTestId('base-container-heading')).toHaveTextContent(translations.title);
			expect(component.getByTestId('subtitle')).toHaveTextContent(translations.subtitle);
		});
	});

	test('should render cashin button', async () => {
		const component = render(<Operations />);

		await waitFor(() => {
			expect(component.getByTestId('direct-access-cashIn')).toHaveTextContent(
				translations.cashInOperation);
		});
	});

	test('should render wipe button', async () => {
		const component = render(<Operations />);

		await waitFor(() => {
			expect(component.getByTestId('direct-access-wipe')).toHaveTextContent(
				translations.wipeOperation);
		});
	});

	test('should render rescue button', async () => {
		const component = render(<Operations />);

		await waitFor(() => {
			expect(component.getByTestId('direct-access-rescueTokens')).toHaveTextContent(
				translations.rescueOperation);
		});
	});

	test('should render rescue HBAR button', async () => {
		const component = render(<Operations />);

		await waitFor(() => {
			expect(component.getByTestId('direct-access-rescueHBAR')).toHaveTextContent(
				translations.rescueHBAROperation);
		});
	});

	test('should render burn button', async () => {
		const component = render(<Operations />);

		await waitFor(() => {
			expect(component.getByTestId('direct-access-burn')).toHaveTextContent(
				translations.burnOperation);
		});
	});
});
