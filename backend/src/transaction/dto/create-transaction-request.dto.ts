import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class CreateTransactionRequestDto {
  @IsString()
  transaction_message: string;

  @IsString()
  description: string;

  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message:
      'Hedera Account ID must be in the format shard.realm.account with each part being a number',
  })
  hedera_account_id: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^0x[0-9a-fA-F]+$/, {
    each: true,
    message: 'Each key must be ED25519 or ECDSA',
  })
  key_list: string[];

  @IsInt()
  @Min(1)
  threshold: number;

  constructor(
    transaction_message: string,
    description: string,
    hedera_account_id: string,
    key_list: string[],
    threshold: number,
  ) {
    this.transaction_message = transaction_message;
    this.description = description;
    this.hedera_account_id = hedera_account_id;
    this.key_list = key_list;
    this.threshold = threshold;
  }
}
