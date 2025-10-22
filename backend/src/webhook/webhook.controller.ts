import { Controller, Post, Get, Body, Query, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { CreateWebhookMessageDto } from './dto/create-webhook-message.dto';
import { GetWebhookMessagesResponseDto } from './dto/get-webhook-messages-response.dto';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive webhook message' })
  @ApiResponse({ status: 200, description: 'Message received successfully' })
  async receiveMessage(@Body() createDto: CreateWebhookMessageDto) {
    const message = await this.webhookService.create(createDto);
    return {
      success: true,
      messageId: message.dbId,
      receivedAt: message.receivedAt,
    };
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get all webhook messages' })
  @ApiResponse({ status: 200, type: GetWebhookMessagesResponseDto })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMessages(@Query('limit') limit?: number): Promise<GetWebhookMessagesResponseDto> {
    const { messages, total } = await this.webhookService.findAll(limit || 100);
    return { messages, total };
  }

  @Delete('messages')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all webhook messages' })
  @ApiResponse({ status: 204, description: 'All messages deleted' })
  async deleteAll() {
    await this.webhookService.deleteAll();
  }
}
