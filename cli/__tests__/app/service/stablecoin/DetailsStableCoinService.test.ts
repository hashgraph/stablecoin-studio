/*
 *
 * Hedera Stablecoin CLI
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
  BigDecimal,
  StableCoin,
  HederaId,
  ContractId,
  EvmAddress,
  PublicKey,
} from '@hashgraph/stablecoin-npm-sdk';
import DetailsStableCoinService from '../../../../src/app/service/stablecoin/DetailsStableCoinService';
import { utilsService } from '../../../../src/index.js';
import { RequestFixedFee } from '@hashgraph/stablecoin-npm-sdk';

const service = new DetailsStableCoinService();
const id = 'id;';
const mockedSelectedStableCoin = {
  tokenId: HederaId.from('0.0.49319786'),
  name: 'TEST_ACCELERATOR_SC',
  symbol: 'TEST',
  decimals: 6,
  initialSupply: BigDecimal.fromString('1000.', 6),
  totalSupply: BigDecimal.fromString('1000.', 6),
  maxSupply: BigDecimal.fromString('1000', 6),
  proxyAddress: new ContractId('0.0.49319785'),
  evmProxyAddress: new EvmAddress('0000000000000000000000000000000002f08f69'),
  treasury: HederaId.from('0.0.49319785'),
  paused: false,
  deleted: false,
  freezeDefault: false,
  autoRenewAccount: HederaId.from('0.0.49071854'),
  autoRenewPeriod: 90,
  adminKey: new ContractId('0.0.49319785'),
  freezeKey: new ContractId('0.0.49319785'),
  kycKey: new ContractId('0.0.49319785'),
  wipeKey: new ContractId('0.0.49319785'),
  supplyKey: new ContractId('0.0.49319785'),
  pauseKey: new ContractId('0.0.49319785'),
  customFees: [
    {
      collectorId: 'collectorId',
      tokenIdCollected: '0.0.0',
      collectorsExempt: true,
      decimals: 10,
      amount: '10',
    } as RequestFixedFee,
  ],
  expirationTimestamp: 1687791349,
  metadata: 'metadata',
  feeScheduleKey: new PublicKey('publicKey'),
  configId:
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  configVersion: 1,
};

describe(`Testing DetailsStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(utilsService, 'showMessage').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'dir').mockImplementation();
    jest
      .spyOn(StableCoin, 'getInfo')
      .mockResolvedValue(mockedSelectedStableCoin);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance getDetailsStableCoins show in false', async () => {
    const respDetail = await service.getDetailsStableCoins(id, false);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.getInfo).toHaveBeenCalledTimes(1);
    expect(respDetail.name).toEqual(mockedSelectedStableCoin.name);
  });

  it('Should instance getDetailsStableCoins show in true', async () => {
    jest.spyOn(console, 'log');
    const respDetail = await service.getDetailsStableCoins(id);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.getInfo).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalled();
    expect(respDetail.name).toEqual(mockedSelectedStableCoin.name);
  });

  it('Should instance getDetailsStableCoins show in true and no data', async () => {
    const mockedStableCoin = {
      tokenId: HederaId.from('0.0.49319786'),
      name: 'TEST_ACCELERATOR_SC',
      symbol: 'TEST',
      decimals: 6,
      initialSupply: BigDecimal.fromString('1000.', 6),
      totalSupply: BigDecimal.fromString('1000.', 6),
      maxSupply: BigDecimal.fromString('1000', 6),
      proxyAddress: new ContractId('0.0.49319785'),
      reserveAddress: new ContractId('0.0.49319785'),
      reserveAmount: BigDecimal.fromString('1000.', 6),
      evmProxyAddress: new EvmAddress(
        '0000000000000000000000000000000002f08f69',
      ),
      treasury: HederaId.from('0.0.49319785'),
      paused: false,
      deleted: false,
      freezeDefault: false,
      autoRenewAccount: HederaId.from('0.0.49071854'),
      customFees: [
        {
          collectorId: 'collectorId',
          tokenIdCollected: '0.0.0',
          collectorsExempt: true,
          decimals: 10,
          amount: '10',
        } as RequestFixedFee,
      ],
      expirationTimestamp: undefined,
    };
    jest.spyOn(StableCoin, 'getInfo').mockResolvedValue(mockedStableCoin);
    jest.spyOn(console, 'log');
    const respDetail = await service.getDetailsStableCoins(id);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.getInfo).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalled();
    expect(respDetail.name).toEqual(mockedSelectedStableCoin.name);
  });
});
