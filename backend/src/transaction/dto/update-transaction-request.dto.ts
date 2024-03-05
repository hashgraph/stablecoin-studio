import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTransactionRequestDto {
  @IsNotEmpty()
  @IsString()
  signed_transaction_message: string;
  @IsNotEmpty()
  @IsString()
  public_key: string;
  constructor(signed_transaction_message: string, public_key: string) {
    this.signed_transaction_message = signed_transaction_message;
    this.public_key = public_key;
  }
}
