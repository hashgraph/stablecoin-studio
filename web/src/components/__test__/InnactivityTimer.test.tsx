import InnactivityTimer from '../InnactivityTimer';
import { render } from '../../test/index';
import configureMockStore from 'redux-mock-store';
import { ConnectionState } from '@hashgraph-dev/stablecoin-npm-sdk';

const defaultProps = {
	children: ''
};

const mockStore = configureMockStore();

describe(`<${InnactivityTimer.name} />`, () => {
	test('should render correctly when paired', async () => {
		const store = mockStore({
			wallet: {
				status: ConnectionState.Paired,
			},
		});
		const component = render(<InnactivityTimer {...defaultProps} />, store);

		expect(component.asFragment()).toMatchSnapshot();
	});
	test('should render correctly when disconnect', async () => {
		const store = mockStore({
			wallet: {
				status: ConnectionState.Disconnected,
			},
		});
		const component = render(<InnactivityTimer {...defaultProps} />, store);

		expect(component.asFragment()).toMatchSnapshot();
	});

});
