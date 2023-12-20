/*
 *
 * Hedera Stablecoin SDK
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

/**
 * Represents a request for a digital signature.
 * This class encapsulates the data needed to request a signature, primarily the transaction bytes.
 *
 * @export
 * @class SignatureRequest
 */
export class SignatureRequest {
  /**
   * Transaction bytes representing the data to be signed.
   *
   * @private
   * @type {Uint8Array}
   */
  private transactionBytes: Uint8Array;

  /**
   * Creates an instance of SignatureRequest.
   *
   * @param {Uint8Array} transactionBytes - The transaction bytes that need to be signed.
   */
  constructor(transactionBytes: Uint8Array) {
    this.transactionBytes = transactionBytes;
  }

  /**
   * Gets the transaction bytes that need to be signed.
   *
   * @public
   * @returns {Uint8Array} The transaction bytes.
   */
  public getTransactionBytes(): Uint8Array {
    return this.transactionBytes;
  }

  /**
   * Sets or updates the transaction bytes that need to be signed.
   *
   * @public
   * @param {Uint8Array} transactionBytes - The new transaction bytes.
   */
  public setTransactionBytes(transactionBytes: Uint8Array): void {
    this.transactionBytes = transactionBytes;
  }
}

