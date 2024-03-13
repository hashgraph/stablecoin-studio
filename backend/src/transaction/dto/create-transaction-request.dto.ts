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

import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsString, Matches, Min } from 'class-validator';
import { hederaIdRegex, hexRegex } from '../../common/regexp';
import { RemoveHexPrefix } from '../../common/decorators/transform-hexPrefix.decorator';

export class CreateTransactionRequestDto {
  @ApiProperty({
    description: 'The message to be signed by the keys',
    example:
      '0a1a0a0c0892d5c0af0610efaedd950312080800100018c3bf0c180012080800100018c3bf0c1880c2d72f22020878320072020a00',
    minLength: 10,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  transaction_message: string;

  @ApiProperty({
    description: 'A description of the transaction',
    example: 'This transaction is for the creation of a new StableCoin',
    minLength: 5,
    maxLength: 200,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The Hedera Account ID used for this transaction',
    example: '0.0.123456',
    required: true,
  })
  @IsString()
  @Matches(hederaIdRegex, {
    message:
      'Hedera Account ID must be in the format shard.realm.account with each part being a number',
  })
  hedera_account_id: string;

  @ApiProperty({
    description: 'A list of public keys to be used for signing the transaction',
    example: [
      'cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e',
      'c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e',
      '0e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f',
    ],
    required: true,
  })
  @RemoveHexPrefix()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(hexRegex, {
    each: true,
    message: 'Each key must be ED25519 or ECDSA',
  })
  key_list: string[];

  @ApiProperty({
    description: 'The number of keys required to sign the transaction',
    example: 1,
    default: 0, // KeyList with no threshold
    required: true,
  })
  @IsInt()
  @Min(0)
  threshold: number;

  constructor(
    transaction_message: string,
    description: string,
    hedera_account_id: string,
    key_list: string[],
    threshold: number,
  ) {
    this.transaction_message = transaction_message;
    this.description = description;
    this.hedera_account_id = hedera_account_id;
    this.key_list = key_list;
    this.threshold = threshold;
  }
}
