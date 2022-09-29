import { SDK } from 'hedera-stable-coin-sdk';

describe('🧪 CLI Unit Test', () => {
  let sdk: SDK;

  it('SDK loaded', () => {
    expect(sdk).not.toBeNull();
  });
});
