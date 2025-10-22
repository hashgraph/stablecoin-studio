import { ApiProperty } from '@nestjs/swagger';

export class WebhookMessageResponse {
  @ApiProperty()
  dbId: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  sender: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  sent: boolean;

  @ApiProperty()
  type: string;

  @ApiProperty({ required: false })
  amount: string;

  @ApiProperty({ required: false })
  balance: string;

  @ApiProperty()
  receivedAt: Date;
}

export class GetWebhookMessagesResponseDto {
  @ApiProperty({ type: [WebhookMessageResponse] })
  messages: WebhookMessageResponse[];

  @ApiProperty()
  total: number;
}
