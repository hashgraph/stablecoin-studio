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
import { keyRegex } from '../../common/regexp';

export class SignTransactionRequestDto {
  @ApiProperty({
    description: 'The signature of the transaction message',
    example:
      '0a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001807188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001809188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001804188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda038801001200',
    minLength: 10,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  signature: string;

  @ApiProperty({
    description: 'The public key used to sign the transaction',
    example: '75ec8c1997089874ce881690e95900f821a7f69152814728be971e67e4bc2224',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(keyRegex, {
    each: true,
    message: 'Each key must be ED25519 or ECDSA',
  })
  public_key: string;

  constructor(signature: string, public_key: string) {
    this.signature = signature;
    this.public_key = public_key;
  }
}
