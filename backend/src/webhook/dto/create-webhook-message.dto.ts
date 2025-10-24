import { IsString, IsBoolean, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWebhookMessageDto {
  @ApiProperty({ example: 'Exemple message_1760705215603' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Exemple message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: '+261377943048' })
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty({ example: '2025-10-17T15:46:55.603' })
  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  sent: boolean;

  @ApiProperty({ example: 'P2P_IN', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: '10000', required: false })
  @IsString()
  @IsOptional()
  amount?: string;

  @ApiProperty({ example: '50000', required: false })
  @IsString()
  @IsOptional()
  balance?: string;
}
