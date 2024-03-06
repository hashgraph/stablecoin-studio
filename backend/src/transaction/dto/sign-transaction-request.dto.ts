import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignTransactionRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The signed transaction message',
    example: '0xd3c0de...',
    minLength: 10,
    required: true,
  })
  signed_transaction_message: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The public key used to sign the transaction',
    example: '0x1234...',
    required: true,
  })
  public_key: string;
  constructor(signed_transaction_message: string, public_key: string) {
    this.signed_transaction_message = signed_transaction_message;
    this.public_key = public_key;
  }
}
