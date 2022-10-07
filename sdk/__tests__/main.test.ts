import { SDK } from '../src/index';
import { getSDKAsync } from './core/core.js';

describe('🧪 SDK Unit Test', () => {
  let sdk: SDK;

  beforeEach(async () => {
    sdk = await getSDKAsync();
  });

  // Teardown (cleanup) after assertions
  afterAll(() => {
    console.log('afterAll: hook');
  });

  // Assert sdk not null
  it('Loads the class', () => {
    expect(sdk).not.toBeNull();
  });

	it('Emits initialization event', async () => {
		let data;
		await getSDKAsync(undefined, {
			onInit: (_data) => {
				data = _data;
			},
		});
		console.log(data);
		expect(data).not.toBeFalsy();
	});
});
