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
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { hexRegex } from '../../common/regexp';
import { RemoveHexPrefix } from '../../common/decorators/transform-hexPrefix.decorator';

export class SignTransactionRequestDto {
  @ApiProperty({
    description: 'The signature of the transaction message',
    example:
      'e120be5fa7fa085c989e69b60b6f80218d8a49751abc84456bc8bd88ba3766101b658d45ebd7e0b742382e9bd8ad98a88f03a9d6118cad42da275531e068a50b',
    minLength: 10,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @RemoveHexPrefix()
  signature: string;

  @ApiProperty({
    description: 'The public key used to sign the transaction',
    example: 'cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @RemoveHexPrefix()
  @Matches(hexRegex, {
    each: true,
    message: 'Each key must be ED25519 or ECDSA',
  })
  public_key: string;

  constructor(signature: string, public_key: string) {
    this.signature = signature;
    this.public_key = public_key;
  }
}
