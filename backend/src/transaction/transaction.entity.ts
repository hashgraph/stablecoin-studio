import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Network } from './network.enum';
import { TransactionStatus } from './status.enum';

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

  @Column({
    type: 'text',
    array: true,
    nullable: false,
  })
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

  @Column({
    type: 'enum',
    enum: Network,
    nullable: false,
  })
  network: Network;
}
