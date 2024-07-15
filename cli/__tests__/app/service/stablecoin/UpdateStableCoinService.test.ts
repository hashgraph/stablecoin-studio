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

import { StableCoin, UpdateRequest } from '@hashgraph/stablecoin-npm-sdk';
import UpdateStableCoinService from '../../../../src/app/service/stablecoin/UpdateStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new UpdateStableCoinService();
const language: Language = new Language();
const token = '0.0.234567';
const name = 'tokenName';
const symbol = 'TK';
const autoRenewPeriod = '5556456';
const expirationTimestamp = '12345678945';
const metadata = 'metadata';
const freezeKey = {
  key: 'freezeKey',
  type: 'freezeKeyType',
};
const kycKey = {
  key: 'kycKey',
  type: 'kycKeyType',
};
const wipeKey = {
  key: 'wipeKey',
  type: 'wipeKeyType',
};
const pauseKey = {
  key: 'pauseKey',
  type: 'pauseKeyType',
};
const feeScheduleKey = {
  key: 'feeScheduleKey',
  type: 'feeScheduleKeyType',
};
const request = new UpdateRequest({
  tokenId: token,
  name: name,
  symbol: symbol,
  autoRenewPeriod: autoRenewPeriod,
  expirationTimestamp: expirationTimestamp,
  freezeKey: freezeKey,
  kycKey: kycKey,
  wipeKey: wipeKey,
  pauseKey: pauseKey,
  feeScheduleKey: feeScheduleKey,
  metadata: metadata,
});

describe(`Testing UpdateStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance update', async () => {
    const updateMock = jest
      .spyOn(StableCoin, 'update')
      .mockImplementation(async (request: UpdateRequest): Promise<boolean> => {
        expect(request.tokenId).toEqual(token);
        expect(request.name).toEqual(name);
        expect(request.symbol).toEqual(symbol);
        expect(request.autoRenewPeriod).toEqual(autoRenewPeriod);
        expect(request.expirationTimestamp).toEqual(expirationTimestamp);
        expect(request.metadata).toEqual(metadata);
        expect(request.freezeKey.key).toEqual(freezeKey.key);
        expect(request.freezeKey.type).toEqual(freezeKey.type);
        expect(request.kycKey.key).toEqual(kycKey.key);
        expect(request.kycKey.type).toEqual(kycKey.type);
        expect(request.wipeKey.key).toEqual(wipeKey.key);
        expect(request.wipeKey.type).toEqual(wipeKey.type);
        expect(request.pauseKey.key).toEqual(pauseKey.key);
        expect(request.pauseKey.type).toEqual(pauseKey.type);
        expect(request.feeScheduleKey.key).toEqual(feeScheduleKey.key);
        expect(request.feeScheduleKey.type).toEqual(feeScheduleKey.type);
        return false;
      });

    await service.update(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
