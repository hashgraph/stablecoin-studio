import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Transaction {
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
  key_list: string[];

  @Column('simple-array')
  remaining_keys: string[];

  @Column()
  status: 'SIGNED' | 'PENDING';

  @Column()
  threshold: number;
}
