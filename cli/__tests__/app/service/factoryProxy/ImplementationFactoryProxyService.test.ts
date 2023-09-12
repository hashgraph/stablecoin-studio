import {
  Proxy,
  UpgradeFactoryImplementationRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import ImplementationFactoryProxyService from '../../../../src/app/service/factoryProxy/ImplementationFactoryProxyService.js';
import Language from '../../../../src/domain/language/Language.js';

const language: Language = new Language();

describe('implementationFactoryProxyService', () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should upgrade the factory implementation', async () => {
    // mocks
    jest.spyOn(console, 'log');
    const upgradeFactoryImplementationMock = jest
      .spyOn(Proxy, 'upgradeFactoryImplementation')
      .mockImplementation(() => Promise.resolve(true));

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValue('0.0.345678');

    // create method request
    const req: UpgradeFactoryImplementationRequest =
      new UpgradeFactoryImplementationRequest({
        factoryId: '0.0.123456',
        implementationAddress: '0.0.234567',
      });

    // method call
    await new ImplementationFactoryProxyService().upgradeImplementation(
      req,
      '0.0.456789',
    );

    // verify
    expect(defaultSingleAskMock).toHaveBeenCalled();
    expect(upgradeFactoryImplementationMock).toHaveBeenCalled();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
