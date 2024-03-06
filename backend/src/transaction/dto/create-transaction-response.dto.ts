import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTransactionResponseDto {
  @ApiProperty({
    description: 'The transaction ID',
    example: '0x1234...',
    required: true,
  })
  @IsString()
  transactionId: string;

  constructor(transactionId: string) {
    this.transactionId = transactionId;
  }
}
