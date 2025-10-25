import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookMessage } from './webhook-message.entity';
import { CreateWebhookMessageDto } from './dto/create-webhook-message.dto';
import { classifyMessage } from './utils/message-classifier';
import { extractAmount } from './utils/amount-extractor';
import { extractBalance } from './utils/balance-extractor';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookMessage)
    private webhookMessageRepository: Repository<WebhookMessage>,
  ) {}

  async create(createDto: CreateWebhookMessageDto): Promise<WebhookMessage> {
    const messageBody = createDto.message;
    
    const messageType = createDto.type || classifyMessage(messageBody);
    const messageAmount = createDto.amount || extractAmount(messageBody);
    const messageBalance = createDto.balance || extractBalance(messageBody);

    const message = this.webhookMessageRepository.create({
      id: createDto.id,
      body: messageBody,
      sender: createDto.sender,
      timestamp: new Date(createDto.timestamp),
      sent: createDto.sent,
      type: messageType,
      amount: messageAmount,
      balance: messageBalance,
    });

    return this.webhookMessageRepository.save(message);
  }

  async findAll(limit: number = 100, page: number = 1): Promise<{ messages: WebhookMessage[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await this.webhookMessageRepository.findAndCount({
      order: { receivedAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    const totalPages = Math.ceil(total / limit);

    return { messages, total, page, totalPages };
  }

  async findById(dbId: string): Promise<WebhookMessage> {
    return this.webhookMessageRepository.findOne({ where: { dbId } });
  }

  async deleteAll(): Promise<void> {
    await this.webhookMessageRepository.clear();
  }

  async reclassifyAll(): Promise<{ updated: number }> {
    const messages = await this.webhookMessageRepository.find();
    let updated = 0;

    for (const message of messages) {
      const newType = classifyMessage(message.body);
      const newAmount = extractAmount(message.body);
      const newBalance = extractBalance(message.body);
      
      if (message.type !== newType || message.amount !== newAmount || message.balance !== newBalance) {
        message.type = newType;
        message.amount = newAmount;
        message.balance = newBalance;
        await this.webhookMessageRepository.save(message);
        updated++;
      }
    }

    return { updated };
  }
}
