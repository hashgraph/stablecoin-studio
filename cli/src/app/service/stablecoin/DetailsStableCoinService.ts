import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  GetStableCoinDetailsRequest,
  StableCoin,
  StableCoinViewModel,
  Proxy,
  GetProxyConfigRequest,
  ProxyConfigurationViewModel,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import FeeStableCoinService from './FeeStableCoinService.js';

/**
 * Create Stable Coin Service
 */
export default class DetailsStableCoinsService extends Service {
  constructor() {
    super('Details Stable Coin');
  }

  private epochTimestampToGMTString(timestamp: number | undefined): string {
    if (!timestamp) return '';
    const dateTime: string = timestamp.toString().substring(0, 10);
    const nanoseconds: string = timestamp.toString().substring(10);
    const myDate: Date = new Date(+dateTime * 1000);
    const gmtDate: string = myDate.toUTCString();
    const pos: number = gmtDate.lastIndexOf(' ');
    return `${gmtDate.substring(0, pos)}.${nanoseconds.substring(
      0,
      4,
    )}${gmtDate.substring(pos, gmtDate.length)}`;
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
      let proxyConfig: ProxyConfigurationViewModel;

      await utilsService.showSpinner(
        Proxy.getProxyConfig(
          new GetProxyConfigRequest({
            tokenId: id,
          }),
        ).then((response) => (proxyConfig = response)),
        {
          text: language.getText('state.loading'),
          successText: language.getText('state.proxyConfigCompleted') + '\n',
        },
      );

      const reserveData = respDetail.reserveAddress
        ? {
            reserveAddress: respDetail?.reserveAddress.toString(),
            reserveAmount: respDetail?.reserveAmount.toString(),
          }
        : {};

      const out = {
        ...respDetail,
        tokenId: respDetail.tokenId.toString(),
        initialSupply: respDetail.initialSupply.toString(),
        maxSupply: respDetail.maxSupply.toString(),
        totalSupply: respDetail.totalSupply.toString(),
        proxyAddress: respDetail.proxyAddress.toString(),
        proxyAdminAddress: respDetail.proxyAdminAddress.toString(),
        evmProxyAddress: respDetail.evmProxyAddress.toString(),
        evmProxyAdminAddress: respDetail.evmProxyAdminAddress.toString(),
        proxyImplementationAddress:
          proxyConfig.implementationAddress.toString(),
        proxyOwner: proxyConfig.owner.toString(),
        proxyPendingOwner: proxyConfig.pendingOwner.toString(),
        treasury: respDetail.treasury.toString(),
        autoRenewPeriod: respDetail?.autoRenewPeriod
          ? `${respDetail.autoRenewPeriod / 24 / 3600} days`
          : '-',
        autoRenewAccount: respDetail.autoRenewAccount.toString(),
        expirationTimestamp: respDetail?.expirationTimestamp
          ? this.epochTimestampToGMTString(respDetail.expirationTimestamp)
          : '-',
        adminKey: respDetail.adminKey ? respDetail.adminKey.toString() : '-',
        freezeKey: respDetail.freezeKey ? respDetail.freezeKey.toString() : '-',
        kycKey: respDetail.kycKey ? respDetail.kycKey.toString() : '-',
        wipeKey: respDetail.wipeKey ? respDetail.wipeKey.toString() : '-',
        supplyKey: respDetail.supplyKey ? respDetail.supplyKey.toString() : '-',
        pauseKey: respDetail.pauseKey ? respDetail.pauseKey.toString() : '-',
        feeScheduleKey: respDetail.feeScheduleKey
          ? respDetail.feeScheduleKey.toString()
          : '-',
        customFees: new FeeStableCoinService().getSerializedFees(
          respDetail.customFees,
        ),
        metadata: respDetail.metadata ? respDetail.metadata.toString() : '',
        ...reserveData,
      };
      console.log(out);
      utilsService.breakLine();
    }
    return respDetail;
  }
}
