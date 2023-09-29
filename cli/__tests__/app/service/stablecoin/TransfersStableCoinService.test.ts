import {
  StableCoin,
  TransfersRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import TransfersStableCoinService from '../../../../src/app/service/stablecoin/TransfersStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new TransfersStableCoinService();
const language: Language = new Language();
const request = new TransfersRequest({
  tokenId: '0.0.012345',
  targetsId: [],
  amounts: [],
  targetId: '',
});

describe(`Testing TransfersStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'transfers').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance transfersStableCoin', async () => {
    await service.transfersStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.transfers).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
