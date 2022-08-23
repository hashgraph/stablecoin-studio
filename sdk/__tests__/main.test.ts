import { Account, ICreateStableCoinRequest, SDK } from "../src/index";

describe('SDK Unit Test 🧪', () => {

  let sdk: SDK;

  // Act before assertions
  beforeAll(async () => {
    // Read more about fake timers
    // http://facebook.github.io/jest/docs/en/timer-mocks.html#content
    // Jest 27 now uses "modern" implementation of fake timers
    // https://jestjs.io/blog/2021/05/25/jest-27#flipping-defaults
    // https://github.com/facebook/jest/pull/5171
    sdk = new SDK();
  });

  // Teardown (cleanup) after assertions
  afterAll(() => {
    console.log('afterAll: hook');
  });

  // Assert sdk not null
  it('loads the class', () => {
    expect(sdk).not.toBeNull();
  });
  
  it('Creates a Stable Coin', () => {
    const request: ICreateStableCoinRequest = {
      account: new Account("0.0.1", "1234"),
      name: "PapaCoin",
      symbol: "PAPA",
      decimals: 2
    }
    const coin = sdk.createStableCoin(request);
    expect(coin).not.toBeNull();
    console.log(coin);
  });

});
