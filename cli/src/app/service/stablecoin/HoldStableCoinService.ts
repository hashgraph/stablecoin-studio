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

import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  CreateHoldRequest,
  StableCoin,
  CreateHoldByControllerRequest,
  ExecuteHoldRequest,
  ReleaseHoldRequest,
  ReclaimHoldRequest,
  GetHeldAmountForRequest,
  GetHoldsIdForRequest,
  GetHoldCountForRequest,
  GetHoldForRequest,
  HoldViewModel,
} from '@hashgraph/stablecoin-npm-sdk';
import colors from 'colors';

/**
 * Hold Stablecoin Service
 */
export default class HoldStableCoinService extends Service {
  constructor() {
    super('Hold Stablecoin');
  }

  public async createHold(req: CreateHoldRequest): Promise<void> {
    let holdId: number;
    await utilsService.showSpinner(
      StableCoin.createHold(req).then((response) => (holdId = response.holdId)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    const response = language.getText('state.holdCreated');

    console.log(
      response.replace('${holdId}', colors.yellow(holdId.toString())) + '\n',
    );

    utilsService.breakLine();
  }

  public async createHoldByController(
    req: CreateHoldByControllerRequest,
  ): Promise<void> {
    let holdId: number;
    await utilsService.showSpinner(
      StableCoin.createHoldByController(req).then(
        (response) => (holdId = response.holdId),
      ),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    const response = language.getText('state.holdCreated');

    console.log(
      response.replace('${holdId}', colors.yellow(holdId.toString())) + '\n',
    );

    utilsService.breakLine();
  }

  public async executeHold(req: ExecuteHoldRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.executeHold(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.holdExecuted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async releaseHold(req: ReleaseHoldRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.releaseHold(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.holdReleased') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async reclaimHold(req: ReclaimHoldRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.reclaimHold(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.holdReclaimed') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async getHeldAmountFor(req: GetHeldAmountForRequest): Promise<void> {
    let heldAmount: string;
    await utilsService.showSpinner(
      StableCoin.getHeldAmountFor(req).then(
        (response) => (heldAmount = response.toString()),
      ),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(
      language
        .getText('state.holdBalance')
        .replace('${address}', req.sourceId)
        .replace('${amount}', colors.yellow(heldAmount)) + '\n',
    );

    utilsService.breakLine();
  }

  public async getHoldsIdFor(req: GetHoldsIdForRequest): Promise<void> {
    let holdsId: number[];
    await utilsService.showSpinner(
      StableCoin.getHoldsIdFor(req).then((response) => (holdsId = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(
      language
        .getText('state.holdsId')
        .replace('${address}', req.sourceId)
        .replace(
          '${holdsId}',
          colors.yellow(
            holdsId.length > 0
              ? holdsId.map((item) => item.toString()).join(', ')
              : 'None',
          ),
        ) + '\n',
    );

    utilsService.breakLine();
  }

  public async getHoldCount(req: GetHoldCountForRequest): Promise<void> {
    let holdCount: string;
    await utilsService.showSpinner(
      StableCoin.getHoldCountFor(req).then(
        (response) => (holdCount = response.toString()),
      ),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(
      language
        .getText('state.holdCount')
        .replace('${address}', req.sourceId)
        .replace('${holdCount}', colors.yellow(holdCount)) + '\n',
    );

    utilsService.breakLine();
  }

  public async getHoldFor(req: GetHoldForRequest): Promise<void> {
    let holdDetails: HoldViewModel;
    await utilsService.showSpinner(
      StableCoin.getHoldFor(req).then((response) => (holdDetails = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(
      language
        .getText('state.holdDetails')
        .replace('${address}', req.sourceId)
        .replace('${holdId}', req.holdId.toString())
        .replace(
          '${holdDetails}',
          colors.yellow(JSON.stringify(holdDetails, null, 2)),
        ) + '\n',
    );

    utilsService.breakLine();
  }
}
