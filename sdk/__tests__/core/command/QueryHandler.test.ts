import { QueryBus } from '../../../src/core/query/QueryBus.js';
// eslint-disable-next-line jest/no-mocks-import
import {
	ConcreteQuery,
	ConcreteQueryResponse,
} from './__mocks__/ConcreteQueryHandler.js';
const queryBus = new QueryBus();
describe('🧪 QueryHandler Test', () => {
	it('Executes a simple query', async () => {
		const execSpy = jest.spyOn(queryBus, 'execute');
		const query = new ConcreteQuery('1', 4);
		// console.log('Query: ', query);
		// console.log('Query Bus Handlers: ', queryBus.handlers);
		const res = await queryBus.execute(query);
		// console.log('Response was: ', res);
		expect(res).toBeInstanceOf(ConcreteQueryResponse);
		expect(res.payload).toBe(query.payload);
		expect(execSpy).toHaveBeenCalled();
	});
});
