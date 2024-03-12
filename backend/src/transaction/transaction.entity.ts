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
  private _transaction_message: string;

  @Column()
  description: string;

  @Column()
  hedera_account_id: string;

  @Column('text', { array: true })
  signatures: string[];

  @Column('text', { array: true })
  private _key_list: string[];

  @Column('text', { array: true })
  signed_keys: string[];

  @Column()
  status: TransactionStatus;

  @Column()
  threshold: number;

  set transaction_message(message: string) {
    this._transaction_message = message.startsWith('0x')
      ? message.slice(2)
      : message;
  }

  get transaction_message(): string {
    return this._transaction_message;
  }

  set key_list(keys: string[]) {
    this._key_list = keys.map((key) =>
      key.startsWith('0x') ? key.slice(2) : key,
    );
  }

  get key_list(): string[] {
    return this._key_list;
  }
}
