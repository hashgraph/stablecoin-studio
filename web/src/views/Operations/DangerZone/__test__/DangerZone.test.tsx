import { render } from '../../../../test/index';
import en from '../../../../translations/en/operations.json';
import DangerZone from '..';
import configureMockStore from 'redux-mock-store';
import { mockedStableCoinCapabilities } from '../../../../mocks/sdk';
import userEvent from '@testing-library/user-event';
import { StableCoinRole } from '@hashgraph-dev/stablecoin-npm-sdk';

const translations = en;

describe(`<${DangerZone.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<DangerZone />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should render titles', () => {
		const component = render(<DangerZone />);

		expect(component.getByTestId('subtitle')).toHaveTextContent(translations.subtitle);
	});

	test('should have options', async () => {

		const mockStore = configureMockStore();
		const selectedStableCoin = {
			initialSupply: 10,
			tokenId: '0.0.12345',
			proxyAddress: '0.0.12345',
			reserveAmount: '10',
			paused: false
		};

		const store = mockStore({
			wallet: {
				selectedStableCoin,
				capabilities: mockedStableCoinCapabilities,
				data: {
					account: {
						id: 'id',
					}
				},
				roles: [StableCoinRole.PAUSE_ROLE, StableCoinRole.DELETE_ROLE]
			},
		});
		localStorage.setItem(
			'tokensAccount',
			JSON.stringify([
				{
					id: 'id',
					externalTokens: [
						{
							id: '0.0.12345',
							symbol: 'symbol',
						},
					],
				},
			]),
		);

		const component = render(<DangerZone />, store);

		const pause = component.getAllByTestId('direct-access-Pause');
		await userEvent.click(pause[0]);

		const confirmModalButton = component.getByTestId('modal-action-confirm-button');
		await userEvent.click(confirmModalButton);

		const deleteButton = component.getAllByTestId('direct-access-Delete');
		await userEvent.click(deleteButton[0]);

		const confirmButtons = component.getAllByTestId('modal-action-confirm-button');
		await userEvent.click(confirmButtons[1]);
	});
});
