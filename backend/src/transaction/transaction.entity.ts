import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TransactionStatus {
  SIGNED = 'SIGNED',
  PENDING = 'PENDING',
}

@Entity()
export default class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    transformer: {
      to: (value: string) => (value.startsWith('0x') ? value.slice(2) : value),
      from: (value: string) => value,
    },
  })
  transaction_message: string;

  @Column()
  description: string;

  @Column()
  hedera_account_id: string;

  @Column('simple-array')
  signatures: string[];

  @Column({
    type: 'simple-array',
    transformer: {
      to: (value: string[]) => value.map(key => (key.startsWith('0x') ? key.slice(2) : key)),
      from: (value: string[]) => value,
    },
  })
  key_list: string[];

  @Column('simple-array')
  signed_keys: string[];

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @Column()
  threshold: number;
}
