import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

export enum TransactionStatus {
  SIGN = 'SIGN',
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

  @Column('simple-array')
  signed_messages: string[];

  @Column('simple-array')
  key_list: string[];

  @Column('simple-array')
  signed_keys: string[];

  @Column()
  status: TransactionStatus;

  @Column()
  threshold: number;
}
