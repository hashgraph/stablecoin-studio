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
  CreateHoldByControllerRequest,
  CreateHoldRequest,
  ExecuteHoldRequest,
  GetHeldAmountForRequest,
  GetHoldCountForRequest,
  GetHoldForRequest,
  GetHoldsIdForRequest,
  HoldViewModel,
  ReclaimHoldRequest,
  ReleaseHoldRequest,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import HoldStableCoinService from '../../../../src/app/service/stablecoin/HoldStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import colors from 'colors';

const service = new HoldStableCoinService();
const language: Language = new Language();
const token = '0.0.234567';
const account = '0.0.356789';

const holdId = 0;
const holdDestination = account;
const amount = '10';
const escrow = account;
const expirationDate: string = Math.floor(
  Date.now() / 1000 + 7 * 24 * 3600,
).toString();
const sourceId = account;

describe(`Testing HoldStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(utilsService, 'showMessage').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'dir').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance createHold', async () => {
    const createRequest = new CreateHoldRequest({
      tokenId: token,
      amount,
      targetId: holdDestination,
      escrow,
      expirationDate,
    });

    const createHoldMock = jest
      .spyOn(StableCoin, 'createHold')
      .mockImplementation(
        async (
          request: CreateHoldRequest,
        ): Promise<{ holdId: number; payload: boolean }> => {
          expect(request.targetId).toEqual(holdDestination);
          expect(request.tokenId).toEqual(token);
          expect(request.escrow).toEqual(escrow);
          expect(request.expirationDate).toEqual(expirationDate);
          expect(request.amount).toEqual(amount);
          return {
            holdId: 0,
            payload: true,
          };
        },
      );

    await service.createHold(createRequest);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(createHoldMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('state.holdCreated')
        .replace('${holdId}', colors.yellow(holdId.toString())) + '\n',
    );
  });

  it('Should instance createHoldByController', async () => {
    const forceCreateRequest = new CreateHoldByControllerRequest({
      tokenId: token,
      amount,
      targetId: holdDestination,
      escrow,
      expirationDate,
      sourceId,
    });

    const createHoldByControllerMock = jest
      .spyOn(StableCoin, 'createHoldByController')
      .mockImplementation(
        async (
          request: CreateHoldByControllerRequest,
        ): Promise<{ holdId: number; payload: boolean }> => {
          expect(request.targetId).toEqual(holdDestination);
          expect(request.tokenId).toEqual(token);
          expect(request.escrow).toEqual(escrow);
          expect(request.expirationDate).toEqual(expirationDate);
          expect(request.amount).toEqual(amount);
          expect(request.sourceId).toEqual(sourceId);
          return {
            holdId: 0,
            payload: true,
          };
        },
      );

    await service.createHoldByController(forceCreateRequest);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(createHoldByControllerMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('state.holdCreated')
        .replace('${holdId}', colors.yellow(holdId.toString())) + '\n',
    );
  });

  it('Should instance executeHold', async () => {
    const executeRequest = new ExecuteHoldRequest({
      tokenId: token,
      amount,
      targetId: holdDestination,
      sourceId,
      holdId,
    });

    const executeHoldMock = jest
      .spyOn(StableCoin, 'executeHold')
      .mockImplementation(
        async (request: ExecuteHoldRequest): Promise<boolean> => {
          expect(request.tokenId).toEqual(token);
          expect(request.targetId).toEqual(holdDestination);
          expect(request.sourceId).toEqual(sourceId);
          expect(request.amount).toEqual(amount);
          expect(request.holdId).toEqual(holdId);
          return true;
        },
      );

    await service.executeHold(executeRequest);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(executeHoldMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance releaseHold', async () => {
    const releaseRequest = new ReleaseHoldRequest({
      tokenId: token,
      amount,
      sourceId,
      holdId,
    });

    const releaseHoldMock = jest
      .spyOn(StableCoin, 'releaseHold')
      .mockImplementation(
        async (request: ExecuteHoldRequest): Promise<boolean> => {
          expect(request.tokenId).toEqual(token);
          expect(request.sourceId).toEqual(sourceId);
          expect(request.amount).toEqual(amount);
          expect(request.holdId).toEqual(holdId);
          return true;
        },
      );

    await service.releaseHold(releaseRequest);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(releaseHoldMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance reclaimHold', async () => {
    const reclaimRequest = new ReclaimHoldRequest({
      tokenId: token,
      sourceId,
      holdId,
    });

    const reclaimHoldMock = jest
      .spyOn(StableCoin, 'reclaimHold')
      .mockImplementation(
        async (request: ReclaimHoldRequest): Promise<boolean> => {
          expect(request.tokenId).toEqual(token);
          expect(request.sourceId).toEqual(sourceId);
          expect(request.holdId).toEqual(holdId);
          return true;
        },
      );

    await service.reclaimHold(reclaimRequest);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(reclaimHoldMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance getHeldAmountFor', async () => {
    const getHeldAmountForRequest = new GetHeldAmountForRequest({
      tokenId: token,
      sourceId,
    });

    const getHeldAmountForMock = jest
      .spyOn(StableCoin, 'getHeldAmountFor')
      .mockImplementation(
        async (request: GetHeldAmountForRequest): Promise<BigDecimal> => {
          expect(request.tokenId).toEqual(token);
          expect(request.sourceId).toEqual(sourceId);
          return BigDecimal.fromString(amount);
        },
      );

    await service.getHeldAmountFor(getHeldAmountForRequest);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(getHeldAmountForMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('state.holdBalance')
        .replace('${address}', getHeldAmountForRequest.sourceId)
        .replace('${amount}', colors.yellow(amount)) + '\n',
    );
  });

  it('Should instance getHoldFor', async () => {
    const getHoldForRequest = new GetHoldForRequest({
      tokenId: token,
      sourceId,
      holdId,
    });

    const response: HoldViewModel = {
      id: holdId,
      amount,
      expirationDate: new Date(Number(expirationDate) * 1000),
      tokenHolderAddress: sourceId,
      escrowAddress: escrow,
      destinationAddress: holdDestination,
      data: '0x',
    };

    const getHoldForMock = jest
      .spyOn(StableCoin, 'getHoldFor')
      .mockImplementation(
        async (request: GetHoldForRequest): Promise<HoldViewModel> => {
          expect(request.tokenId).toEqual(token);
          expect(request.sourceId).toEqual(sourceId);
          return response;
        },
      );

    await service.getHoldFor(getHoldForRequest);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(getHoldForMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('state.holdDetails')
        .replace('${address}', getHoldForRequest.sourceId)
        .replace('${holdId}', getHoldForRequest.holdId.toString())
        .replace(
          '${holdDetails}',
          colors.yellow(JSON.stringify(response, null, 2)),
        ) + '\n',
    );
  });

  it('Should instance getHoldsIdFor', async () => {
    const getHoldsIdForRequest = new GetHoldsIdForRequest({
      tokenId: token,
      sourceId,
      start: 0,
      end: 100,
    });

    const getHoldsIdForMock = jest
      .spyOn(StableCoin, 'getHoldsIdFor')
      .mockImplementation(
        async (request: GetHoldsIdForRequest): Promise<number[]> => {
          expect(request.tokenId).toEqual(token);
          expect(request.sourceId).toEqual(sourceId);
          expect(request.start).toEqual(0);
          expect(request.end).toEqual(100);
          return [holdId];
        },
      );

    await service.getHoldsIdFor(getHoldsIdForRequest);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(getHoldsIdForMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('state.holdsId')
        .replace('${address}', getHoldsIdForRequest.sourceId)
        .replace('${holdsId}', colors.yellow(holdId.toString())) + '\n',
    );
  });

  it('Should instance getHoldCountFor', async () => {
    const getHoldCountForRequest = new GetHoldCountForRequest({
      tokenId: token,
      sourceId,
    });

    const getHoldCountForMock = jest
      .spyOn(StableCoin, 'getHoldCountFor')
      .mockImplementation(
        async (request: GetHoldCountForRequest): Promise<number> => {
          expect(request.tokenId).toEqual(token);
          expect(request.sourceId).toEqual(sourceId);
          return 1;
        },
      );

    await service.getHoldCount(getHoldCountForRequest);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(getHoldCountForMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('state.holdCount')
        .replace('${address}', getHoldCountForRequest.sourceId)
        .replace('${holdCount}', colors.yellow('1')) + '\n',
    );
  });
});
