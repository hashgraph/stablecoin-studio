import { Controller, Post, Get, Body, Query, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Get all webhook messages with pagination' })
  @ApiResponse({ status: 200, type: GetWebhookMessagesResponseDto })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of messages per page (default: 50)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  async getMessages(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<GetWebhookMessagesResponseDto> {
    const result = await this.webhookService.findAll(limit || 50, page || 1);
    return result;
  }

  @Delete('messages')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all webhook messages' })
  @ApiResponse({ status: 204, description: 'All messages deleted' })
  async deleteAll() {
    await this.webhookService.deleteAll();
  }

  @Put('messages/reclassify')
  @ApiOperation({ summary: 'Reclassify all existing messages' })
  @ApiResponse({ status: 200, description: 'Messages reclassified successfully' })
  async reclassify() {
    const result = await this.webhookService.reclassifyAll();
    return {
      success: true,
      ...result,
    };
  }
}
