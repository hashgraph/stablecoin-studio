import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TransactionStatus {
  SIGNED = 'SIGNED',
  PENDING = 'PENDING',
}

@Entity()
export default class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transaction_message: string;

  @Column()
  description: string;

  @Column()
  hedera_account_id: string;

  @Column('simple-array')
  signatures: string[];

  @Column({
    type: 'text',
    array: true,
    nullable: false,
  })
  key_list: string[];

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  signed_keys: string[];

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @Column()
  threshold: number;
}
