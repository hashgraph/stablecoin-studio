import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookMessage } from './webhook-message.entity';
import { CreateWebhookMessageDto } from './dto/create-webhook-message.dto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookMessage)
    private webhookMessageRepository: Repository<WebhookMessage>,
  ) {}

  async create(createDto: CreateWebhookMessageDto): Promise<WebhookMessage> {
    const message = this.webhookMessageRepository.create({
      id: createDto.id,
      body: createDto.message, // Store 'message' field as 'body'
      sender: createDto.sender,
      timestamp: new Date(createDto.timestamp),
      sent: createDto.sent,
    });

    return this.webhookMessageRepository.save(message);
  }

  async findAll(limit: number = 100): Promise<{ messages: WebhookMessage[]; total: number }> {
    const [messages, total] = await this.webhookMessageRepository.findAndCount({
      order: { receivedAt: 'DESC' },
      take: limit,
    });

    return { messages, total };
  }

  async findById(dbId: string): Promise<WebhookMessage> {
    return this.webhookMessageRepository.findOne({ where: { dbId } });
  }

  async deleteAll(): Promise<void> {
    await this.webhookMessageRepository.clear();
  }
}
