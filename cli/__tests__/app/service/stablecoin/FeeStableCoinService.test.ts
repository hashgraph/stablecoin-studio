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
  AddFixedFeeRequest,
  AddFractionalFeeRequest,
  Fees,
  RequestFixedFee,
  RequestFractionalFee,
  UpdateCustomFeesRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import FeeStableCoinService from '../../../../src/app/service/stablecoin/FeeStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new FeeStableCoinService();
const language: Language = new Language();

describe(`Testing FeeStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(console, 'log');
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance addFixedFee', async () => {
    jest.spyOn(Fees, 'addFixedFee').mockImplementation();
    const request = new AddFixedFeeRequest({
      tokenId: 'tokenId',
      collectorId: 'collectorId',
      collectorsExempt: true,
      decimals: 10,
      tokenIdCollected: 'tokenIdCollected',
      amount: '10',
    });

    await service.addFixedFee(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Fees.addFixedFee).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance addFractionalFee', async () => {
    jest.spyOn(Fees, 'addFractionalFee').mockImplementation();
    const request = new AddFractionalFeeRequest({
      tokenId: 'tokenId',
      collectorId: 'collectorId',
      collectorsExempt: true,
      decimals: 10,
      net: true,
    });
    await service.addFractionalFee(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Fees.addFractionalFee).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance updateFees', async () => {
    jest.spyOn(Fees, 'updateCustomFees').mockImplementation();
    const request = new UpdateCustomFeesRequest({
      customFees: [
        {
          collectorId: 'collectorId',
          collectorsExempt: true,
          decimals: 10,
        },
      ],
      tokenId: 'tokenId',
    });
    await service.updateFees(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Fees.updateCustomFees).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance getSerializedFees as RequestFixedFee', () => {
    const listOfFees = [
      {
        collectorId: 'collectorId',
        tokenIdCollected: 'tokenIdCollected',
        collectorsExempt: true,
        decimals: 10,
        amount: '10',
      } as RequestFixedFee,
    ];
    const serializedFees = service.getSerializedFees(listOfFees);

    expect(service).not.toBeNull();
    expect(serializedFees).toEqual([
      ' | Fixed | tokenIdCollected | 10 | collectorId | true',
    ]);
  });

  it('Should instance getSerializedFees as RequestFixedFee and HBAR', () => {
    const listOfFees = [
      {
        collectorId: 'collectorId',
        tokenIdCollected: '0.0.0',
        collectorsExempt: true,
        decimals: 10,
        amount: '10',
      } as RequestFixedFee,
    ];
    const serializedFees = service.getSerializedFees(listOfFees);

    expect(service).not.toBeNull();
    expect(serializedFees).toEqual([
      ' | Fixed | HBAR | 10 | collectorId | true',
    ]);
  });

  it('Should instance getSerializedFees as RequestFractionalFee', () => {
    const listOfFees = [
      {
        collectorId: 'collectorId',
        tokenIdCollected: 'tokenIdCollected',
        collectorsExempt: true,
        decimals: 10,
        percentage: 'percentage',
        amountNumerator: 'amountNumerator',
        amountDenominator: 'amountDenominator',
        min: 'min',
        max: 'max',
        net: true,
      } as RequestFractionalFee,
    ];
    const serializedFees = service.getSerializedFees(listOfFees);

    expect(service).not.toBeNull();
    expect(serializedFees).toEqual([
      ' | Fractional | percentage | Min: min | Max: max | collectorId | true | Sender',
    ]);
  });

  it('Should instance getSerializedFees as RequestFractionalFee and max unlimited and Receiver', () => {
    const listOfFees = [
      {
        collectorId: 'collectorId',
        tokenIdCollected: 'tokenIdCollected',
        collectorsExempt: true,
        decimals: 10,
        percentage: 'percentage',
        amountNumerator: 'amountNumerator',
        amountDenominator: 'amountDenominator',
        min: 'min',
        max: '0',
        net: false,
      } as RequestFractionalFee,
    ];
    const serializedFees = service.getSerializedFees(listOfFees);

    expect(service).not.toBeNull();
    expect(serializedFees).toEqual([
      ' | Fractional | percentage | Min: min | Max: unlimited | collectorId | true | Receiver',
    ]);
  });

  it('Should instance getRemainingFees', () => {
    const remainingFees = service.getRemainingFees(
      [
        {
          collectorId: 'collectorId',
          collectorsExempt: true,
          decimals: 6,
        },
      ],
      ['1', '2', '3'],
      ['2'],
    );

    expect(service).not.toBeNull();
    expect(remainingFees).toEqual([
      {
        collectorId: 'collectorId',
        collectorsExempt: true,
        decimals: 6,
      },
    ]);
  });
});
