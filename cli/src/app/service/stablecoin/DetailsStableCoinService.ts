import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  GetStableCoinDetailsRequest,
  StableCoin,
  StableCoinViewModel,
} from 'hedera-stable-coin-sdk';
import FeeStableCoinService from './FeeStableCoinService.js';

/**
 * Create Stable Coin Service
 */
export default class DetailsStableCoinsService extends Service {
  constructor() {
    super('Details Stable Coin');
  }

  public async getDetailsStableCoins(
    id: string,
    show = true,
  ): Promise<StableCoinViewModel> {
    // Call to list stable coins

    let respDetail: StableCoinViewModel;

    await utilsService.showSpinner(
      StableCoin.getInfo(
        new GetStableCoinDetailsRequest({
          id,
        }),
      ).then((response) => (respDetail = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.detailsCompleted') + '\n',
      },
    );

    if (show) {
      const reserveData = respDetail.reserveAddress
        ? {
            reserveAddress: respDetail?.reserveAddress.toString(),
            reserveAmount: respDetail?.reserveAmount.toString(),
          }
        : {};

      const requestCustomFees = new FeeStableCoinService().toRequestCustomFees(
        respDetail.customFees,
      );

      const out = {
        ...respDetail,
        tokenId: respDetail.tokenId.toString(),
        initialSupply: respDetail.initialSupply.toString(),
        maxSupply: respDetail.maxSupply.toString(),
        totalSupply: respDetail.totalSupply.toString(),
        proxyAddress: respDetail.proxyAddress.toString(),
        evmProxyAddress: respDetail.proxyAddress.toString(),
        treasury: respDetail.treasury.toString(),
        autoRenewAccount: respDetail.autoRenewAccount.toString(),
        adminKey: respDetail.adminKey ? respDetail.adminKey.toString() : '-',
        freezeKey: respDetail.freezeKey ? respDetail.freezeKey.toString() : '-',
        kycKey: respDetail.kycKey ? respDetail.kycKey.toString() : '-',
        wipeKey: respDetail.wipeKey ? respDetail.wipeKey.toString() : '-',
        supplyKey: respDetail.supplyKey ? respDetail.supplyKey.toString() : '-',
        pauseKey: respDetail.pauseKey ? respDetail.pauseKey.toString() : '-',
        feeScheduleKey: respDetail.feeScheduleKey
          ? respDetail.feeScheduleKey.toString()
          : '-',
        customFees: new FeeStableCoinService().getFormatedFees(
          requestCustomFees,
        ),
        ...reserveData,
      };
      console.log(out);
      utilsService.breakLine();
    }
    return respDetail;
  }
}
