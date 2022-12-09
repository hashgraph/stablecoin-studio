import { SDK } from '../src_old/index';
import { getSDKAsync } from './core/core.js';

describe('🧪 SDK Unit Test', () => {
  let sdk: SDK;

  beforeEach(async () => {
    sdk = await getSDKAsync();
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
    expect(data).not.toBeFalsy();
  });
});
