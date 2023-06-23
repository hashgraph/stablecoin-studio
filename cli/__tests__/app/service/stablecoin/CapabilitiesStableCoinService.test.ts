import { StableCoin } from "@hashgraph-dev/stablecoin-npm-sdk";
import CapabilitiesStableCoinService from "../../../../src/app/service/stablecoin/CapabilitiesStableCoinService";

const service = new CapabilitiesStableCoinService();
const tokenId = '0.0.012345';
const amount = { accountId: '' };
const tokenIsPaused = false;
const tokenIsDeleted = false;

describe(`Testing CapabilitiesStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(StableCoin, 'capabilities').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance getCapabilitiesStableCoins', async () => {
    await service.getCapabilitiesStableCoins(tokenId, amount, tokenIsPaused, tokenIsDeleted);

    expect(service).not.toBeNull();
    expect(StableCoin.capabilities).toHaveBeenCalledTimes(1);
  });
});
