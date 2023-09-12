import { StableCoin } from '@hashgraph/stablecoin-npm-sdk';

describe('🧪 CLI Unit Test', () => {
  it('StableCoin loaded', () => {
    expect(StableCoin).not.toBeNull();
  });
});
