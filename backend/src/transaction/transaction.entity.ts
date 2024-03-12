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

import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

export enum TransactionStatus {
  SIGNED = 'SIGNED',
  PENDING = 'PENDING',
}

@Entity()
export default class Transaction {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column('text')
  transaction_message: string;

  @Column()
  description: string;

  @Column()
  hedera_account_id: string;

  @Column('text', { array: true })
  signatures: string[];

  @Column('text', { array: true })
  key_list: string[];

  @Column('text', { array: true })
  signed_keys: string[];

  @Column()
  status: TransactionStatus;

  @Column()
  threshold: number;
}
