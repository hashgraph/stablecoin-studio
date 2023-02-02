import { StableCoin } from 'hedera-stable-coin-sdk';

describe('🧪 CLI Unit Test', () => {
  it('StableCoin loaded', () => {
    expect(StableCoin).not.toBeNull();
  });
});
