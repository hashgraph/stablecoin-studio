import {
  ChangeFactoryProxyOwnerRequest,
  Proxy,
} from '@hashgraph/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import OwnerFactoryProxyService from '../../../../src/app/service/factoryProxy/OwnerFactoryProxyService.js';
import Language from '../../../../src/domain/language/Language.js';

const language: Language = new Language();

describe('ownerFactoryProxyService', () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should change the factory proxy admin owner', async () => {
    // mocks
    jest.spyOn(console, 'log');
    const changeFactoryProxyOwnerMock = jest
      .spyOn(Proxy, 'changeFactoryProxyOwner')
      .mockImplementation(() => Promise.resolve(true));

    // create method request
    const req: ChangeFactoryProxyOwnerRequest =
      new ChangeFactoryProxyOwnerRequest({
        factoryId: '0.0.123456',
        targetId: '0.0.234567',
      });

    // method call
    await new OwnerFactoryProxyService().changeFactoryProxyOwner(req);

    // verify
    expect(changeFactoryProxyOwnerMock).toHaveBeenCalled();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
