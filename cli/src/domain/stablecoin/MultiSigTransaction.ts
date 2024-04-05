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

import { UUID } from 'crypto';

export enum Status {
  Pending = 'PENDING',
  Signed = 'SIGNED',
}

export default class MultiSigTransaction {
  id: UUID;
  message: string;
  description: string;
  hederaAccountId: string;
  signatures: string[];
  keyList: string[];
  signedKeys: string[];
  status: Status;
  threshold: number;

  constructor({
    id,
    message,
    description,
    hederaAccountId,
    signatures,
    keyList,
    signedKeys,
    status,
    threshold,
  }: {
    id: UUID | string;
    message: string;
    description: string;
    hederaAccountId: string;
    signatures: string[];
    keyList: string[];
    signedKeys: string[];
    status: string | Status;
    threshold: number;
  }) {
    this.id = this.validateId(id);
    this.message = this.validateMessage(message);
    this.description = this.validateDescription(description);
    this.hederaAccountId = this.validateHederaAccountId(hederaAccountId);
    this.signatures = signatures;
    this.keyList = this.validateKeyList(keyList);
    this.signedKeys = signedKeys;
    this.status = this.validateStatus(status);
    this.threshold = this.validateThreshold(threshold, keyList);
  }

  // * Validators
  private validateId(id: UUID | string): UUID {
    const uuidv4Regex = /^([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)$/i;
    if (!uuidv4Regex.test(id)) {
      throw new Error('Invalid UUIDv4 format for id');
    }
    return id as UUID;
  }

  private validateMessage(message: string): string {
    if (!message || message.trim() === '' || message.length < 10) {
      throw new Error(
        'Invalid message. It should not be undefined, empty, and should have at least 10 characters.',
      );
    }
    return message;
  }

  private validateDescription(description: string): string {
    if (!description || description.trim() === '' || description.length < 10) {
      throw new Error(
        'Invalid description. It should not be undefined, empty, and should have at least 10 characters.',
      );
    }
    return description;
  }

  private validateHederaAccountId(hederaAccountId: string): string {
    const hederaAccountIdRegex = /\d\.\d\.\d/;
    if (!hederaAccountIdRegex.test(hederaAccountId)) {
      throw new Error(
        'Invalid Hedera Account Id. It should be in the format 0.0.0',
      );
    }
    return hederaAccountId;
  }

  private validateKeyList(keyList: string[]): string[] {
    if (keyList.length < 2) {
      throw new Error('Invalid keyList. It should have at least 2 items.');
    }
    for (const key of keyList) {
      if (key.length < 10) {
        throw new Error('Invalid key. It should be longer than 10 characters.');
      }
    }
    return keyList;
  }

  private validateStatus(status: string | Status): Status {
    if (!Object.values(Status).includes(status as Status)) {
      throw new Error('Invalid status. It should be either PENDING or SIGNED.');
    }
    return status as Status;
  }

  private validateThreshold(threshold: number, keyList: string[]): number {
    if (threshold <= 0 || threshold > keyList.length) {
      throw new Error(
        'Invalid threshold. It should be greater than 0 and lower or equal to the keyList length.',
      );
    }
    return threshold;
  }
}
