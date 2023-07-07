import {
  ChangeProxyOwnerRequest,
  Proxy,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import OwnerProxyService from '../../../../src/app/service/proxy/OwnerProxyService.js';

const language: Language = new Language();

describe('changeProxyOwner', () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should change the factory proxy admin owner', async () => {
    // mocks
    jest.spyOn(console, 'log');
    const changeProxyOwnerMock = jest
      .spyOn(Proxy, 'changeProxyOwner')
      .mockImplementation(() => Promise.resolve(true));

    
    // create method request
    const req: ChangeProxyOwnerRequest =
      new ChangeProxyOwnerRequest({
        tokenId: '0.0.123456',
        targetId: '0.0.234567',
      });

    // method call
    await new OwnerProxyService().changeProxyOwner(req);

    // verify
    expect(changeProxyOwnerMock).toHaveBeenCalled();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
