import { utilsService } from '../../../../src/index';

describe(`Testing UtilitiesService class`, () => {
  it('Should create instance', async () => {
    await utilsService.showBanner();

    expect(utilsService).not.toBeNull();
  });

  it('Should display error', () => {
    utilsService.showError('Testing error');

    expect(utilsService).not.toBeNull();
  });

  it('Should initialize SDK', () => {
    utilsService.initSDK('testnet');

    expect(utilsService).not.toBeNull();
  });
});
