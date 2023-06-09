import FeesManagement from '../';
import { render } from '../../../test/index';
import translations from '../../../translations/en/feesManagement.json';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';
import { RequestFractionalFee } from '@hashgraph-dev/stablecoin-npm-sdk';

const mockStore = configureMockStore();

describe(`<${FeesManagement.name} />`, () => {

	test('should render correctly', () => {
		const component = render(<FeesManagement />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has title', () => {
		const component = render(<FeesManagement />);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});

	test('should has fees', () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.0',
					customFees: [{
						collectorId: 'collectorId',
						collectorsExempt: true,
						decimals: 'decimals',
						tokenIdCollected: 'tokenIdCollected',
						amount: '10',
					}]
				},
			},
		});
		const component = render(<FeesManagement />, store);
		const header = component.getByTestId('base-container-heading');

		expect(header).toHaveTextContent(translations.title);
	});
	

	test('trash button should be clicked', async () => {
		const store = mockStore({
			wallet: {
				selectedStableCoin: {
					tokenId: '0.0.0',
					feeScheduleKey: 'feeScheduleKey',
					customFees: [{
						percentage: '1',
						amountNumerator: '1',
						amountDenominator: '1',
						min: '1',
						max: '2',
						net: true
					}as RequestFractionalFee]
				},
			},
		});
		const component = render(<FeesManagement />, store);

		const trashButton = component.getByTestId('trash-icon');
		await userEvent.click(trashButton);
	});
});
