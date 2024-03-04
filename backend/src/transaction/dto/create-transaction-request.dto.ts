import { IsString, IsArray, ArrayNotEmpty, IsInt, Min } from 'class-validator';

export class CreateTransactionRequestDto {
  @IsString()
  transaction_message: string;

  @IsString()
  description: string;

  @IsString()
  hedera_account_id: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
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
