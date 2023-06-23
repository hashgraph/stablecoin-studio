import { StableCoin } from "@hashgraph-dev/stablecoin-npm-sdk";
import AssociateStableCoinService from "../../../../src/app/service/stablecoin/AssociateStableCoinService";
import { utilsService } from '../../../../src/index.js';

const service = new AssociateStableCoinService();

describe(`Testing AssociateStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'associate').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance associateStableCoin', async () => {
    await service.associateStableCoin('0.0.12345', '0.0.12345');

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.associate).toHaveBeenCalledTimes(1);
  });
});
