import { KYCRequest, StableCoin } from "@hashgraph-dev/stablecoin-npm-sdk";
import KYCStableCoinService from "../../../../src/app/service/stablecoin/KYCStableCoinService";
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import colors from 'colors';

const service = new KYCStableCoinService();
const language: Language = new Language();
const request = new KYCRequest({
  tokenId: 'tokenId',
  targetId: 'targetId'
});

describe(`Testing KYCStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'grantKyc').mockImplementation();
    jest.spyOn(StableCoin, 'revokeKyc').mockImplementation();
    jest.spyOn(console, "log");
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance grantKYCToAccount', async () => {
    await service.grantKYCToAccount(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.grantKyc).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(language.getText('operation.success'));
  });

  it('Should instance revokeKYCFromAccount', async () => {
    await service.revokeKYCFromAccount(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.revokeKyc).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(language.getText('operation.success'));
  });

  it('Should instance isAccountKYCGranted', async () => {
    jest.spyOn(StableCoin, 'isAccountKYCGranted').mockResolvedValue(false);
    await service.isAccountKYCGranted(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.isAccountKYCGranted).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(language.getText('state.accountKYCNotGranted')
      .replace('${address}', request.targetId)
      .replace('${token}', colors.yellow(request.tokenId)) + '\n');
  });

  it('Should instance isAccountKYCGranted when granted', async () => {
    jest.spyOn(StableCoin, 'isAccountKYCGranted').mockResolvedValue(true);
    await service.isAccountKYCGranted(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.isAccountKYCGranted).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(language.getText('state.accountKYCGranted')
      .replace('${address}', request.targetId)
      .replace('${token}', colors.yellow(request.tokenId)) + '\n');
  });
});
