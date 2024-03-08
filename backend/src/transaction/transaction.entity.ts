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
  signed_messages: string[];

  @Column('text', { array: true })
  key_list: string[];

  @Column('text', { array: true })
  signed_keys: string[];

  @Column()
  status: TransactionStatus;

  @Column()
  threshold: number;
}
