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

export const URL_REGEX = /^(http|https):\/\/[^ "]+$/;

/**
 * Represents a URL.
 */
export default class URL {
  private value: string; // The URL value.

  constructor({ value }: { value: string }) {
    this.value = this.validateValue({ value });
  }

  /**
   * Returns the string representation of the URL.
   * @returns The URL as a string.
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Creates a new URL instance from a string.
   * @param value - The string representation of the URL.
   * @returns A new URL instance.
   */
  static fromString({ value }: { value: string }): URL {
    return new URL({ value });
  }

  /**
   * Validates if a string is a valid URL.
   * @param value - The string to validate.
   * @returns A boolean indicating if the string is a valid URL.
   */
  static validate({ value }: { value: string }): boolean {
    return URL_REGEX.test(value);
  }

  private validateValue({ value }: { value: string }): string {
    if (!URL_REGEX.test(value)) {
      throw new Error('Invalid URL format');
    }
    return value;
  }
}
