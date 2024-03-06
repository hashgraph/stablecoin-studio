import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class CreateTransactionRequestDto {
  @ApiProperty({
    description: 'The message to be signed by the keys',
    example: '0xd3c0de...',
    minLength: 10,
    required: true,
  })
  @IsString()
  transaction_message: string;

  @ApiProperty({
    description: 'A description of the transaction',
    example: 'This transaction is for the creation of a new StableCoin',
    minLength: 5,
    maxLength: 200,
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The Hedera Account ID used for this transaction',
    example: '0.0.12345',
    required: true,
  })
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message:
      'Hedera Account ID must be in the format shard.realm.account with each part being a number',
  })
  hedera_account_id: string;

  @ApiProperty({
    description: 'A list of public keys to be used for signing the transaction',
    example: ['0x1234...', '0x5678...'],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^0x[0-9a-fA-F]+$/, {
    each: true,
    message: 'Each key must be ED25519 or ECDSA',
  })
  key_list: string[];

  @ApiProperty({
    description: 'The number of keys required to sign the transaction',
    example: 1,
    default: 0, // KeyList with no threshold
    required: true,
  })
  @IsInt()
  @Min(0)
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
